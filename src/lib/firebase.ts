// Firebase configuration — connected to Dr.Joe project (dr-joe-for-sat)
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCZX2390lzngpNrqu5EZG-bAz9bjqKmXlY",
  authDomain: "dr-joe-for-sat.firebaseapp.com",
  projectId: "dr-joe-for-sat",
  storageBucket: "dr-joe-for-sat.firebasestorage.app",
  messagingSenderId: "459080493956",
  appId: "1:459080493956:web:2becd7cc767babd71dcbd1",
  measurementId: "G-NTVPQY8G51"
};

// Prevent re-initialization in Next.js hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Secondary App for Admin to create users without getting signed out
export const secondaryApp = getApps().find(a => a.name === 'AdminSecondary') || initializeApp(firebaseConfig, 'AdminSecondary');
export const secondaryAuth = getAuth(secondaryApp);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
