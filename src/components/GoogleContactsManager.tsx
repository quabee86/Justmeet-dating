import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Mail, Phone, RefreshCw, Trash2, 
  Send, CheckCircle, AlertCircle, Sparkles, Building, Calendar, 
  MapPin, ShieldCheck, Heart, ExternalLink, X, Plus
} from 'lucide-react';
import { GoogleContact, MatchProfile } from '../types';
import { 
  authenticateWithGoogleContacts, 
  fetchGoogleContacts, 
  createGoogleContact, 
  deleteGoogleContact, 
  getCachedAccessToken 
} from '../lib/contactsService';

interface GoogleContactsManagerProps {
  onAddMatchFromContact?: (newMatch: MatchProfile) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function GoogleContactsManager({ onAddMatchFromContact, onShowToast }: GoogleContactsManagerProps) {
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Invite modal state
  const [selectedInviteContact, setSelectedInviteContact] = useState<GoogleContact | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>('');

  // New contact modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newGivenName, setNewGivenName] = useState<string>('');
  const [newFamilyName, setNewFamilyName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [confirmingAdd, setConfirmingAdd] = useState<boolean>(false);

  // Delete confirmation modal state (Mandatory explicit confirmation for mutating/deleting user data)
  const [contactToDelete, setContactToDelete] = useState<GoogleContact | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const token = getCachedAccessToken();
    if (token) {
      setIsConnected(true);
      loadContacts(token);
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await authenticateWithGoogleContacts();
      setIsConnected(true);
      await loadContacts(accessToken);
      if (onShowToast) onShowToast('Connected to Google Contacts!', 'success');
    } catch (err: any) {
      console.error('Google Contacts Connection Error:', err);
      setError(err.message || 'Failed to authenticate with Google Contacts.');
      if (onShowToast) onShowToast(err.message || 'Failed to connect Google Contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoogleContacts(token);
      setContacts(data);
    } catch (err: any) {
      console.error('Fetch Contacts Error:', err);
      setError(err.message || 'Failed to load contacts from Google.');
      if (err.message?.includes('authentication required')) {
        setIsConnected(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGivenName.trim()) {
      setError('First name is required.');
      return;
    }

    if (!confirmingAdd) {
      // Prompt for confirmation before mutating
      setConfirmingAdd(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createGoogleContact({
        givenName: newGivenName.trim(),
        familyName: newFamilyName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim()
      });

      setContacts(prev => [created, ...prev]);
      setShowAddModal(false);
      setConfirmingAdd(false);
      setNewGivenName('');
      setNewFamilyName('');
      setNewEmail('');
      setNewPhone('');
      if (onShowToast) onShowToast(`Added ${created.name} to Google Contacts!`, 'success');
    } catch (err: any) {
      console.error('Create Contact Error:', err);
      setError(err.message || 'Failed to create contact.');
      if (onShowToast) onShowToast('Failed to create contact', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!contactToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGoogleContact(contactToDelete.resourceName);
      setContacts(prev => prev.filter(c => c.resourceName !== contactToDelete.resourceName));
      if (onShowToast) onShowToast(`Removed ${contactToDelete.name} from Google Contacts.`, 'info');
      setContactToDelete(null);
    } catch (err: any) {
      console.error('Delete Contact Error:', err);
      setError(err.message || 'Failed to delete contact.');
      if (onShowToast) onShowToast('Failed to delete contact', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenInvite = (contact: GoogleContact) => {
    setSelectedInviteContact(contact);
    setInviteMessage(`Hey ${contact.name.split(' ')[0]}! Join me on JustMeet Dating to connect, chat, and find great matches near us! https://justmeet.app`);
  };

  const handleSendInvite = () => {
    if (!selectedInviteContact) return;
    if (selectedInviteContact.email) {
      window.open(`mailto:${selectedInviteContact.email}?subject=${encodeURIComponent('Invitation to join JustMeet Dating')}&body=${encodeURIComponent(inviteMessage)}`, '_blank');
    }
    if (onShowToast) onShowToast(`Invitation sent to ${selectedInviteContact.name}!`, 'success');
    setSelectedInviteContact(null);
  };

  const handleImportAsMatch = (contact: GoogleContact) => {
    if (!onAddMatchFromContact) return;
    const newMatch: MatchProfile = {
      id: `google-contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: contact.name,
      age: 25,
      gender: contact.gender === 'female' ? 'female' : contact.gender === 'male' ? 'male' : 'female',
      bio: `Imported from Google Contacts${contact.organization ? ` • ${contact.organization}` : ''}. Looking for meaningful dates and conversations!`,
      location: contact.address || 'Nearby',
      occupation: contact.organization || 'Professional',
      interests: ['Coffee', 'Travel', 'Music', 'Google Contacts'],
      photoUrl: contact.photoUrl || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400`,
      isVerified: true,
      personality: 'Warm & Social',
      distance: 2,
      matchScore: 94,
      isFavorite: true,
      isOnline: true
    };

    onAddMatchFromContact(newMatch);
    if (onShowToast) onShowToast(`${contact.name} added as a potential match!`, 'success');
  };

  const filteredContacts = contacts.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.phone && c.phone.includes(query)) ||
      (c.organization && c.organization.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Official Google People API Integration</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Google Contacts Sync</h2>
            <p className="text-rose-100 text-sm max-w-xl">
              Connect your Google Contacts to invite friends, import connections as matches, or manage contact entries securely.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="gsi-material-button shadow-lg hover:shadow-xl transition-all scale-105 active:scale-95"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium">Sign in with Google</span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadContacts()}
                  disabled={loading}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-xl backdrop-blur-md flex items-center gap-2 transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync Contacts</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 font-semibold text-sm rounded-xl shadow-md flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Google Contacts Notice</p>
            <p className="text-amber-700">{error}</p>
          </div>
          {!isConnected && (
            <button
              onClick={handleConnect}
              className="px-3 py-1.5 bg-amber-600 text-white font-medium text-xs rounded-lg hover:bg-amber-700 transition shrink-0"
            >
              Re-authenticate
            </button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {!isConnected ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Connect Google Account</h3>
          <p className="text-gray-500 max-w-md mx-auto text-sm">
            Sign in with Google to grant permission to access your contacts. You can invite friends directly or import profile connections into JustMeet.
          </p>
          <div className="pt-2">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="gsi-material-button mx-auto shadow-md hover:shadow-lg transition-all"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-semibold">Sign in with Google</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contacts by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
              Total Contacts: <span className="font-bold text-gray-900">{contacts.length}</span>
            </div>
          </div>

          {/* Contacts List Grid */}
          {loading && contacts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-100 flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm font-medium">Fetching Google Contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 space-y-3">
              <Users className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-700">No contacts found</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                {searchQuery ? 'Try adjusting your search query.' : 'You can add new contacts to your Google Account directly above.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.resourceName}
                  className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {contact.photoUrl ? (
                            <img
                              src={contact.photoUrl}
                              alt={contact.name}
                              className="w-12 h-12 rounded-full object-cover border border-gray-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-400 to-pink-500 text-white font-bold flex items-center justify-center text-lg shadow-inner">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate group-hover:text-rose-600 transition">
                            {contact.name}
                          </h4>
                          {contact.organization && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                              <Building className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{contact.organization}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setContactToDelete(contact)}
                        className="text-gray-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                        title="Delete contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1 text-xs text-gray-600">
                      {contact.email && (
                        <div className="flex items-center gap-2 truncate text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center gap-2 truncate text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.birthday && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>Birthday: {contact.birthday}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-gray-100 mt-4 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenInvite(contact)}
                      className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Invite</span>
                    </button>
                    {onAddMatchFromContact && (
                      <button
                        onClick={() => handleImportAsMatch(contact)}
                        className="flex-1 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Match Suggest</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {selectedInviteContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedInviteContact(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Invite {selectedInviteContact.name}</h3>
                <p className="text-xs text-gray-500">{selectedInviteContact.email || 'Via direct message'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Invitation Message</label>
              <textarea
                rows={4}
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedInviteContact(null)}
                className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                className="px-5 py-2 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Invitation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Contact Modal with Explicit Confirmation Step */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setConfirmingAdd(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Add Google Contact</h3>
                <p className="text-xs text-gray-500">Saves directly to your connected Google Account</p>
              </div>
            </div>

            <form onSubmit={handleCreateContactSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newGivenName}
                    onChange={(e) => setNewGivenName(e.target.value)}
                    placeholder="e.g. Sarah"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={newFamilyName}
                    onChange={(e) => setNewFamilyName(e.target.value)}
                    placeholder="e.g. Connor"
                    className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full mt-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {confirmingAdd && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Confirmation required:</span> This will write a new entry into your real Google Account Contacts directory. Click "Confirm & Create" to proceed.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setConfirmingAdd(false);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 shadow-md flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>{confirmingAdd ? 'Confirm & Create' : 'Save Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (MANDATORY per Google Workspace Guidelines) */}
      {contactToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Contact?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Are you sure you want to permanently delete <strong className="text-gray-900">{contactToDelete.name}</strong> from your Google Contacts? This operation mutates your Google Account data and cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setContactToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteContact}
                disabled={isDeleting}
                className="px-5 py-2 bg-rose-600 text-white font-semibold text-sm rounded-xl hover:bg-rose-700 shadow-md flex items-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
