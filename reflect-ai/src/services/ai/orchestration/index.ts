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

  try {
    // 1. Mark AI status as processing
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'processing');

    // 2. Fetch current ActiveUserMemory or initialize a default empty one
    let activeMemory = await orchestrationDeps.getActiveUserMemory(uid);
    if (!activeMemory) {
      activeMemory = await orchestrationDeps.initializeActiveUserMemory(uid);
    }

    // 3. Call Gemini to generate reflection and memory updates
    const result = await generateReflection(journal.content, activeMemory, journal.initialCheckIn);

    // 4. Before persisting, verify the journal was not updated or deleted in the meantime
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
    await orchestrationDeps.saveJournalMemory(uid, journal.id, result.journalMemory);
    await orchestrationDeps.saveReflection(uid, journal.id, result.reflection);

    // 6. Apply memory updates sequentially and save ActiveUserMemory
    const updatedMemory = applyMemoryUpdates(activeMemory, result.memoryUpdates);
    await orchestrationDeps.saveActiveUserMemory(uid, updatedMemory);

    // 7. Mark AI status as completed and set processed timestamp
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'completed', new Date());
  } catch (error) {
    console.error(`[AI Orchestrator ERROR] Failed processNewJournal for ${journal.id}:`, error);
    // Graceful degradation: Mark status as failed; do not let failure propagate to block client operations
    try {
      await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
    } catch (statusError) {
      console.error('[AI Orchestrator ERROR] Failed to set status to failed:', statusError);
    }
  }
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

  try {
    // 1. Mark AI status as processing
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'processing');

    // 2. Fetch current ActiveUserMemory
    let activeMemory = await orchestrationDeps.getActiveUserMemory(uid);
    if (!activeMemory) {
      activeMemory = await orchestrationDeps.initializeActiveUserMemory(uid);
    }

    // 3. Call Gemini to generate reflection and updates based on the new content
    const result = await generateReflection(journal.content, activeMemory, journal.initialCheckIn);

    // 4. Verify version-superseded constraints before modifying database
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
    await orchestrationDeps.saveJournalMemory(uid, journal.id, result.journalMemory);
    await orchestrationDeps.saveReflection(uid, journal.id, result.reflection);

    // 6. Apply memory updates sequentially and update ActiveUserMemory
    const updatedMemory = applyMemoryUpdates(activeMemory, result.memoryUpdates);
    await orchestrationDeps.saveActiveUserMemory(uid, updatedMemory);

    // 7. Mark AI status as completed and set processed timestamp
    await orchestrationDeps.updateAIStatus(uid, journal.id, 'completed', new Date());
  } catch (error) {
    console.error(`[AI Orchestrator ERROR] Failed processUpdatedJournal for ${journal.id}:`, error);
    try {
      await orchestrationDeps.updateAIStatus(uid, journal.id, 'failed');
    } catch (statusError) {
      console.error('[AI Orchestrator ERROR] Failed to set status to failed:', statusError);
    }
  }
}

/**
 * Coordinates AI processing and memory updates cleanup for a deleted journal.
 * Relies on the stored JournalMemory representation.
 *
 * @param uid - The authenticated user's ID
 * @param journalId - The deleted journal entry ID
 */
export async function processDeletedJournal(uid: string, journalId: string): Promise<void> {
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
