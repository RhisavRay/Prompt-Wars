'use client';

/**
 * ReflectionView
 *
 * The back face of the journal flip-card.
 * Displays the AI-generated reflection without labels, headers, or AI branding.
 *
 * Layout (top to bottom):
 *   - ArrowLeft icon (top-left) → flips back to journal
 *   - Reflection body paragraph
 *   - Horizontal divider
 *   - Follow-up question paragraph
 *
 * The reflection should feel like the other side of the journal —
 * not an AI overlay. Typography and spacing mirror the journal front face.
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { AIReflection } from '@/types/ai';

interface ReflectionViewProps {
  reflection: AIReflection;
  onFlipBack: () => void;
}

export function ReflectionView({ reflection, onFlipBack }: ReflectionViewProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Top bar — back navigation only */}
      <div className="mb-4 flex items-start justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFlipBack();
          }}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          aria-label="Return to journal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Reflection body */}
      <p className="flex-1 text-sm leading-relaxed text-stone-700">
        {reflection.body}
      </p>

      {/* Divider */}
      <hr className="my-4 border-stone-100" />

      {/* Follow-up question */}
      <p className="text-sm leading-relaxed text-stone-500 italic">
        {reflection.followUpQuestion}
      </p>
    </div>
  );
}
