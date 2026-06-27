/**
 * Type declarations for Future Firestore and Authentication data structures
 */

export interface DbUserMetadata {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export interface DbJournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
