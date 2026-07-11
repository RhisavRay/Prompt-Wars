import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './client';
import type { JournalMemory, AIReflection } from '@/types/ai';

/**
 * Persists the JournalMemory directly at:
 *   users/{uid}/journals/{journalId}/journalMemory
 *
 * JournalMemory is an immutable snapshot of a single journal entry's distilled
 * state at the time it was last AI-processed. There is always exactly one current
 * JournalMemory per journal entry. No versioning or history is maintained here.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 * @param memory - The JournalMemory to save
 */
export async function saveJournalMemory(
  uid: string,
  journalId: string,
  memory: JournalMemory
): Promise<void> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to save Journal Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'journals', journalId, 'journalMemory', journalId);
  await setDoc(memoryDocRef, memory);
}

/**
 * Retrieves the JournalMemory for a journal entry from Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 * @returns The JournalMemory or null if not found
 */
export async function getJournalMemory(
  uid: string,
  journalId: string
): Promise<JournalMemory | null> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to fetch Journal Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'journals', journalId, 'journalMemory', journalId);
  const snapshot = await getDoc(memoryDocRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as JournalMemory;
}

/**
 * Deletes the JournalMemory for a journal entry from Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 */
export async function deleteJournalMemory(uid: string, journalId: string): Promise<void> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to delete Journal Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'journals', journalId, 'journalMemory', journalId);
  await deleteDoc(memoryDocRef);
}

/**
 * Persists the AIReflection directly at:
 *   users/{uid}/journals/{journalId}/reflection/{journalId}
 *
 * The Reflection is the single current AI-generated response for a journal entry.
 * There is always exactly one Reflection per journal entry. No versioning is maintained here.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 * @param reflection - The AIReflection to save
 */
export async function saveReflection(
  uid: string,
  journalId: string,
  reflection: AIReflection
): Promise<void> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to save AI Reflection.');
  }

  const reflectionDocRef = doc(db, 'users', uid, 'journals', journalId, 'reflection', journalId);
  await setDoc(reflectionDocRef, reflection);
}

/**
 * Deletes the AIReflection for a journal entry from Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 */
export async function deleteReflection(uid: string, journalId: string): Promise<void> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to delete AI Reflection.');
  }

  const reflectionDocRef = doc(db, 'users', uid, 'journals', journalId, 'reflection', journalId);
  await deleteDoc(reflectionDocRef);
}

/**
 * Retrieves the AIReflection for a journal entry from Firestore.
 * Returns null if the reflection has not yet been generated.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal entry ID
 * @returns The AIReflection or null if not found
 */
export async function getReflection(
  uid: string,
  journalId: string
): Promise<AIReflection | null> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to fetch AI Reflection.');
  }

  const reflectionDocRef = doc(db, 'users', uid, 'journals', journalId, 'reflection', journalId);
  const snapshot = await getDoc(reflectionDocRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as AIReflection;
}

