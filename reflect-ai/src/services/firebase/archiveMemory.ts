import { doc, setDoc } from 'firebase/firestore';
import { db } from './client';
import type { ArchiveMemory } from '@/types/ai';

/**
 * Persists an ArchiveMemory snapshot under users/{uid}/archiveMemory/{archiveId}.
 * Note: Archive memory writes and operations are not implemented in the active workflow
 * during this milestone; this service exists only to define the persistence structure.
 *
 * @param uid - The authenticated user's unique ID
 * @param archive - The ArchiveMemory structure containing snapshot metadata
 */
export async function saveArchiveMemory(uid: string, archive: ArchiveMemory): Promise<void> {
  if (!uid) {
    throw new Error('User ID is required to save Archive Memory.');
  }
  if (!archive.id) {
    throw new Error('Archive ID is required to save Archive Memory.');
  }

  const archiveDocRef = doc(db, 'users', uid, 'archiveMemory', archive.id);
  await setDoc(archiveDocRef, archive);
}
