import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './client';
import type { ActiveUserMemory } from '@/types/ai';
import { createEmptyActiveUserMemory } from '../ai/memory';

/**
 * Retrieves the ActiveUserMemory document for a user from Firestore.
 *
 * ActiveUserMemory is the evolving, live understanding of the user — accumulated
 * incrementally across all journal entries. It grows richer over time and is
 * updated after every AI processing cycle. It is always stored as a single document
 * and never versioned or archived directly from this service.
 *
 * Path: users/{uid}/activeUserMemory/active
 *
 * @param uid - The authenticated user's unique ID
 * @returns The ActiveUserMemory or null if not yet initialized
 */
export async function getActiveUserMemory(uid: string): Promise<ActiveUserMemory | null> {
  if (!uid) {
    throw new Error('User ID is required to fetch Active User Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'activeUserMemory', 'active');
  const snapshot = await getDoc(memoryDocRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as ActiveUserMemory;
}

/**
 * Persists the ActiveUserMemory document for a user in Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param memory - The ActiveUserMemory object to save
 */
export async function saveActiveUserMemory(uid: string, memory: ActiveUserMemory): Promise<void> {
  if (!uid) {
    throw new Error('User ID is required to save Active User Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'activeUserMemory', 'active');
  await setDoc(memoryDocRef, memory);
}

/**
 * Initializes and persists an empty ActiveUserMemory for a new user in Firestore.
 * Called when a user's AI processing cycle begins but no memory document exists yet.
 *
 * @param uid - The authenticated user's unique ID
 * @returns The initialized empty ActiveUserMemory object
 */
export async function initializeActiveUserMemory(uid: string): Promise<ActiveUserMemory> {
  const emptyMemory = createEmptyActiveUserMemory();
  await saveActiveUserMemory(uid, emptyMemory);
  return emptyMemory;
}
