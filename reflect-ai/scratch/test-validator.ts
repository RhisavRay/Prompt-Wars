import { validateGeminiResponse } from '../src/services/ai/validators/index';

const mockValidResponse = JSON.stringify({
  journalMemory: {
    summary: 'Feeling excited about starting a new project but also a bit nervous.',
    primaryEmotion: 'joy',
    secondaryEmotion: 'anxiety',
    emotionalShift: {
      from: 'anxiety',
      to: 'joy',
      trigger: 'Remembered the potential of the project',
    },
    themes: ['Career', 'Creativity'],
    events: ['Started Sprint 03'],
    peopleMentioned: ['Team'],
    importantObservations: ['User tends to feel excited when learning new things.'],
  },
  reflection: {
    body: 'It seems you are embarking on an exciting journey. While nervousness is natural...',
    followUpQuestion: 'What is the most exciting part of this new chapter?',
  },
  memoryUpdates: [
    {
      operation: 'add',
      target: 'activeLifeEvents',
      payload: 'Started Sprint 03',
      reason: 'User explicitly mentioned this event',
      confidence: 0.95,
    },
  ],
});

const mockInvalidResponseJson = 'invalid-json';

const mockInvalidResponseStructure = JSON.stringify({
  journalMemory: {
    // Missing required summary, themes, etc.
    primaryEmotion: 'joy',
  },
  reflection: {
    body: '', // Empty but valid type, but missing followUpQuestion
  },
  memoryUpdates: [
    {
      operation: 'invalid-op', // Invalid operation enum
      target: 'activeLifeEvents',
      payload: 'test',
      reason: 'test',
      confidence: 1.5, // Invalid confidence (> 1)
    },
  ],
});

const mockResponseWithUnknownProp = JSON.stringify({
  journalMemory: {
    summary: 'A short summary',
    primaryEmotion: 'joy',
    secondaryEmotion: null,
    themes: [],
    events: [],
    peopleMentioned: [],
    importantObservations: [],
    unknownField: 'something', // Unknown field
  },
  reflection: {
    title: 'Reflection Title', // Now title is an unknown property!
    body: 'Reflection Body',
    followUpQuestion: 'Question?',
  },
  memoryUpdates: [],
  extraFieldAtRoot: 'should-fail', // Unknown field at root
});

console.log('--- RUNNING VALIDATOR TESTS ---');

const res1 = validateGeminiResponse(mockValidResponse);
console.log('Test 1 (Valid Response):', res1.success ? 'PASSED ✅' : 'FAILED ❌');
if (!res1.success) {
  console.log('Errors:', res1.errors);
}

const res2 = validateGeminiResponse(mockInvalidResponseJson);
console.log('Test 2 (Invalid JSON):', !res2.success ? 'PASSED ✅' : 'FAILED ❌');
if (!res2.success) {
  console.log('Expected failure reason:', res2.errors[0]);
}

const res3 = validateGeminiResponse(mockInvalidResponseStructure);
console.log('Test 3 (Invalid Structure/Enum/Range):', !res3.success ? 'PASSED ✅' : 'FAILED ❌');
if (!res3.success) {
  console.log('Expected errors:', res3.errors);
}

const res4 = validateGeminiResponse(mockResponseWithUnknownProp);
console.log('Test 4 (Unknown Properties):', !res4.success ? 'PASSED ✅' : 'FAILED ❌');
if (!res4.success) {
  console.log('Expected errors:', res4.errors);
}
