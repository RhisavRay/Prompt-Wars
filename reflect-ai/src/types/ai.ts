import type { Emotion } from './journal';
import type { MemoryUpdateAction } from '@/constants/ai';

export interface AiPromptTemplate {
  name: string;
  version: string;
  template: string;
  variables: string[];
}

export interface AiGenerationResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  modelName: string;
}

export interface EmotionalShift {
  readonly from: Emotion | null;
  readonly to: Emotion;
  readonly trigger: string;
}

export interface JournalMemory {
  readonly entryId: string;
  readonly summary: string;
  readonly primaryEmotion: Emotion | null;
  readonly secondaryEmotion: Emotion | null;
  readonly emotionalShift: EmotionalShift | null;
  readonly themes: readonly string[];
  readonly events: readonly string[];
  readonly peopleMentioned: readonly string[];
  readonly importantObservations: readonly string[];
  readonly createdAt: string; // ISO 8601 string
}

export interface ActiveUserMemory {
  readonly activeLifeEvents: readonly string[];
  readonly ongoingChallenges: readonly string[];
  readonly importantPeople: readonly string[];
  readonly recurringThemes: readonly string[];
  readonly behaviouralObservations: readonly string[];
  readonly communicationStyle: readonly string[];
  readonly stableFacts: readonly string[];
  readonly lastUpdated: string; // ISO 8601 string
}

export interface ArchiveMemory {
  readonly id: string;
  readonly userId: string;
  readonly archivedAt: string; // ISO 8601 string
  readonly reason: string;
  readonly snapshot: ActiveUserMemory;
}

export interface AIReflection {
  readonly body: string;
  readonly followUpQuestion: string;
}


export interface MemoryUpdateOperation {
  readonly operation: MemoryUpdateAction;
  readonly target: string;
  readonly payload: unknown;
  readonly reason: string;
  readonly confidence: number; // between 0 and 1
}

export interface ReflectionResult {
  readonly journalMemory: JournalMemory;
  readonly reflection: AIReflection;
  readonly memoryUpdates: readonly MemoryUpdateOperation[];
}
