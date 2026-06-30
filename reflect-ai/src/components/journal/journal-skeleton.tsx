'use client';

/**
 * JournalSkeleton
 *
 * Animated loading placeholder for journal cards.
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-stone-100',
        className
      )}
      aria-hidden="true"
    />
  );
}

export function JournalSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
      {/* Initial Check-In pill */}
      <Skeleton className="mb-4 h-5 w-20 rounded-full" />
      {/* Title */}
      <Skeleton className="mb-3 h-5 w-3/4" />
      {/* Content lines */}
      <Skeleton className="mb-2 h-3.5 w-full" />
      <Skeleton className="mb-2 h-3.5 w-5/6" />
      <Skeleton className="h-3.5 w-2/3" />
      {/* Footer */}
      <div className="mt-5 flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function JournalSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading journal entries…"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <JournalSkeleton key={i} />
      ))}
    </div>
  );
}
