'use client';

/**
 * /app/journals/[journalId] — Journal Detail View
 *
 * Provides a calm, read-focused view of a single journal entry.
 * Fetches the journal using the existing service layer.
 * Uses the standard JournalFormModal for editing.
 * Displays floating back, edit, and delete bubbles on scroll.
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pencil, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { useAuth } from '@/contexts/auth';
import { getJournal, deleteJournal, updateJournal } from '@/services/firebase/journal';
import { JournalFormModal } from '@/components/journal/journal-form-modal';
import type { Journal, CreateJournalInput, UpdateJournalInput } from '@/types/journal';

// ── Mood styling (mirrors journal-card.tsx) ─────────────────────────────────
const MOOD_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  happy:    { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  peaceful: { bg: 'bg-teal-50',    text: 'text-teal-700',    dot: 'bg-teal-400'    },
  calm:     { bg: 'bg-sky-50',     text: 'text-sky-700',     dot: 'bg-sky-400'     },
  anxious:  { bg: 'bg-orange-50',  text: 'text-orange-700',  dot: 'bg-orange-400'  },
  sad:      { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  angry:    { bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400'     },
  grateful: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  excited:  { bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400'  },
};

function getMoodStyle(mood: string) {
  return (
    MOOD_STYLES[mood.toLowerCase()] ?? {
      bg: 'bg-stone-100',
      text: 'text-stone-600',
      dot: 'bg-stone-400',
    }
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function JournalDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const journalId = typeof params.journalId === 'string' ? params.journalId : '';

  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Modal Editing States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Floating bubble visibility tracking
  const [showFloatingBack, setShowFloatingBack] = useState(false);
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  const backButtonRef = useRef<HTMLDivElement | null>(null);
  const actionsContainerRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch journal on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid || !journalId) return;
    let cancelled = false;

    const fetchJournal = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setError(null);

      try {
        const data = await getJournal(user.uid, journalId);
        if (!cancelled) {
          setJournal(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        if (message.includes('not found')) {
          setNotFound(true);
        } else {
          setError("We couldn't load this journal. Please try again.");
        }
        setLoading(false);
      }
    };

    void fetchJournal();
    return () => { cancelled = true; };
  }, [user, journalId]);

  // ── Setup Intersection Observers for Floating Bubbles ─────────────────────
  useEffect(() => {
    if (loading || !journal) return;

    const backObserver = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingBack(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const actionsObserver = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingActions(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    const backBtnEl = backButtonRef.current;
    const actionsEl = actionsContainerRef.current;

    if (backBtnEl) backObserver.observe(backBtnEl);
    if (actionsEl) actionsObserver.observe(actionsEl);

    return () => {
      if (backBtnEl) backObserver.unobserve(backBtnEl);
      if (actionsEl) actionsObserver.unobserve(actionsEl);
    };
  }, [loading, journal]);

  // ── Save Handler (from Modal) ──────────────────────────────────────────────
  const handleFormSubmit = async (values: CreateJournalInput | UpdateJournalInput) => {
    if (!user?.uid || !journalId) return;
    setSaving(true);
    setError(null);

    try {
      const updated = await updateJournal(user.uid, journalId, values);
      setJournal(updated);
      setModalOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "We couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!user?.uid || !journalId) return;
    setDeleting(true);
    try {
      await deleteJournal(user.uid, journalId);
      router.push('/app');
    } catch {
      setError("We couldn't delete this journal. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [user, journalId, router]);

  const handleDeleteFloatingClick = async () => {
    const confirmDel = window.confirm('Are you sure you want to delete this journal entry?');
    if (confirmDel) {
      await handleDelete();
    }
  };

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-2xl animate-pulse">
          <div className="mb-10 h-4 w-16 rounded-full bg-stone-100" />
          <div className="mb-5 h-5 w-20 rounded-full bg-stone-100" />
          <div className="mb-4 h-8 w-3/4 rounded-xl bg-stone-100" />
          <div className="mb-8 h-3 w-1/3 rounded-full bg-stone-100" />
          <div className="my-8 border-t border-stone-100" />
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded-full bg-stone-100 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`}
              />
            ))}
          </div>
        </div>
      </PageContainer>
    );
  }

  // ── Render: not found ─────────────────────────────────────────────────────
  if (notFound) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <p className="text-3xl" aria-hidden="true">📖</p>
          <h2 className="mt-4 text-lg font-semibold text-stone-900">Journal not found</h2>
          <p className="mt-2 max-w-xs text-sm text-stone-500">
            This entry may have been deleted or the link is no longer valid.
          </p>
          <button
            onClick={() => router.push('/app')}
            className="mt-6 cursor-pointer inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-all hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to journals
          </button>
        </motion.div>
      </PageContainer>
    );
  }

  // ── Render: fetch error ───────────────────────────────────────────────────
  if (error && !journal) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <AlertCircle className="h-8 w-8 text-stone-300" aria-hidden="true" />
          <p className="mt-4 text-sm text-stone-500">{error}</p>
          <button
            onClick={() => router.push('/app')}
            className="mt-6 cursor-pointer inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-all hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to journals
          </button>
        </motion.div>
      </PageContainer>
    );
  }

  if (!journal) return null;

  const moodStyle = getMoodStyle(journal.mood);
  const wasEdited = journal.updatedAt.getTime() - journal.createdAt.getTime() > 5000;

  return (
    <>
      <PageContainer>
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl"
          aria-label={`Journal entry: ${journal.title}`}
        >
          {/* ── Inline Back navigation ─────────────────────────────────────── */}
          <div ref={backButtonRef} className="mb-10">
            <button
              id="back-to-dashboard-btn"
              onClick={() => router.push('/app')}
              className="cursor-pointer inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800 focus-visible:outline-none focus-visible:underline"
              aria-label="Back to journals"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>
          </div>

          {/* ── Error Banner (dynamic errors) ──────────────────────────────── */}
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
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Mood badge ─────────────────────────────────────────────────── */}
          <div className="mb-5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${moodStyle.bg} ${moodStyle.text}`}
              aria-label={`Mood: ${journal.mood}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${moodStyle.dot}`} aria-hidden="true" />
              {journal.mood}
            </span>
          </div>

          {/* ── Title ──────────────────────────────────────────────────────── */}
          <h1 className="text-2xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-3xl">
            {journal.title}
          </h1>

          {/* ── Date metadata ──────────────────────────────────────────────── */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-400">
            <time dateTime={journal.createdAt.toISOString()}>
              {formatDate(journal.createdAt)}
            </time>
            {wasEdited && (
              <span>
                Edited {formatDateTime(journal.updatedAt)}
              </span>
            )}
          </div>

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div className="my-8 border-t border-stone-100" aria-hidden="true" />

          {/* ── Content ────────────────────────────────────────────────────── */}
          {journal.content ? (
            <div className="space-y-4">
              {journal.content.split('\n').map((paragraph, i) =>
                paragraph.trim() ? (
                  <p key={i} className="text-base leading-relaxed text-stone-700">
                    {paragraph}
                  </p>
                ) : (
                  <div key={i} className="h-2" aria-hidden="true" />
                )
              )}
            </div>
          ) : (
            <p className="text-sm italic text-stone-400">No content written for this entry.</p>
          )}

          {/* ── Divider ────────────────────────────────────────────────────── */}
          <div className="my-10 border-t border-stone-100" aria-hidden="true" />

          {/* ── Inline Action buttons ───────────────────────────────────────── */}
          <div ref={actionsContainerRef} className="flex items-center gap-3">
            <button
              id="edit-journal-detail-btn"
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition-all hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="Edit this journal entry"
            >
              <Pencil className="h-4 w-4" aria-hidden="true" />
              Edit
            </button>

            {/* Delete / Confirm */}
            <AnimatePresence mode="wait">
              {confirmDelete ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2"
                >
                  <button
                    id="confirm-delete-detail-btn"
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-red-600 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                    aria-label="Confirm deletion of this journal entry"
                  >
                    {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    Confirm delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={deleting}
                    className="cursor-pointer rounded-xl px-3 py-2.5 text-sm text-stone-400 hover:text-stone-600 disabled:opacity-50 focus-visible:outline-none focus-visible:underline"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="delete"
                  id="delete-journal-detail-btn"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                  aria-label="Delete this journal entry"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.article>
      </PageContainer>

      {/* ── 1. Floating Back Bubble (Bottom-Left) ─────────────────────────── */}
      <AnimatePresence>
        {showFloatingBack && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => router.push('/app')}
            className="fixed bottom-6 left-6 z-40 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-all hover:bg-stone-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            aria-label="Back to journals list"
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── 2. Floating Actions Bubbles (Bottom-Right) ────────────────────── */}
      <AnimatePresence>
        {showFloatingActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3"
          >
            {/* Edit Bubble */}
            <button
              onClick={() => setModalOpen(true)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-all hover:bg-stone-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
              aria-label="Edit journal entry"
            >
              <Pencil className="h-5 w-5" />
            </button>

            {/* Delete Bubble */}
            <button
              onClick={handleDeleteFloatingClick}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
              aria-label="Delete journal entry"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3. Shared JournalFormModal ────────────────────────────────────── */}
      <JournalFormModal
        isOpen={modalOpen}
        isBusy={saving}
        editingJournal={journal}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}

