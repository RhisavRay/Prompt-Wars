'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth';
import { APP_CONFIG } from '@/config/app';

/**
 * Top application bar.
 * Shows a Sign in link when unauthenticated, or the user avatar + sign-out
 * when authenticated.
 */
export function Header() {
  const { user, status, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="group flex cursor-pointer items-center space-x-2 transition-opacity hover:opacity-90"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105">
            <svg
              className="h-4.5 w-4.5"
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
          </div>
          <span className="font-sans text-xl font-medium tracking-tight text-stone-800">
            {APP_CONFIG.name}
          </span>
        </Link>

        {/* Right side — auth controls */}
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="h-5 w-20 animate-pulse rounded-full bg-stone-100" />
          )}

          {status === 'unauthenticated' && (
            <Link
              href="/login"
              className="cursor-pointer rounded-full border border-stone-200 px-4 py-1.5 text-sm font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
            >
              Sign in
            </Link>
          )}

          {status === 'authenticated' && user && (
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <Link href="/app" className="group flex cursor-pointer items-center gap-2">
                {user.photoURL ? (
                  <div className="h-8 w-8 overflow-hidden rounded-full border border-stone-200 transition-opacity group-hover:opacity-80">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={user.photoURL}
                      alt={user.displayName ?? 'User'}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                    {user.displayName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                )}
              </Link>

              {/* Sign out */}
              <button
                id="header-sign-out-btn"
                onClick={signOut}
                className="cursor-pointer text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:rounded"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
