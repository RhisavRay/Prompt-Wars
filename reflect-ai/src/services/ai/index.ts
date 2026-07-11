/**
 * AI Service Integration Layer
 * Public entrypoint exposing service functions, memory helpers, and validators.
 */

export { isGeminiActive, generateReflection, generateDeletionUpdates } from './gemini/service';
export { validateGeminiResponse, validateDeletionResponse } from './validators';
export { createEmptyActiveUserMemory, applyMemoryUpdates } from './memory';
export { processNewJournal, processUpdatedJournal, processDeletedJournal } from './orchestration';
export * from './types';
