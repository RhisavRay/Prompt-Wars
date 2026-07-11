'use client';

/**
 * useJournals
 *
 * Manages journal state: loading, error, and CRUD operations.
 * Wraps the Firestore service and returns stable, typed state
 * for use by any UI component.
 *
 * State updates are always inside async callbacks — never
 * synchronously in the effect body — to satisfy the React
 * Compiler's react-hooks/set-state-in-effect rule.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllJournals,
  createJournal,
  updateJournal,
  deleteJournal,
} from '@/services/firebase/journal';
import type { Journal, CreateJournalInput, UpdateJournalInput, AIStatus } from '@/types/journal';
import { auth } from '@/services/firebase/client';

interface UseJournalsReturn {
  journals: Journal[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  mutating: string | null;
  refresh: () => void;
  create: (input: CreateJournalInput) => Promise<Journal | null>;
  update: (journalId: string, input: UpdateJournalInput) => Promise<Journal | null>;
  remove: (journalId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useJournals(uid: string | null | undefined): UseJournalsReturn {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [mutating, setMutating] = useState<string | null>(null);
  // Increment this counter to trigger a re-fetch from the effect
  const [fetchTick, setFetchTick] = useState(0);

  const clearError = useCallback(() => setError(null), []);
  const refresh = useCallback(() => setFetchTick((t) => t + 1), []);

  const updateLocalAIStatus = useCallback((journalId: string, status: AIStatus) => {
    setJournals((prev) =>
      prev.map((j) => (j.id === journalId ? { ...j, aiStatus: status } : j))
    );
  }, []);

  const triggerAiProcess = useCallback(
    async (
      action: 'new' | 'update' | 'delete',
      journalId: string,
      payload: { journal?: Journal }
    ): Promise<void> => {
      if (!uid) return;

      // 1. Immediately transition local state to 'processing' (except for delete action)
      if (action !== 'delete') {
        updateLocalAIStatus(journalId, 'processing');
      }

      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) {
          console.warn('[AI Trigger Warning]: User ID token is not available.');
          if (action !== 'delete') {
            updateLocalAIStatus(journalId, 'failed');
          }
          return;
        }

        const response = await fetch('/api/ai/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            action,
            uid,
            journal: payload.journal,
            journalId,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }

        const result = await response.json().catch(() => ({}));

        // 2. Transition local state to the final status returned by the server
        if (action !== 'delete' && result.aiStatus) {
          updateLocalAIStatus(journalId, result.aiStatus);
        }
      } catch (err) {
        console.error(`[AI Trigger ERROR] Failed to request server AI process (${action}):`, err);
        if (action !== 'delete') {
          updateLocalAIStatus(journalId, 'failed');
        }
      }
    },
    [uid, updateLocalAIStatus]
  );

  useEffect(() => {
    if (!uid) return;

    let cancelled = false;

    // Kick off the fetch; setState only inside the promise callbacks
    const fetchJournals = async () => {
      await Promise.resolve(); // yield before touching state — satisfies synchronous-setState rule
      if (cancelled) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getAllJournals(uid);
        if (!cancelled) {
          setJournals(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load journals.';
          setError(message);
          setLoading(false);
        }
      }
    };

    void fetchJournals();

    return () => {
      cancelled = true;
    };
  }, [uid, fetchTick]);

  const create = useCallback(
    async (input: CreateJournalInput): Promise<Journal | null> => {
      if (!uid) return null;
      setCreating(true);
      setError(null);
      try {
        const newJournal = await createJournal(uid, input);
        setJournals((prev) => [newJournal, ...prev]);
        void triggerAiProcess('new', newJournal.id, { journal: newJournal });
        return newJournal;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create journal.';
        setError(message);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [uid, triggerAiProcess]
  );

  const update = useCallback(
    async (journalId: string, input: UpdateJournalInput): Promise<Journal | null> => {
      if (!uid) return null;
      setMutating(journalId);
      setError(null);
      try {
        const updated = await updateJournal(uid, journalId, input);
        setJournals((prev) => prev.map((j) => (j.id === journalId ? updated : j)));
        void triggerAiProcess('update', journalId, { journal: updated });
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update journal.';
        setError(message);
        return null;
      } finally {
        setMutating(null);
      }
    },
    [uid, triggerAiProcess]
  );

  const remove = useCallback(
    async (journalId: string): Promise<boolean> => {
      if (!uid) return false;
      setMutating(journalId);
      setError(null);
      try {
        await deleteJournal(uid, journalId);
        setJournals((prev) => prev.filter((j) => j.id !== journalId));
        void triggerAiProcess('delete', journalId, {});
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete journal.';
        setError(message);
        return false;
      } finally {
        setMutating(null);
      }
    },
    [uid, triggerAiProcess]
  );

  return {
    journals,
    loading,
    error,
    creating,
    mutating,
    refresh,
    create,
    update,
    remove,
    clearError,
  };
}
