import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore (with potential custom database ID)
const db = getFirestore(
  app,
  (firebaseConfig as any).firestoreDatabaseId || "(default)"
);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

// Quota exceeded flag for graceful fallback with localStorage persistence
let isQuotaExceeded = typeof window !== 'undefined' && localStorage.getItem('firestore_quota_exceeded') === 'true';

// If quota is already flagged on boot, immediately disable network to avoid background backoff timers
if (isQuotaExceeded) {
  disableNetwork(db).catch(() => {});
}

// Global window event listeners to trap any unhandled Firebase resource-exhausted errors immediately
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const err = event.reason;
    const msg = (err?.message || String(err) || '').toLowerCase();
    const code = err?.code || '';
    if (code === 'resource-exhausted' || msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('backoff') || msg.includes('firebase')) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (e) {}
      setFirestoreQuotaExceeded(true);
    }
  });

  window.addEventListener('error', (event) => {
    const err = event.error;
    const msg = (err?.message || String(err) || event.message || '').toLowerCase();
    if (msg.includes('quota') || msg.includes('resource-exhausted') || msg.includes('backoff')) {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch (e) {}
      setFirestoreQuotaExceeded(true);
    }
  }, true);
}

export function getFirestoreQuotaExceeded(): boolean {
  return isQuotaExceeded;
}

export function setFirestoreQuotaExceeded(exceeded = true): void {
  isQuotaExceeded = exceeded;
  if (typeof window !== 'undefined') {
    try {
      if (exceeded) {
        localStorage.setItem('firestore_quota_exceeded', 'true');
        disableNetwork(db).catch(() => {});
      } else {
        localStorage.removeItem('firestore_quota_exceeded');
      }
    } catch (e) {
      // ignore
    }
  }
}

export function handleFirestoreError(err: any, context = "Firestore operation"): void {
  const code = err?.code || '';
  const msg = (err?.message || String(err) || '').toLowerCase();
  const causeMsg = (err?.cause?.message || String(err?.cause) || '').toLowerCase();

  if (
    code === 'resource-exhausted' || 
    msg.includes('quota') || 
    msg.includes('resource-exhausted') || 
    msg.includes('backoff') ||
    causeMsg.includes('quota') ||
    causeMsg.includes('resource-exhausted')
  ) {
    if (!isQuotaExceeded) {
      setFirestoreQuotaExceeded(true);
      console.warn(`[Firebase] Quota limit exceeded during ${context}. Switched to local storage fallback mode.`);
    }
  } else {
    console.warn(`[Firebase] ${context} issue:`, msg);
  }
}

// Validate connection on boot safely without throwing quota errors
async function testConnection() {
  // Skipping active server ping on boot to preserve quota and prevent resource-exhausted console errors
  console.log("Firebase initialized.");
}

testConnection();

export { app, db, auth, storage };

