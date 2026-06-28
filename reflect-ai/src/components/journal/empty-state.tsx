'use client';

/**
 * EmptyState
 *
 * Shown when a user has no journal entries yet.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onNewJournal: () => void;
}

export function EmptyState({ onNewJournal }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Icon ring */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
        <BookOpen className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <h2 className="mb-2 text-xl font-semibold text-stone-800">Your journal is empty</h2>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-stone-500">
        Start capturing your thoughts, moods, and reflections. Every entry is a step toward
        clarity.
      </p>

      <button
        id="empty-state-new-journal-btn"
        onClick={onNewJournal}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-stone-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        aria-label="Create your first journal entry"
      >
        Write your first entry
      </button>
    </motion.div>
  );
}
