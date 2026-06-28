'use client';

/**
 * /app — Protected Application Area (placeholder)
 *
 * This page is intentionally minimal. Dashboard functionality
 * will be implemented in a future iteration.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth';
import { PageContainer } from '@/components/layout/page-container';
import { LogOut, Sparkles } from 'lucide-react';

export default function AppPage() {
  const { user, signOut } = useAuth();

  return (
    <PageContainer className="flex flex-1 flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg text-center"
      >
        {/* Welcome badge */}
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          <Sparkles className="h-3 w-3" />
          Authenticated
        </div>

        {/* User avatar */}
        {user?.photoURL && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-100 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.photoURL}
              alt={user.displayName ?? 'User avatar'}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}

        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Your Reflect dashboard is coming soon. Authentication is fully wired.
        </p>

        {/* Sign out */}
        <div className="mt-8">
          <button
            id="sign-out-btn"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-600 shadow-xs transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-800 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </motion.div>
    </PageContainer>
  );
}
