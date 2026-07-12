'use client';

/**
 * useReflection
 *
 * Fetches the AIReflection for a single journal entry, polling Firestore
 * while AI processing is in progress.
 *
 * Strategy:
 * - When aiStatus === 'completed', fetches the reflection once and caches it.
 * - When aiStatus === 'processing' or 'queued', polls every POLL_INTERVAL_MS until
 *   the reflection document appears or the status changes.
 * - When aiStatus === 'idle' or 'failed', does nothing.
 *
 * Note: A future improvement is to replace polling with a Firestore real-time
 * listener on the journal document, which would push aiStatus changes to the
 * client automatically. This is deferred to avoid restructuring useJournals
 * during this milestone.
 *
 * @param uid - The authenticated user's UID (or null/undefined if not yet available)
 * @param journalId - The journal entry ID
 * @param aiStatus - The current AI processing status from the Journal document
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getReflection } from '@/services/firebase/journalMemory';
import type { AIReflection } from '@/types/ai';
import type { AIStatus } from '@/types/journal';

const POLL_INTERVAL_MS = 3000;

interface UseReflectionReturn {
  reflection: AIReflection | null;
  loading: boolean;
  /** Number of polling cycles completed. Always 0 in production. */
  retryCount: number;
}

export function useReflection(
  uid: string | null | undefined,
  journalId: string,
  aiStatus: AIStatus | null | undefined
): UseReflectionReturn {
  const [reflection, setReflection] = useState<AIReflection | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Track mounted state to avoid setting state after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchOnce = useCallback(async () => {
    if (!uid || !journalId) return;
    try {
      const result = await getReflection(uid, journalId);
      if (mountedRef.current) {
        setReflection(result);
        setLoading(false);
      }
    } catch {
      // Silently ignore fetch errors — AI is a guest, not a requirement
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [uid, journalId]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!uid || !journalId) return;

    let active = true;

    const setup = async () => {
      // Yield to microtask queue before triggering setState, satisfying the purity rules
      await Promise.resolve();
      if (!active || !mountedRef.current) return;

      setReflection(null);
      setRetryCount(0);

      if (aiStatus === 'completed') {
        // One-time fetch
        setLoading(true);
        void fetchOnce();
      } else if (aiStatus === 'processing' || aiStatus === 'queued') {
        setLoading(true);

        let pollCount = 0;
        const intervalId = setInterval(async () => {
          if (!mountedRef.current || !active) {
            clearInterval(intervalId);
            return;
          }
          pollCount += 1;
          if (process.env.NODE_ENV === 'development') {
            setRetryCount(pollCount);
          }
          try {
            const result = await getReflection(uid, journalId);
            if (result && active) {
              clearInterval(intervalId);
              if (mountedRef.current) {
                setReflection(result);
                setLoading(false);
              }
            }
          } catch {
            // Keep polling silently on transient errors
          }
        }, POLL_INTERVAL_MS);

        intervalRef.current = intervalId;
      }
    };

    void setup();

    return () => {
      active = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [uid, journalId, aiStatus, fetchOnce]);

  return {
    reflection,
    loading,
    retryCount: process.env.NODE_ENV === 'development' ? retryCount : 0,
  };
}
