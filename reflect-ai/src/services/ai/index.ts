/**
 * AI Service Integration Layer
 * Public entrypoint exposing service functions, memory helpers, and validators.
 */

export { isGeminiActive, generateReflection } from './gemini/service';
export { validateGeminiResponse } from './validators';
export { createEmptyActiveUserMemory } from './memory';
export * from './types';
