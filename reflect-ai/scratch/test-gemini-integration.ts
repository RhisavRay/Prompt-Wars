import { AI_CONFIG } from '../src/services/ai/config';
import { buildReflectionPrompt, SYSTEM_INSTRUCTION } from '../src/services/ai/prompts/index';
import { generateReflection, isGeminiActive } from '../src/services/ai/gemini/service';
import { AIServiceError } from '../src/services/ai/errors';
import type { ActiveUserMemory } from '../src/services/ai/types/index';

console.log('--- GEMINI CONFIGURATION & PIPELINE TESTING ---');

// 1. Check Configuration parsing
console.log('AI Model Configured:', AI_CONFIG.gemini.model);
console.log('Temperature:', AI_CONFIG.gemini.temperature);
console.log('Max Output Tokens:', AI_CONFIG.gemini.maxOutputTokens);
console.log('Timeout MS:', AI_CONFIG.gemini.timeoutMs);
console.log('Retry Count:', AI_CONFIG.gemini.retryCount);
console.log('API Key configured in environment:', isGeminiActive() ? 'YES' : 'NO (placeholder or missing)');

// 2. Check Prompt Builder
const mockMemory: ActiveUserMemory = {
  activeLifeEvents: ['Graduated from university'],
  ongoingChallenges: ['Adapting to a new work schedule'],
  importantPeople: ['Sarah', 'David'],
  recurringThemes: ['Work-life balance', 'Learning curve'],
  behaviouralObservations: ['User writes in detail when feeling overwhelmed'],
  communicationStyle: ['Thoughtful', 'Slightly anxious'],
  stableFacts: ['Living in Seattle', 'Software Engineer'],
  lastUpdated: new Date().toISOString(),
};

const userPrompt = buildReflectionPrompt(
  'Today was my first day at the new job. Met Sarah and David. The learning curve seems steep, but Seattle feels great.',
  'joy',
  mockMemory,
  '2026-07-08T00:00:00Z'
);

console.log('\n--- SYSTEM INSTRUCTION SNEAK PEEK ---');
console.log(SYSTEM_INSTRUCTION.substring(0, 150) + '...');

console.log('\n--- CONSTRUCTED PROMPT ---');
console.log(userPrompt);

// 3. Test generateReflection error handling when key is missing or is dummy
console.log('\n--- TESTING SERVICE PIPELINE CALL ---');
generateReflection(
  'I am feeling quite good today.',
  null,
  'peace'
)
  .then((res) => {
    console.log('API Call Success (Unexpected without active API key):', res);
  })
  .catch((err) => {
    if (err instanceof AIServiceError) {
      console.log('Service caught expected AIServiceError:');
      console.log(' - Code:', err.code);
      console.log(' - Message:', err.message);
    } else {
      console.error('Service caught unexpected error type:', err);
    }
  });
