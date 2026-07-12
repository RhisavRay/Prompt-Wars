/**
 * AI Queue — Core Types
 *
 * Defines the job data model and the storage abstraction used by the
 * AIQueueManager. Keeping these separate from the manager itself ensures
 * the manager never imports a concrete storage implementation directly.
 */

import type { Journal } from '@/types/journal';

// ─── Job Model ────────────────────────────────────────────────────────────────

export type AIJobAction = 'new' | 'update' | 'delete';

/**
 * A single unit of AI work placed into the processing queue.
 *
 * Metadata fields:
 *   enqueuedAt  — populated immediately when the job is enqueued
 *   startedAt   — populated by the worker just before processing begins
 *   finishedAt  — populated by the worker after the job settles (success or failure)
 */
export interface AIJob {
  /** Authenticated user ID */
  readonly uid: string;
  /** Firestore journal document ID */
  readonly journalId: string;
  /** Which orchestration path to dispatch to */
  readonly action: AIJobAction;
  /**
   * Full journal object — required for 'new' and 'update' actions.
   * Undefined for 'delete' actions (journalId is sufficient).
   */
  readonly journal?: Journal;
  /** Wall-clock time when the job was accepted into the queue */
  readonly enqueuedAt: Date;
  /** Wall-clock time when the worker began processing this job (set by the worker) */
  startedAt?: Date;
  /** Wall-clock time when the worker finished processing this job (set by the worker) */
  finishedAt?: Date;
}

// ─── Storage Abstraction ──────────────────────────────────────────────────────

/**
 * Minimal FIFO storage contract consumed by AIQueueManager.
 *
 * The current implementation (MemoryQueueStorage) holds jobs in a plain array.
 * A future milestone may swap this for a Firestore-backed, Redis, or Cloud Tasks
 * implementation without any changes to the queue manager or API route.
 */
export interface QueueStorage {
  /**
   * Append a job to the tail of the queue.
   * Must be synchronous (or resolve before the caller inspects size).
   */
  push(job: AIJob): void;

  /**
   * Remove and return the job at the head of the queue.
   * Returns undefined when the queue is empty.
   */
  shift(): AIJob | undefined;

  /** Number of jobs currently in the queue (including the one being processed, if any). */
  size(): number;
}
