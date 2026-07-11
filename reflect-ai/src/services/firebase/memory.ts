import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './client';
import type { ActiveUserMemory } from '@/types/ai';
import { createEmptyActiveUserMemory } from '../ai/memory';

/**
 * Retrieves the ActiveUserMemory for a user from Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @returns The ActiveUserMemory or null if not initialized
 */
export async function getActiveUserMemory(uid: string): Promise<ActiveUserMemory | null> {
  if (!uid) {
    throw new Error('User ID is required to fetch Active User Memory.');
  }

  const memoryDocRef = doc(db, 'users', uid, 'activeUserMemory', 'active');
  // Wait, should the path be users/{userId}/activeUserMemory as a document, or users/{userId}/activeUserMemory/active?
  // Let's look at the ADR and implementation plan. 
  // In the implementation plan, we proposed:
  // users/{userId}/activeUserMemory  <- one document per user
  // Wait, in Firestore, you cannot have a document directly as a child of users/{userId} if it's named activeUserMemory, unless it's a field, OR activeUserMemory is a document under users/{userId}.
  // Yes! users/{userId} is a document. In Firestore, a document can have subcollections, but a document itself cannot contain another nested document unless it is a subcollection or a field.
  // Wait! A document path has an even number of segments.
  // users (collection, 1) -> {userId} (document, 2)
  // If we want activeUserMemory to be a document, it must be a subcollection or a field.
  // Wait! If it's a subcollection, it would be:
  // users/{userId}/activeUserMemory/{documentId}
  // Let's use 'active' as the document ID for simplicity, so the path is:
  // users/{userId}/activeUserMemory/active
  // Yes, that makes it a document inside a subcollection!
  // Wait, let's check: "users/{userId}/activeUserMemory - one document per user (live, evolves over time)".
  // If we store it as users/{userId} with field activeUserMemory, that's also possible, but it's cleaner to use a separate document inside a subcollection or a nested field.
  // Wait! Let's store it as users/{userId}/activeUserMemory/active. This is a very clean and standard Firestore subcollection document pattern.
  // Let's use users/{userId}/activeUserMemory/active.
  const snapshot = await getDoc(memoryDocRef);
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as ActiveUserMemory;
}

/**
 * Persists the ActiveUserMemory for a user in Firestore.
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
 *
 * @param uid - The authenticated user's unique ID
 * @returns The initialized ActiveUserMemory object
 */
export async function initializeActiveUserMemory(uid: string): Promise<ActiveUserMemory> {
  const emptyMemory = createEmptyActiveUserMemory();
  await saveActiveUserMemory(uid, emptyMemory);
  return emptyMemory;
}
