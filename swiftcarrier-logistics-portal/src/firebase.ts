import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

export let db: Firestore | null = null;
export let auth: Auth | null = null;
export let firebaseEnabled = false;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Auth
    auth = getAuth(app);
    
    try {
      // Force experimental HTTP long-polling to prevent websocket handshake blockage in container proxies or inside sandboxed frames
      db = initializeFirestore(app, {
        experimentalForceLongPolling: true
      }, firebaseConfig.firestoreDatabaseId);
      console.log("Firebase App & Firestore initialized statically with Force Long Polling, Database ID:", firebaseConfig.firestoreDatabaseId);
    } catch (e) {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
      console.warn("Fallback to standard getFirestore registry due to reuse/duplicate instantiation error:", e);
    }
    
    firebaseEnabled = true;

    // Validate the active connection as required by rules
    getDocFromServer(doc(db, 'test', 'connection')).then(() => {
      console.log("Firestore validation request succeeded. Connection established fully.");
    }).catch((err) => {
      console.warn("Firestore validation request skipped or offline: this is expected on first launch until traffic clears.", err);
    });
  }
} catch (err) {
  console.error("Static Firebase initialization failed, trying dyn fallback:", err);
}

export async function initializeFirebase(): Promise<{ db: Firestore | null; auth: Auth | null; firebaseEnabled: boolean }> {
  return { db, auth, firebaseEnabled };
}


