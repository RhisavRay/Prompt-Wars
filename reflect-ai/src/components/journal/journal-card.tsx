'use client';

/**
 * JournalCard
 *
 * Renders a single journal entry with title, mood badge, content preview,
 * creation date, and edit/delete actions.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Journal } from '@/types/journal';
import { getEmotionConfig } from '@/constants/emotions';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface JournalCardProps {
  journal: Journal;
  isMutating: boolean;
  onEdit: (journal: Journal) => void;
  onDelete: (journalId: string) => void;
}

export function JournalCard({ journal, isMutating, onEdit, onDelete }: JournalCardProps) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const emotionConfig = getEmotionConfig(journal.initialCheckIn);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(journal.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
    }
  };

  const handleCardClick = () => {
    router.push(`/app/journals/${journal.id}`);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
      aria-label={`Journal entry: ${journal.title}`}
    >
      {/* Initial Check-In badge */}
      <div className="mb-4 flex items-center justify-between">
        {emotionConfig ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${emotionConfig.bg} ${emotionConfig.text}`}
            aria-label={`Initial Check-In: ${emotionConfig.label}`}
          >
            <span aria-hidden="true">{emotionConfig.emoji}</span>
            {emotionConfig.label}
          </span>
        ) : (
          <div aria-hidden="true" />
        )}

        {/* Mutating spinner */}
        {isMutating && (
          <Loader2 className="h-4 w-4 animate-spin text-stone-400" aria-label="Saving…" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-stone-900">
        {journal.title}
      </h3>

      {/* Content preview */}
      {journal.content && (
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500">
          {journal.content}
        </p>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-2">
        <time
          dateTime={journal.createdAt.toISOString()}
          className="text-xs text-stone-400"
        >
          {formatDate(journal.createdAt)}
        </time>

        {/* Actions — always visible on mobile, hover-reveal on desktop */}
        <div className="flex items-center gap-1.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          {/* Edit */}
          <button
            id={`edit-journal-${journal.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(journal);
            }}
            disabled={isMutating}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-all hover:bg-stone-50 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            aria-label={`Edit "${journal.title}"`}
          >
            <Pencil className="h-3 w-3" aria-hidden="true" />
            Edit
          </button>

          {/* Delete / Confirm */}
          <AnimatePresence mode="wait">
            {confirmDelete ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1"
              >
                <button
                  id={`confirm-delete-journal-${journal.id}`}
                  onClick={handleDeleteClick}
                  disabled={isMutating}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white transition-all hover:bg-red-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                  aria-label={`Confirm delete "${journal.title}"`}
                >
                  Confirm
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-1.5 text-xs text-stone-400 hover:text-stone-600 focus-visible:outline-none"
                  aria-label="Cancel delete"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="delete"
                id={`delete-journal-${journal.id}`}
                onClick={handleDeleteClick}
                disabled={isMutating}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                aria-label={`Delete "${journal.title}"`}
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                Delete
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
