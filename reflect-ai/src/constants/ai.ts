import type { Emotion } from '@/types/journal';

export const SUPPORTED_EMOTIONS: readonly Emotion[] = [
  'joy',
  'peace',
  'gratitude',
  'hopeful',
  'anxiety',
  'sadness',
  'frustration',
  'tired',
  'uncertain',
  'overwhelmed',
];

export const SUPPORTED_MEMORY_OPERATIONS = ['add', 'update', 'remove', 'archive', 'restore'] as const;

export type MemoryUpdateAction = (typeof SUPPORTED_MEMORY_OPERATIONS)[number];

export const AI_CONSTANTS = {
  maxJournalSummaryLength: 200,
  maxReflectionBodyLength: 1000,
  maxReflectionFollowUpQuestionLength: 300,
  themeLimit: 5,
  observationLimit: 4,
} as const;

