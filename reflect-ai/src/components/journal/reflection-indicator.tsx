'use client';

/**
 * ReflectionIndicator
 *
 * Occupies the top-right action area of the journal card.
 * Responds to the journal's aiStatus and drives the flip interaction.
 *
 * States:
 *   idle / failed  → renders nothing
 *   processing     → "Reflecting ☀️" with a continuously rotating Sun icon
 *                    (dev-only: shows retry count, e.g. "Reflecting (2) ☀️")
 *   completed      → fades out the Sun, fades in the "Reflect" button
 *
 * The caller is responsible for passing onFlip, which triggers the card flip.
 */

import React, { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SunIcon } from '@/components/ui/sun';
import type { AIStatus } from '@/types/journal';

interface ReflectionIndicatorProps {
  aiStatus: AIStatus | null | undefined;
  hasReflection: boolean;
  retryCount: number;
  onFlip: () => void;
}

export function ReflectionIndicator({
  aiStatus,
  hasReflection,
  retryCount,
  onFlip,
}: ReflectionIndicatorProps) {
  // Completed state: reflection fetched and ready
  const showReflectButton = aiStatus === 'completed' && hasReflection;
  // Processing state: AI is working
  const showProcessing = aiStatus === 'processing' || (aiStatus === 'completed' && !hasReflection);

  const isDev = process.env.NODE_ENV === 'development';
  const reflectBtnId = useId();

  return (
    <div className="flex items-center">
      <AnimatePresence mode="wait">
        {showProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: [1, 1.15, 1, 0],
              transition: { duration: 0.5, times: [0, 0.3, 0.6, 1] },
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-1.5"
          >
            <span className="text-xs font-medium text-stone-400">
              Reflecting{isDev && retryCount > 0 ? ` (${retryCount})` : ''}
            </span>
            {/* Continuous rotation wrapper around the Sun icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-amber-400"
            >
              <SunIcon size={14} className="pointer-events-none" />
            </motion.div>
          </motion.div>
        )}

        {showReflectButton && (
          <motion.button
            key="reflect-btn"
            id={reflectBtnId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700 transition-all hover:bg-amber-100 hover:border-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
            aria-label="View AI reflection"
          >
            Reflect
            <SunIcon size={12} className="pointer-events-none text-amber-500" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
