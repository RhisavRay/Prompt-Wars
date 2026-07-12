/**
 * AI Queue — In-Memory Storage Implementation
 *
 * Implements QueueStorage using a plain JavaScript array as the backing store.
 * This is the initial, non-persistent implementation.
 *
 * Swap out for a Firestore / Redis / Cloud Tasks implementation in a future
 * milestone without touching AIQueueManager or any callers.
 */

import type { AIJob, QueueStorage } from './types';

export class MemoryQueueStorage implements QueueStorage {
  private readonly _queue: AIJob[] = [];

  push(job: AIJob): void {
    this._queue.push(job);
  }

  shift(): AIJob | undefined {
    return this._queue.shift();
  }

  size(): number {
    return this._queue.length;
  }
}
