'use client';

/**
 * /app — Journal Dashboard
 *
 * Authenticated users see their journal entries here.
 * Supports full CRUD via the Firestore service.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { useAuth } from '@/contexts/auth';
import { useJournals } from '@/hooks/use-journals';
import { JournalCard } from '@/components/journal/journal-card';
import { JournalSkeletonGrid } from '@/components/journal/journal-skeleton';
import { EmptyState } from '@/components/journal/empty-state';
import { JournalFormModal } from '@/components/journal/journal-form-modal';
import type { Journal, CreateJournalInput, UpdateJournalInput } from '@/types/journal';

export default function AppPage() {
  const { user } = useAuth();
  const { journals, loading, error, creating, mutating, refresh, create, update, remove, clearError } =
    useJournals(user?.uid);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openCreate = useCallback(() => {
    setEditingJournal(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((journal: Journal) => {
    setEditingJournal(journal);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (creating || mutating) return; // don't allow close while saving
    setModalOpen(false);
    setEditingJournal(null);
  }, [creating, mutating]);

  const handleFormSubmit = useCallback(
    async (values: CreateJournalInput | UpdateJournalInput) => {
      if (editingJournal) {
        const result = await update(editingJournal.id, values as UpdateJournalInput);
        if (result) setModalOpen(false);
      } else {
        const result = await create(values as CreateJournalInput);
        if (result) setModalOpen(false);
      }
      setEditingJournal(null);
    },
    [editingJournal, create, update]
  );

  const handleDelete = useCallback(
    async (journalId: string) => {
      await remove(journalId);
    },
    [remove]
  );

  // ── Busy state for the modal ─────────────────────────────────────────────
  const isBusy = creating || (editingJournal ? mutating === editingJournal.id : false);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <PageContainer>
        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              My Journals
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              {loading
                ? 'Loading your entries…'
                : journals.length === 0
                  ? 'No entries yet'
                  : `${journals.length} ${journals.length === 1 ? 'entry' : 'entries'}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              id="refresh-journals-btn"
              onClick={refresh}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="Refresh journal list"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* New journal CTA */}
            <button
              id="new-journal-btn"
              onClick={openCreate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="Create new journal entry"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              New Journal
            </button>
          </div>
        </div>

        {/* ── Error banner ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="flex-1">{error}</span>
                <button
                  onClick={clearError}
                  className="cursor-pointer text-red-400 hover:text-red-600 focus-visible:outline-none"
                  aria-label="Dismiss error"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading skeletons ─────────────────────────────────────────────── */}
        {loading && <JournalSkeletonGrid count={6} />}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {!loading && journals.length === 0 && !error && (
          <EmptyState onNewJournal={openCreate} />
        )}

        {/* ── Journal grid ──────────────────────────────────────────────────── */}
        {!loading && journals.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Journal entries"
          >
            <AnimatePresence mode="popLayout">
              {journals.map((journal) => (
                <JournalCard
                  key={journal.id}
                  journal={journal}
                  isMutating={mutating === journal.id}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </PageContainer>

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      <JournalFormModal
        isOpen={modalOpen}
        isBusy={!!isBusy}
        editingJournal={editingJournal}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
