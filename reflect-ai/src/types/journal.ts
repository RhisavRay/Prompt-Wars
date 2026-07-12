export type Emotion =
  | 'joy'
  | 'peace'
  | 'gratitude'
  | 'hopeful'
  | 'anxiety'
  | 'sadness'
  | 'frustration'
  | 'tired'
  | 'uncertain'
  | 'overwhelmed';

export type AIStatus =
  | 'idle'
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'waiting_retry'; // reserved — not used until a future milestone

export interface Journal {
  id: string;
  title: string;
  content: string;
  initialCheckIn: Emotion | null;
  createdAt: Date;
  updatedAt: Date;

  // AI Metadata fields
  aiReflection?: string | null;
  primaryEmotion?: Emotion | null;
  secondaryEmotion?: Emotion | null;
  tertiaryEmotion?: Emotion | null;
  emotionalShift?: string | null;
  themes?: string[] | null;
  processedAt?: Date | null;
  
  // AI Status tracking
  aiStatus?: AIStatus | null;
  aiProcessedAt?: Date | null;
}

export interface CreateJournalInput {
  title: string;
  content: string;
  initialCheckIn?: Emotion | null;
}

export interface UpdateJournalInput {
  title?: string;
  content?: string;
  initialCheckIn?: Emotion | null;
}

