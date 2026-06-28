'use client';

/**
 * AuthLoadingScreen
 *
 * Full-screen loading indicator shown while Firebase resolves the
 * initial authentication state (prevents flash of incorrect content).
 */

import React from 'react';

export function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative flex h-12 w-12 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-25" />
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <svg
              className="h-5 w-5 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          </span>
        </div>
        <p className="text-sm font-medium text-stone-400">Loading Reflect…</p>
      </div>
    </div>
  );
}
