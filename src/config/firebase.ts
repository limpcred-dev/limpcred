import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB6_Kt7SDOmsB_WQLv--wTOPzrjZavN7t0",
  authDomain: "limpcred-app.firebaseapp.com",
  projectId: "limpcred-app",
  storageBucket: "limpcred-app.firebasestorage.app",
  messagingSenderId: "1092443961941",
  appId: "1:1092443961941:web:8f02e96eac71434cd032dc"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Verify initialization
if (!auth || !db || !storage) {
  throw new Error('Failed to initialize Firebase services');
}