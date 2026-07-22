import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { GoogleContact } from '../types';

// In-memory cache for access token (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

const CONTACTS_SCOPES = [
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/contacts.other.readonly',
  'https://www.googleapis.com/auth/directory.readonly',
  'https://www.googleapis.com/auth/user.addresses.read',
  'https://www.googleapis.com/auth/user.birthday.read',
  'https://www.googleapis.com/auth/user.emails.read',
  'https://www.googleapis.com/auth/user.gender.read',
  'https://www.googleapis.com/auth/user.organization.read',
  'https://www.googleapis.com/auth/user.phonenumbers.read'
];

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function initContactsAuth(
  onSuccess?: (user: User, token: string) => void,
  onFailure?: () => void
) {
  return onAuthStateChanged(auth, (user) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onFailure) onFailure();
    }
  });
}

export async function authenticateWithGoogleContacts(): Promise<{ user: User; accessToken: string }> {
  if (isSigningIn) {
    throw new Error('Authentication is already in progress.');
  }

  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    CONTACTS_SCOPES.forEach((scope) => provider.addScope(scope));

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Could not acquire Google OAuth Access Token.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
}

export async function fetchGoogleContacts(accessTokenOverride?: string): Promise<GoogleContact[]> {
  const token = accessTokenOverride || cachedAccessToken;
  if (!token) {
    throw new Error('Google authentication required to access contacts.');
  }

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,addresses,birthdays,organizations,genders&pageSize=100';

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch contacts (${res.status})`);
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections.map((person: any) => {
    const primaryName = person.names?.[0]?.displayName || person.names?.[0]?.givenName || 'Unnamed Contact';
    const primaryEmail = person.emailAddresses?.[0]?.value || '';
    const primaryPhone = person.phoneNumbers?.[0]?.value || '';
    const photoUrl = person.photos?.[0]?.url || '';
    const address = person.addresses?.[0]?.formattedValue || '';
    const birthday = person.birthdays?.[0]?.date
      ? `${person.birthdays[0].date.year || ''}-${person.birthdays[0].date.month || ''}-${person.birthdays[0].date.day || ''}`
      : '';
    const organization = person.organizations?.[0]?.name || '';
    const gender = person.genders?.[0]?.value || '';

    return {
      resourceName: person.resourceName,
      etag: person.etag,
      name: primaryName,
      email: primaryEmail,
      phone: primaryPhone,
      photoUrl,
      address,
      birthday,
      organization,
      gender
    };
  });
}

export async function createGoogleContact(contactData: {
  givenName: string;
  familyName?: string;
  email?: string;
  phone?: string;
}): Promise<GoogleContact> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Google authentication required to create contact.');
  }

  const url = 'https://people.googleapis.com/v1/people:createContact';

  const body: any = {
    names: [
      {
        givenName: contactData.givenName,
        familyName: contactData.familyName || ''
      }
    ]
  };

  if (contactData.email) {
    body.emailAddresses = [{ value: contactData.email }];
  }

  if (contactData.phone) {
    body.phoneNumbers = [{ value: contactData.phone }];
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create contact (${res.status})`);
  }

  const person = await res.json();
  return {
    resourceName: person.resourceName,
    etag: person.etag,
    name: person.names?.[0]?.displayName || `${contactData.givenName} ${contactData.familyName || ''}`.trim(),
    email: person.emailAddresses?.[0]?.value || contactData.email || '',
    phone: person.phoneNumbers?.[0]?.value || contactData.phone || ''
  };
}

export async function deleteGoogleContact(resourceName: string): Promise<void> {
  const token = cachedAccessToken;
  if (!token) {
    throw new Error('Google authentication required to delete contact.');
  }

  const url = `https://people.googleapis.com/v1/${resourceName}:deleteContact`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to delete contact (${res.status})`);
  }
}
