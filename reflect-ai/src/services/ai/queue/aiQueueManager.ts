/**
 * AI Queue Manager
 *
 * Singleton FIFO queue that serializes AI orchestration jobs so that only one
 * job is active at a time.
 *
 * Architecture:
 *   AIQueueManager
 *       │
 *       ▼
 *   QueueStorage (interface)
 *       │
 *       ▼
 *   MemoryQueueStorage  ← current implementation
 *
 * The manager communicates exclusively through the QueueStorage interface.
 * To switch to a persistent backend (Firestore, Redis, Cloud Tasks, etc.)
 * in a future milestone, replace the QueueStorage instance — no changes
 * to this file or to the API route are required.
 *
 * Processing model:
 *   enqueueJob()
 *     1. Writes aiStatus = 'queued' to Firestore (for 'new' and 'update' jobs only)
 *     2. Pushes the job to the storage tail
 *     3. Starts the worker if it is currently idle
 *
 *   processNext()  [private, runs detached from the HTTP request lifecycle]
 *     1. Pops the head job from storage
 *     2. Sets job.startedAt
 *     3. Dispatches to the correct orchestrator function
 *        (the orchestrator writes 'processing' itself as its own STEP 1)
 *     4. Sets job.finishedAt and logs the processing duration
 *     5. Calls processNext() again to drain the next queued job
 *
 * Scope (Sprint 4 Milestone 1):
 *   - In-memory only; state does NOT survive server restarts
 *   - No retry logic, no backoff, no rate-limit handling
 *   - No persistent queue; those are deferred to future milestones
 */

import type { QueueStorage, AIJob, AIJobAction } from './types';
import type { Journal } from '@/types/journal';
import { MemoryQueueStorage } from './memoryQueueStorage';
import {
  processNewJournal,
  processUpdatedJournal,
  processDeletedJournal,
} from '../orchestration';
import { orchestrationDeps } from '../orchestration';

// ─── Singleton Storage Instance ───────────────────────────────────────────────
// Using a module-level variable gives us one shared queue per Node.js process.
// The storage variable is typed as the interface so the manager never couples
// to the concrete class directly.
const storage: QueueStorage = new MemoryQueueStorage();

// ─── Worker State ─────────────────────────────────────────────────────────────
// A single flag is sufficient because all JS runs on one thread — no lock needed.
let isProcessing = false;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enqueues an AI processing job.
 *
 * For 'new' and 'update' actions:
 *   - Immediately writes aiStatus = 'queued' to Firestore so the client can
 *     display a queued indicator without waiting for the worker.
 *
 * For 'delete' actions:
 *   - Does NOT write a Firestore status (the journal document is being removed).
 *   - The job is still placed in the queue so deletes are serialized alongside
 *     new/update jobs and cannot race against ActiveUserMemory writes.
 *
 * Returns immediately — orchestration runs in the background.
 */
export async function enqueueJob(params: {
  uid: string;
  journalId: string;
  action: AIJobAction;
  journal?: Journal;
}): Promise<void> {
  const job: AIJob = {
    uid: params.uid,
    journalId: params.journalId,
    action: params.action,
    journal: params.journal,
    enqueuedAt: new Date(),
  };

  // Write 'queued' status to Firestore immediately so the client reflects it.
  // Skip for delete — the document is about to be removed.
  if (job.action !== 'delete') {
    try {
      await orchestrationDeps.updateAIStatus(job.uid, job.journalId, 'queued');
    } catch (err) {
      // Non-fatal: if we can't set queued, still enqueue and process.
      console.error(
        `[AI Queue] Failed to set 'queued' status for journalId=${job.journalId}:`,
        err
      );
    }
  }

  storage.push(job);

  const queueLength = storage.size();
  console.log(
    `[AI Queue] Job enqueued — action=${job.action}, journalId=${job.journalId}, uid=${job.uid}, enqueuedAt=${job.enqueuedAt.toISOString()}`
  );
  console.log(`[AI Queue] Queue length: ${queueLength}`);

  // Kick off the worker only if it is currently idle.
  // If isProcessing is true, the worker will drain this job automatically when
  // it finishes the current one.
  if (!isProcessing) {
    processNext();
  }
}

// ─── Internal Worker ──────────────────────────────────────────────────────────

/**
 * Dequeues and processes the next job in FIFO order.
 *
 * This function is intentionally fire-and-forget from the caller's perspective.
 * It sets isProcessing = true, runs the job, then calls itself recursively to
 * drain the next queued item. When the queue is empty it sets isProcessing = false
 * and exits.
 *
 * Error handling: if the orchestrator throws, the error is caught here so the
 * queue continues draining. The orchestrator itself is responsible for writing
 * 'failed' to Firestore before throwing.
 */
function processNext(): void {
  const job = storage.shift();

  if (!job) {
    isProcessing = false;
    return;
  }

  isProcessing = true;

  // Attach timing metadata and run the job asynchronously.
  void (async () => {
    job.startedAt = new Date();

    console.log(
      `[AI Queue] Starting job — action=${job.action}, journalId=${job.journalId}, uid=${job.uid}, startedAt=${job.startedAt.toISOString()}`
    );

    // The orchestrators (processNewJournal, processUpdatedJournal) write
    // 'processing' themselves as their own STEP 1 — no pre-flight write needed here.
    // Delete jobs have no Firestore status to update.
    try {
      switch (job.action) {
        case 'new':
          if (!job.journal) {
            throw new Error(
              `[AI Queue] 'new' job for journalId=${job.journalId} is missing the journal object`
            );
          }
          await processNewJournal(job.uid, job.journal);
          break;

        case 'update':
          if (!job.journal) {
            throw new Error(
              `[AI Queue] 'update' job for journalId=${job.journalId} is missing the journal object`
            );
          }
          await processUpdatedJournal(job.uid, job.journal);
          break;

        case 'delete':
          await processDeletedJournal(job.uid, job.journalId);
          break;

        default: {
          // TypeScript exhaustiveness guard
          const _exhaustive: never = job.action;
          console.error(`[AI Queue] Unknown action: ${_exhaustive}`);
        }
      }
    } catch (err) {
      // The orchestrator already wrote 'failed' to Firestore before throwing.
      // Log the error here so queue-level context is captured alongside it.
      console.error(
        `[AI Queue] Job failed — action=${job.action}, journalId=${job.journalId}:`,
        err
      );
    } finally {
      job.finishedAt = new Date();
      const durationMs = job.startedAt
        ? job.finishedAt.getTime() - job.startedAt.getTime()
        : 0;

      console.log(
        `[AI Queue] Finished job — action=${job.action}, journalId=${job.journalId}, finishedAt=${job.finishedAt.toISOString()}, durationMs=${durationMs}`
      );
      console.log(`[AI Queue] Queue length after finish: ${storage.size()}`);

      // Drain the next job regardless of success or failure.
      processNext();
    }
  })();
}
