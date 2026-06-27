'use client';

import React from 'react';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';

/**
 * Minimal top application bar with logo/title.
 * Designed to feel calming, clean, and premium.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
        <Link 
          href="/" 
          className="group flex items-center space-x-2 transition-opacity hover:opacity-90"
        >
          {/* Calm, minimalist geometric logo placeholder */}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105">
            <svg 
              className="h-4.5 w-4.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </div>
          <span className="font-sans text-xl font-medium tracking-tight text-stone-800">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Minimal accent to emphasize clean UI */}
        <div className="text-xs font-medium tracking-wider text-stone-400 uppercase">
          Foundation Active
        </div>
      </div>
    </header>
  );
}
