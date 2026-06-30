import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  deleteField,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './client';
import type { Journal, CreateJournalInput, UpdateJournalInput, Emotion } from '@/types/journal';

/**
 * Maps a legacy mood string to the new Emotion type.
 * Returns null if the string is not recognized.
 */
function mapLegacyMood(mood: string): Emotion | null {
  const normalized = mood.trim().toLowerCase();
  
  const validEmotions: Record<string, Emotion> = {
    joy: 'joy',
    peace: 'peace',
    gratitude: 'gratitude',
    hopeful: 'hopeful',
    anxiety: 'anxiety',
    sadness: 'sadness',
    frustration: 'frustration',
    tired: 'tired',
    uncertain: 'uncertain',
    overwhelmed: 'overwhelmed',
  };
  
  if (normalized in validEmotions) {
    return validEmotions[normalized];
  }
  
  switch (normalized) {
    case 'happy':
    case 'excited':
      return 'joy';
    case 'calm':
    case 'peaceful':
      return 'peace';
    case 'grateful':
      return 'gratitude';
    case 'anxious':
      return 'anxiety';
    case 'sad':
      return 'sadness';
    case 'angry':
      return 'frustration';
    default:
      return null;
  }
}

/**
 * Helper to convert a Firestore document data to a typed Journal object.
 */
function mapDocToJournal(id: string, data: DocumentData): Journal {
  let initialCheckIn: Emotion | null = null;
  if (data.initialCheckIn !== undefined && data.initialCheckIn !== null) {
    initialCheckIn = mapLegacyMood(data.initialCheckIn);
  } else if (data.mood !== undefined && data.mood !== null) {
    initialCheckIn = mapLegacyMood(data.mood);
  }

  return {
    id,
    title: data.title || '',
    content: data.content || '',
    initialCheckIn,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
    
    // AI Metadata
    aiReflection: data.aiReflection ?? null,
    primaryEmotion: data.primaryEmotion !== undefined && data.primaryEmotion !== null ? mapLegacyMood(data.primaryEmotion) : null,
    secondaryEmotion: data.secondaryEmotion !== undefined && data.secondaryEmotion !== null ? mapLegacyMood(data.secondaryEmotion) : null,
    tertiaryEmotion: data.tertiaryEmotion !== undefined && data.tertiaryEmotion !== null ? mapLegacyMood(data.tertiaryEmotion) : null,
    emotionalShift: data.emotionalShift ?? null,
    themes: data.themes ?? null,
    processedAt: data.processedAt instanceof Timestamp ? data.processedAt.toDate() : null,
  };
}

/**
 * Creates a new journal entry in Firestore under users/{uid}/journals/{journalId}.
 *
 * @param uid - The authenticated user's unique ID
 * @param input - The title, content, and initial check-in for the journal entry
 * @returns The newly created Journal document with id and timestamps
 * @throws Error if arguments are invalid or Firestore write fails
 */
export async function createJournal(uid: string, input: CreateJournalInput): Promise<Journal> {
  if (!uid) {
    throw new Error('User ID is required to create a journal entry.');
  }
  if (!input.title.trim()) {
    throw new Error('Journal title cannot be empty.');
  }

  // Create a new reference with an auto-generated ID
  const journalsCollectionRef = collection(db, 'users', uid, 'journals');
  const newJournalDocRef = doc(journalsCollectionRef);

  const newDocData = {
    title: input.title,
    content: input.content,
    initialCheckIn: input.initialCheckIn !== undefined ? input.initialCheckIn : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(newJournalDocRef, newDocData);

  // Return the constructed Journal object
  return {
    id: newJournalDocRef.id,
    title: input.title,
    content: input.content,
    initialCheckIn: input.initialCheckIn !== undefined ? input.initialCheckIn : null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Retrieves a single journal entry by ID.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal document ID
 * @returns The Journal document
 * @throws Error if document does not exist, invalid arguments, or read fails
 */
export async function getJournal(uid: string, journalId: string): Promise<Journal> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to fetch a journal.');
  }

  const journalDocRef = doc(db, 'users', uid, 'journals', journalId);
  const snapshot = await getDoc(journalDocRef);

  if (!snapshot.exists()) {
    throw new Error(`Journal entry with ID ${journalId} not found.`);
  }

  return mapDocToJournal(snapshot.id, snapshot.data());
}

/**
 * Retrieves all journal entries for a user, ordered by creation date descending.
 *
 * @param uid - The authenticated user's unique ID
 * @returns Array of Journal documents
 * @throws Error if user ID is missing or read fails
 */
export async function getAllJournals(uid: string): Promise<Journal[]> {
  if (!uid) {
    throw new Error('User ID is required to fetch journal entries.');
  }

  const journalsCollectionRef = collection(db, 'users', uid, 'journals');
  const q = query(journalsCollectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => mapDocToJournal(docSnap.id, docSnap.data()));
}

/**
 * Updates a journal entry fields in Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal document ID
 * @param input - Fields to update (title, content, initialCheckIn)
 * @returns The updated Journal document
 * @throws Error if update fails, or if validation fails
 */
export async function updateJournal(
  uid: string,
  journalId: string,
  input: UpdateJournalInput
): Promise<Journal> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to update a journal.');
  }

  const journalDocRef = doc(db, 'users', uid, 'journals', journalId);

  const updateData: DocumentData = {
    updatedAt: serverTimestamp(),
    mood: deleteField(),
  };

  if (input.title !== undefined) {
    if (!input.title.trim()) {
      throw new Error('Journal title cannot be empty.');
    }
    updateData.title = input.title;
  }

  if (input.content !== undefined) {
    updateData.content = input.content;
  }

  if (input.initialCheckIn !== undefined) {
    updateData.initialCheckIn = input.initialCheckIn;
  }

  await updateDoc(journalDocRef, updateData);

  // Fetch and return the updated document to ensure we have the exact state
  return getJournal(uid, journalId);
}

/**
 * Deletes a journal entry from Firestore.
 *
 * @param uid - The authenticated user's unique ID
 * @param journalId - The journal document ID
 * @throws Error if deletion fails
 */
export async function deleteJournal(uid: string, journalId: string): Promise<void> {
  if (!uid || !journalId) {
    throw new Error('User ID and Journal ID are required to delete a journal.');
  }

  const journalDocRef = doc(db, 'users', uid, 'journals', journalId);
  await deleteDoc(journalDocRef);
}
