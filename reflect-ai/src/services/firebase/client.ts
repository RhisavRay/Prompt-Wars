import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase App for Server-Side Rendering (SSR) compatibility
// Ensures we reuse the existing app instance if already initialized.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Core Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
