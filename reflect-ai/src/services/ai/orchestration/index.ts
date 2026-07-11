import type { Journal } from '@/types/journal';
import * as journalService from '../../firebase/journal';
import * as memoryService from '../../firebase/memory';
import * as journalMemoryService from '../../firebase/journalMemory';
import { generateReflection, generateDeletionUpdates, applyMemoryUpdates } from '../index';

/**
 * Dependency injection wrapper for Firestore services to facilitate mock testing
 * in offline/non-authenticated CLI environments.
 */
export const orchestrationDeps = {
  updateAIStatus: journalService.updateAIStatus,
  getJournal: journalService.getJournal,
  getActiveUserMemory: memoryService.getActiveUserMemory,
  saveActiveUserMemory: memoryService.saveActiveUserMemory,
  initializeActiveUserMemory: memoryService.initializeActiveUserMemory,
  saveJournalMemory: journalMemoryService.saveJournalMemory,
  saveReflection: journalMemoryService.saveReflection,
  getJournalMemory: journalMemoryService.getJournalMemory,
  deleteJournalMemory: journalMemoryService.deleteJournalMemory,
  deleteReflection: journalMemoryService.deleteReflection,
};

/**
 * Orchestrator service to coordinate the complete AI reflection and memory updates workflow.
 * Exposes methods for handling creation, updates, and deletion of journal entries asynchronously.
 * Respects transaction boundaries, version checks, and sequential memory updates.
 */

/**
 * Coordinates AI processing for a newly created journal.
 *
 * @param uid - The authenticated user's ID
 * @param journal - The saved Journal object
 */
export async function processNewJournal(uid: string, journal: Journal): Promise<void> {
  const startingUpdatedAt = journal.updatedAt;
  console.log(`[AI Orchestrator] processNewJournal entry for journalId: ${journal.id}, uid: ${uid}`);

  try {
    // 1. Mark AI status as processing
    console.log("STEP 1 - updateAIStatus(processing)");
    console.log(`[AI Orchestrator] Setting AI status to 'processing' for journalId: ${journal.id}`);
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'processing');

    // 2. Fetch current ActiveUserMemory or initialize a default empty one
    console.log("STEP 2 - getActiveUserMemory");
    let activeMemory = await orchestrationDeps.getActiveUserMemory(uid);
    if (!activeMemory) {
      console.log("STEP 2A - initializeActiveUserMemory");
      activeMemory = await orchestrationDeps.initializeActiveUserMemory(uid);
    }

    // 3. Call Gemini to generate reflection and memory updates
    console.log("STEP 3 - generateReflection");
    const result = await generateReflection(journal.content, activeMemory, journal.initialCheckIn);

    // 4. Before persisting, verify the journal was not updated or deleted in the meantime
    console.log("STEP 4 - getJournal");
    let currentJournal: Journal;
    try {
      currentJournal = await orchestrationDeps.getJournal(uid, journal.id);
    } catch {
      // Document was deleted while we were running AI; discard results
      console.log(`[AI Orchestrator] Discarding reflection for deleted journal ${journal.id}`);
      return;
    }

    if (currentJournal.updatedAt.getTime() > startingUpdatedAt.getTime()) {
      console.log(`[AI Orchestrator] Discarding reflection for superseded journal ${journal.id}`);
      return;
    }

    // 5. Persist the outputs
    console.log("STEP 5 - saveJournalMemory");
    await orchestrationDeps.saveJournalMemory(uid, journal.id, result.journalMemory);

    console.log("STEP 6 - saveReflection");
    await orchestrationDeps.saveReflection(uid, journal.id, result.reflection);

    // 6. Apply memory updates sequentially and save ActiveUserMemory
    console.log("STEP 7 - saveActiveUserMemory");
    const updatedMemory = applyMemoryUpdates(activeMemory, result.memoryUpdates);
    await orchestrationDeps.saveActiveUserMemory(uid, updatedMemory);

    // 7. Mark AI status as completed and set processed timestamp
    console.log("STEP 8 - updateAIStatus(completed)");
    console.log(`[AI Orchestrator] Setting AI status to 'completed' for journalId: ${journal.id}`);
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'completed', new Date());

    console.log("STEP 9 - COMPLETE");
  }
  catch (error) {
    console.error('====================================');
    console.error('FULL ORCHESTRATOR ERROR');
    console.error(`Journal ID: ${journal.id}`);
    console.error(error);

    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:');
      console.error(error.stack);
    }

    console.error('====================================');

    // Still attempt to mark the journal as failed.
    try {
      console.log(
        `[AI Orchestrator] Setting AI status to 'failed' for journalId: ${journal.id}`
      );
      await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
    } catch (statusError) {
      console.error('====================================');
      console.error('FAILED TO UPDATE STATUS TO FAILED');
      console.error(statusError);

      if (statusError instanceof Error) {
        console.error('Message:', statusError.message);
        console.error('Stack:');
        console.error(statusError.stack);
      }

      console.error('====================================');
    }

    // TEMPORARY: rethrow so Next.js shows the real error
    throw error;
  }
  // catch (error) {
  //   console.error(`[AI Orchestrator ERROR] Failed processNewJournal for ${journal.id}:`, error);
  //   // Graceful degradation: Mark status as failed; do not let failure propagate to block client operations
  //   try {
  //     console.log(`[AI Orchestrator] Setting AI status to 'failed' for journalId: ${journal.id}`);
  //     await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
  //   } catch (statusError) {
  //     console.error('[AI Orchestrator ERROR] Failed to set status to failed:', statusError);
  //   }
  // }
}

/**
 * Coordinates AI processing for an edited/updated journal.
 * Re-analyzes the journal from scratch and replaces subcollection documents in-place
 * only after validation succeeds.
 *
 * @param uid - The authenticated user's ID
 * @param journal - The updated Journal object
 */
export async function processUpdatedJournal(uid: string, journal: Journal): Promise<void> {
  const startingUpdatedAt = journal.updatedAt;
  console.log(`[AI Orchestrator] processUpdatedJournal entry for journalId: ${journal.id}, uid: ${uid}`);

  try {
    // 1. Mark AI status as processing
    console.log("STEP 1 - updateAIStatus(processing)");
    console.log(`[AI Orchestrator] Setting AI status to 'processing' for journalId: ${journal.id}`);
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'processing');

    // 2. Fetch current ActiveUserMemory
    console.log("STEP 2 - getActiveUserMemory");
    let activeMemory = await orchestrationDeps.getActiveUserMemory(uid);
    if (!activeMemory) {
      console.log("STEP 2A - initializeActiveUserMemory");
      activeMemory = await orchestrationDeps.initializeActiveUserMemory(uid);
    }

    // 3. Call Gemini to generate reflection and updates based on the new content
    console.log("STEP 3 - generateReflection");
    const result = await generateReflection(journal.content, activeMemory, journal.initialCheckIn);

    // 4. Verify version-superseded constraints before modifying database
    console.log("STEP 4 - getJournal");
    let currentJournal: Journal;
    try {
      currentJournal = await orchestrationDeps.getJournal(uid, journal.id);
    } catch {
      console.log(`[AI Orchestrator] Discarding updated reflection for deleted journal ${journal.id}`);
      return;
    }

    if (currentJournal.updatedAt.getTime() > startingUpdatedAt.getTime()) {
      console.log(`[AI Orchestrator] Discarding updated reflection for superseded journal ${journal.id}`);
      return;
    }

    // 5. Save the new artifacts (replaces previous ones in-place)
    console.log("STEP 5 - saveJournalMemory");
    await orchestrationDeps.saveJournalMemory(uid, journal.id, result.journalMemory);

    console.log("STEP 6 - saveReflection");
    await orchestrationDeps.saveReflection(uid, journal.id, result.reflection);

    // 6. Apply memory updates sequentially and update ActiveUserMemory
    console.log("STEP 7 - saveActiveUserMemory");
    const updatedMemory = applyMemoryUpdates(activeMemory, result.memoryUpdates);
    await orchestrationDeps.saveActiveUserMemory(uid, updatedMemory);

    // 7. Mark AI status as completed and set processed timestamp
    console.log("STEP 8 - updateAIStatus(completed)");
    console.log(`[AI Orchestrator] Setting AI status to 'completed' for journalId: ${journal.id}`);
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'completed', new Date());

    console.log("STEP 9 - COMPLETE");
  }
  catch (error) {
    console.error('====================================');
    console.error('FULL ORCHESTRATOR ERROR (UPDATE)');
    console.error(`Journal ID: ${journal.id}`);
    console.error(error);

    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:');
      console.error(error.stack);
    }

    console.error('====================================');

    try {
      console.log(
        `[AI Orchestrator] Setting AI status to 'failed' for journalId: ${journal.id}`
      );
      await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
    } catch (statusError) {
      console.error('====================================');
      console.error('FAILED TO UPDATE STATUS TO FAILED');
      console.error(statusError);

      if (statusError instanceof Error) {
        console.error('Message:', statusError.message);
        console.error('Stack:');
        console.error(statusError.stack);
      }

      console.error('====================================');
    }

    // TEMPORARY
    throw error;
  }
  // catch (error) {
  //   console.error(`[AI Orchestrator ERROR] Failed processUpdatedJournal for ${journal.id}:`, error);
  //   try {
  //     console.log(`[AI Orchestrator] Setting AI status to 'failed' for journalId: ${journal.id}`);
  //     await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
  //   } catch (statusError) {
  //     console.error('[AI Orchestrator ERROR] Failed to set status to failed:', statusError);
  //   }
  // }
}

/**
 * Coordinates AI processing and memory updates cleanup for a deleted journal.
 * Relies on the stored JournalMemory representation.
 *
 * @param uid - The authenticated user's ID
 * @param journalId - The deleted journal entry ID
 */
export async function processDeletedJournal(uid: string, journalId: string): Promise<void> {
  console.log(`[AI Orchestrator] processDeletedJournal entry for journalId: ${journalId}, uid: ${uid}`);
  try {
    // 1. Fetch the stored JournalMemory to get the distilled representation before deleting it
    const storedMemory = await orchestrationDeps.getJournalMemory(uid, journalId);

    // 2. Delete JournalMemory and Reflection from Firestore
    await orchestrationDeps.deleteJournalMemory(uid, journalId);
    await orchestrationDeps.deleteReflection(uid, journalId);

    // 3. If there was no prior JournalMemory, no memory cleanup is needed
    if (!storedMemory) {
      return;
    }

    // 4. Fetch the current ActiveUserMemory
    const activeMemory = await orchestrationDeps.getActiveUserMemory(uid);
    if (!activeMemory) {
      return;
    }

    // 5. Query Gemini to generate removal operations using JournalMemory context
    const proposedUpdates = await generateDeletionUpdates(storedMemory, activeMemory);

    if (proposedUpdates.length > 0) {
      // 6. Apply removal operations sequentially and save ActiveUserMemory
      const updatedMemory = applyMemoryUpdates(activeMemory, proposedUpdates);
      await orchestrationDeps.saveActiveUserMemory(uid, updatedMemory);
    }
  } catch (error) {
    console.error(`[AI Orchestrator ERROR] Failed processDeletedJournal for ${journalId}:`, error);
  }
}
