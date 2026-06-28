'use client';

/**
 * Login Page — /login
 *
 * Renders the Google sign-in button.
 * Authenticated users are redirected to /app on mount.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth';
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';
import { Shield, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { user, status, error, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect authenticated users away from the login page
  useEffect(() => {
    if (status === 'authenticated' && user) {
      router.replace('/app');
    }
  }, [status, user, router]);

  // Show loading state while Firebase initialises or redirect is in-flight
  if (status === 'loading' || status === 'authenticated') {
    return <AuthLoadingScreen />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="rounded-2xl border border-stone-100 bg-white px-8 py-10 shadow-sm">
          {/* Logo mark */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <svg
                className="h-6 w-6"
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
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              Welcome to Reflect
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Sign in to your mindful journaling space.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}

          {/* Google Sign-in button */}
          <button
            id="google-sign-in-btn"
            onClick={signInWithGoogle}
            className="group flex w-full items-center justify-center gap-3 rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-xs transition-all duration-150 hover:border-stone-300 hover:bg-stone-50 hover:shadow-sm active:scale-[0.98]"
          >
            {/* Google colour icon */}
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Privacy notice */}
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
            <Shield className="h-3 w-3 shrink-0" />
            Your data is private and encrypted.
          </p>
        </div>

        {/* Bottom badge */}
        <div className="mt-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/8 px-3 py-1 text-xs font-medium text-emerald-700">
            <Sparkles className="h-3 w-3" />
            Mindful journaling, powered by AI
          </span>
        </div>
      </motion.div>
    </div>
  );
}
