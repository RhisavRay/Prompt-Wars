'use client';

/**
 * /app — Journal Dashboard
 *
 * Authenticated users see their journal entries here.
 * Supports full CRUD via the Firestore service.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, AlertCircle, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'updated'>('newest');

  // ── Search, Filter & Sort Processing ────────────────────────────────────────
  const processedJournals = useMemo(() => {
    // 1. Search Filter
    const trimmedSearch = searchQuery.trim().toLowerCase();
    let result = journals;
    if (trimmedSearch) {
      result = result.filter(
        (journal) =>
          journal.title.toLowerCase().includes(trimmedSearch) ||
          journal.content.toLowerCase().includes(trimmedSearch)
      );
    }

    // 2. Date Filter
    if (dateFilter === 'today') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      result = result.filter((j) => j.createdAt >= startOfToday);
    } else if (dateFilter === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      result = result.filter((j) => j.createdAt >= sevenDaysAgo);
    } else if (dateFilter === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter((j) => j.createdAt >= thirtyDaysAgo);
    }

    // 3. Sorting (create a copy first)
    const sorted = [...result];
    if (sortBy === 'newest') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else if (sortBy === 'updated') {
      sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    return sorted;
  }, [journals, searchQuery, dateFilter, sortBy]);

  const isSearching = searchQuery.trim() !== '';
  const isFilteringOrSorting = dateFilter !== 'all' || sortBy !== 'newest';

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

  // Reset function to clear custom settings
  const handleClearFilters = useCallback(() => {
    setDateFilter('all');
    setSortBy('newest');
  }, []);

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
                  : (isSearching || dateFilter !== 'all')
                    ? `${processedJournals.length} of ${journals.length} ${
                        journals.length === 1 ? 'entry' : 'entries'
                      }`
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

        {/* ── Search Bar & Filter Controls ─────────────────────────────────── */}
        {!loading && journals.length > 0 && (
          <div className="mb-6 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search journals by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 transition-colors focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                aria-label="Search journals"
              />
            </div>

            {/* Dropdowns panel */}
            <div
              role="group"
              aria-label="Filter and sort controls"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/50 p-3 sm:flex-nowrap"
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Date Dropdown */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="filter-date" className="text-xs font-medium text-stone-500">
                    Filter:
                  </label>
                  <select
                    id="filter-date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as 'all' | 'today' | '7days' | '30days')}
                    className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 outline-none transition-colors focus-visible:border-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-400/30"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5">
                  <label htmlFor="sort-by" className="text-xs font-medium text-stone-500">
                    Sort:
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'updated')}
                    className="cursor-pointer rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 outline-none transition-colors focus-visible:border-emerald-400 focus-visible:ring-1 focus-visible:ring-emerald-400/30"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="updated">Recently Updated</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters (Non-default active) */}
              {isFilteringOrSorting && (
                <button
                  id="clear-filters-btn"
                  onClick={handleClearFilters}
                  aria-label="Clear date filter and sort order"
                  className="cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Loading skeletons ─────────────────────────────────────────────── */}
        {loading && <JournalSkeletonGrid count={6} />}

        {/* ── Empty state (No journals at all) ──────────────────────────────── */}
        {!loading && journals.length === 0 && !error && (
          <EmptyState onNewJournal={openCreate} />
        )}

        {/* ── Empty search or filter state (No matching journals) ───────────── */}
        {!loading && journals.length > 0 && processedJournals.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <p className="text-sm text-stone-500">
              {isSearching
                ? 'No journals match your search.'
                : 'No journals match your selected filters.'}
            </p>
            {(isSearching || isFilteringOrSorting) && (
              <button
                id="reset-all-btn"
                onClick={() => {
                  setSearchQuery('');
                  handleClearFilters();
                }}
                className="mt-3 cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 focus-visible:outline-none focus-visible:underline"
                aria-label="Reset search and filters"
              >
                Reset search and filters
              </button>
            )}
          </motion.div>
        )}

        {/* ── Journal grid ──────────────────────────────────────────────────── */}
        {!loading && processedJournals.length > 0 && (
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
              {processedJournals.map((journal) => (
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
