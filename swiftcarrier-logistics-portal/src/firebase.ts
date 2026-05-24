import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export let db: Firestore | null = null;
export let firebaseEnabled = false;

try {
  if (firebaseConfig && firebaseConfig.apiKey) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    firebaseEnabled = true;
    console.log("Firebase App & Firestore initialized statically with Database ID:", firebaseConfig.firestoreDatabaseId);
  }
} catch (err) {
  console.error("Static Firebase initialization failed, trying dyn fallback:", err);
}

export async function initializeFirebase(): Promise<{ db: Firestore | null; firebaseEnabled: boolean }> {
  return { db, firebaseEnabled };
}
