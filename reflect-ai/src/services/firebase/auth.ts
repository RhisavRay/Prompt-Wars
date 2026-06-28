/**
 * Firebase Authentication Service
 *
 * Encapsulates all Firebase Auth and Firestore user-document operations.
 * Called by the AuthContext — never directly from UI components.
 */

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './client';
import type { AppUser, UserDocument } from '@/types/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a Firebase User object to our lean AppUser shape.
 */
export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

// ---------------------------------------------------------------------------
// Firestore — user document
// ---------------------------------------------------------------------------

/**
 * Creates a Firestore user document on first login only.
 * Uses a get-then-set strategy to avoid overwriting existing documents.
 */
export async function createUserDocumentIfAbsent(user: User): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const document: Omit<UserDocument, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      onboardingCompleted: false,
    };

    await setDoc(ref, document);
  }
}

// ---------------------------------------------------------------------------
// Auth actions
// ---------------------------------------------------------------------------

/**
 * Triggers the Google sign-in popup and ensures a Firestore user record exists.
 */
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await createUserDocumentIfAbsent(result.user);
}

/**
 * Signs the current user out of Firebase Auth.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Re-export the auth instance so the context can subscribe to state changes
export { auth };
