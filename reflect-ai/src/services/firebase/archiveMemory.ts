import { doc, setDoc } from 'firebase/firestore';
import { db } from './client';
import type { ArchiveMemory } from '@/types/ai';

/**
 * Persists an ArchiveMemory snapshot under users/{uid}/archiveMemory/{archiveId}.
 *
 * ArchiveMemory represents a historical snapshot of the user's memory state at
 * a significant point in time (e.g. when a major life event concludes). It is
 * an append-only collection — snapshots are written once and never mutated.
 *
 * ArchiveMemory is intentionally separate from ActiveUserMemory (which evolves
 * continuously) and JournalMemory (which is scoped to a single journal entry).
 *
 * Note: Archive writes are not part of the active processing workflow during
 * this milestone. This service exists only to define the persistence structure.
 * Archive retrieval and browsing will be implemented in a future milestone.
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
