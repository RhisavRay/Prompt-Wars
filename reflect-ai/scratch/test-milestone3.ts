import * as fs from 'fs';
import * as path from 'path';

// 1. Load Environment Variables from .env.local synchronously before ANY local imports
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

// 2. Main test function
async function runAllTests() {
  console.log('--- INITIALIZING TEST PIPELINE AND FIREBASE CLIENT ---');

  // Dynamic imports to prevent ESModule hoisting before process.env is set
  const { orchestrationDeps, processNewJournal, processUpdatedJournal, processDeletedJournal } = await import('../src/services/ai/orchestration');
  const { applyMemoryUpdates } = await import('../src/services/ai/memory/applyUpdates');
  const { createEmptyActiveUserMemory } = await import('../src/services/ai/memory');
  
  type Journal = any;
  type ActiveUserMemory = any;
  type JournalMemory = any;

  // In-memory mock databases
  const journalsDb = new Map<string, Journal>();
  const journalMemoryDb = new Map<string, JournalMemory>();
  const reflectionDb = new Map<string, any>();
  const activeUserMemoryDb = new Map<string, ActiveUserMemory>();

  // Overriding orchestrator dependencies with mock implementations
  orchestrationDeps.updateAIStatus = async (uid: string, journalId: string, status: any, processedAt: Date | null = null) => {
    console.log(`[MOCK updateAIStatus] uid: ${uid}, journalId: ${journalId}, status: ${status}, processedAt: ${processedAt}`);
    const journal = journalsDb.get(journalId);
    if (journal) {
      journal.aiStatus = status;
      if (processedAt) {
        journal.aiProcessedAt = processedAt;
      }
      journalsDb.set(journalId, journal);
    }
  };

  orchestrationDeps.getJournal = async (uid: string, journalId: string) => {
    console.log(`[MOCK getJournal] uid: ${uid}, journalId: ${journalId}`);
    const journal = journalsDb.get(journalId);
    if (!journal) {
      throw new Error('Journal not found');
    }
    return journal;
  };

  orchestrationDeps.getActiveUserMemory = async (uid: string) => {
    console.log(`[MOCK getActiveUserMemory] uid: ${uid}`);
    return activeUserMemoryDb.get(uid) || null;
  };

  orchestrationDeps.saveActiveUserMemory = async (uid: string, memory: ActiveUserMemory) => {
    console.log(`[MOCK saveActiveUserMemory] uid: ${uid}, memory:`, memory);
    activeUserMemoryDb.set(uid, memory);
  };

  orchestrationDeps.initializeActiveUserMemory = async (uid: string) => {
    console.log(`[MOCK initializeActiveUserMemory] uid: ${uid}`);
    const empty = createEmptyActiveUserMemory();
    activeUserMemoryDb.set(uid, empty);
    return empty;
  };

  orchestrationDeps.saveJournalMemory = async (uid: string, journalId: string, memory: JournalMemory) => {
    console.log(`[MOCK saveJournalMemory] uid: ${uid}, journalId: ${journalId}, memory:`, memory);
    journalMemoryDb.set(journalId, memory);
  };

  orchestrationDeps.saveReflection = async (uid: string, journalId: string, reflection: any) => {
    console.log(`[MOCK saveReflection] uid: ${uid}, journalId: ${journalId}, reflection:`, reflection);
    reflectionDb.set(journalId, reflection);
  };

  orchestrationDeps.getJournalMemory = async (uid: string, journalId: string) => {
    console.log(`[MOCK getJournalMemory] uid: ${uid}, journalId: ${journalId}`);
    return journalMemoryDb.get(journalId) || null;
  };

  orchestrationDeps.deleteJournalMemory = async (uid: string, journalId: string) => {
    console.log(`[MOCK deleteJournalMemory] uid: ${uid}, journalId: ${journalId}`);
    journalMemoryDb.delete(journalId);
  };

  orchestrationDeps.deleteReflection = async (uid: string, journalId: string) => {
    console.log(`[MOCK deleteReflection] uid: ${uid}, journalId: ${journalId}`);
    reflectionDb.delete(journalId);
  };

  const uid = 'test-user-milestone3';

  console.log('--- STARTING MILESTONE 3 ORCHESTRATION VERIFICATION TESTS ---');

  // --- TEST 1: Pure Memory Updates Applicator ---
  console.log('\n--- TEST 1: Pure Memory Updates Applicator ---');
  const initialMemory: ActiveUserMemory = {
    activeLifeEvents: ['Starting a new job'],
    ongoingChallenges: ['Time management'],
    importantPeople: ['John'],
    recurringThemes: ['Work stress'],
    behaviouralObservations: ['Prefers writing in the morning'],
    communicationStyle: ['Concise'],
    stableFacts: ['Lives in New York'],
    lastUpdated: new Date().toISOString(),
  };

  const operations = [
    {
      operation: 'add' as const,
      target: 'importantPeople',
      payload: 'Alice',
      reason: 'User mentioned a new colleague named Alice.',
      confidence: 0.9,
    },
    {
      operation: 'update' as const,
      target: 'ongoingChallenges',
      payload: 'Time management and task prioritization',
      reason: 'User expanded on time management challenges.',
      confidence: 0.85,
    },
    {
      operation: 'remove' as const,
      target: 'recurringThemes',
      payload: 'Work stress',
      reason: 'No longer relevant.',
      confidence: 0.95,
    },
    {
      operation: 'archive' as const,
      target: 'activeLifeEvents',
      payload: 'Starting a new job',
      reason: 'Job startup phase is over.',
      confidence: 0.9,
    },
  ];

  const result = applyMemoryUpdates(initialMemory, operations);
  console.log('Updated Memory result:', result);

  const ok =
    result.importantPeople.includes('Alice') &&
    result.ongoingChallenges.includes('Time management and task prioritization') &&
    !result.ongoingChallenges.includes('Time management') &&
    !result.recurringThemes.includes('Work stress') &&
    !result.activeLifeEvents.includes('Starting a new job');

  if (ok) {
    console.log('Test 1: PASSED ✅');
  } else {
    console.error('Test 1: FAILED ❌');
    process.exit(1);
  }

  // --- TEST 2: processNewJournal Flow ---
  console.log('\n--- TEST 2: processNewJournal Flow ---');
  const journalInput: Journal = {
    id: 'journal-1',
    title: 'Reflect AI Sprint 3 Day 1',
    content: 'Today I started working on Reflect AI sprint 3. Met with Rhisav to align on requirements. The architecture looks clean. I feel hopeful about getting this milestone integrated correctly.',
    initialCheckIn: 'hopeful',
    createdAt: new Date(),
    updatedAt: new Date(),
    aiStatus: 'idle',
    aiProcessedAt: null,
  };

  journalsDb.set(journalInput.id, journalInput);

  console.log('Triggering processNewJournal...');
  await processNewJournal(uid, journalInput);

  const updatedJournal = journalsDb.get(journalInput.id);
  console.log('Journal AI status after execution:', updatedJournal?.aiStatus);
  console.log('AI Processed At:', updatedJournal?.aiProcessedAt);

  if (updatedJournal?.aiStatus !== 'completed' || !updatedJournal.aiProcessedAt) {
    console.error('Expected status to be completed and processedAt to be set. Got:', updatedJournal);
    process.exit(1);
  }

  console.log('Active User Memory after creation:', activeUserMemoryDb.get(uid));
  console.log('Journal Memory created:', journalMemoryDb.get(journalInput.id));
  console.log('Reflection created:', reflectionDb.get(journalInput.id));

  if (journalMemoryDb.has(journalInput.id) && reflectionDb.has(journalInput.id) && activeUserMemoryDb.has(uid)) {
    console.log('Test 2: PASSED ✅');
  } else {
    console.error('Test 2: FAILED ❌');
    process.exit(1);
  }

  // --- TEST 3: processUpdatedJournal Flow (Superseded version verification) ---
  console.log('\n--- TEST 3: processUpdatedJournal Flow ---');

  // Set the current journal in database to a newer date
  const latestJournalDbState = {
    ...journalInput,
    updatedAt: new Date(Date.now() + 10000), // Updated in database
  };
  journalsDb.set(journalInput.id, latestJournalDbState);

  console.log('Simulating outdated version check (AI processing started before latest update)...');
  const outdatedLocalCopy = {
    ...journalInput,
    content: 'Outdated edited content that should be discarded',
    updatedAt: journalInput.updatedAt, // Older than database state
  };

  await processUpdatedJournal(uid, outdatedLocalCopy);

  console.log('Checking status (should remain completed):', journalsDb.get(journalInput.id)?.aiStatus);
  console.log('Checking if summary remains original (not superseded):', journalMemoryDb.get(journalInput.id)?.summary);

  // Now, run with the actual latest updated state
  console.log('\nRunning valid update flow with latest version...');
  const validUpdatedJournal: Journal = {
    ...latestJournalDbState,
    content: 'Actually, we hit a roadblock. Rhisav requested strict error handling, and I am finding it hard to get schemas validated correctly. I feel anxiety and overwhelmed by the task complexity today.',
    initialCheckIn: 'anxiety',
  };
  journalsDb.set(journalInput.id, validUpdatedJournal);

  await processUpdatedJournal(uid, validUpdatedJournal);

  const finalUpdatedJournal = journalsDb.get(journalInput.id);
  console.log('Journal AI status after valid update:', finalUpdatedJournal?.aiStatus);
  console.log('New Journal Memory Summary:', journalMemoryDb.get(journalInput.id)?.summary);
  console.log('New Journal Memory Primary Emotion:', journalMemoryDb.get(journalInput.id)?.primaryEmotion);
  console.log('New Active User Memory state:', activeUserMemoryDb.get(uid));

  if (journalMemoryDb.get(journalInput.id)?.primaryEmotion === 'anxiety' && finalUpdatedJournal?.aiStatus === 'completed') {
    console.log('Test 3: PASSED ✅');
  } else {
    console.error('Test 3: FAILED ❌');
    process.exit(1);
  }

  // --- TEST 4: processDeletedJournal Flow ---
  console.log('\n--- TEST 4: processDeletedJournal Flow ---');

  console.log('Triggering processDeletedJournal...');
  await processDeletedJournal(uid, journalInput.id);

  console.log('JournalMemory document exists in DB:', journalMemoryDb.has(journalInput.id) ? 'YES' : 'NO (Expected)');
  console.log('Reflection document exists in DB:', reflectionDb.has(journalInput.id) ? 'YES' : 'NO (Expected)');
  console.log('Final Active User Memory state after deletion updates:', activeUserMemoryDb.get(uid));

  if (!journalMemoryDb.has(journalInput.id) && !reflectionDb.has(journalInput.id)) {
    console.log('Test 4: PASSED ✅');
  } else {
    console.error('Test 4: FAILED ❌');
    process.exit(1);
  }

  console.log('\nAll Milestone 3 tests completed successfully!');
}

runAllTests();
