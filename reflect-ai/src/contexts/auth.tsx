'use client';

/**
 * AuthContext
 *
 * Provides global authentication state and actions via React Context.
 * Wraps Firebase's onAuthStateChanged so every component tree subscriber
 * receives live, persistent auth state.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  toAppUser,
} from '@/services/firebase/auth';
import type { AppUser, AuthContextValue, AuthStatus } from '@/types/auth';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Subscribe to Firebase auth state changes (handles page refresh persistence)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser ? toAppUser(firebaseUser) : null);
        setStatus(firebaseUser ? 'authenticated' : 'unauthenticated');
        setError(null);
      },
      (err) => {
        console.error('[AuthContext] onAuthStateChanged error:', err);
        setUser(null);
        setStatus('unauthenticated');
        setError('An authentication error occurred. Please try again.');
      }
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignInWithGoogle();
      // onAuthStateChanged will update the state automatically
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sign-in failed. Please try again.';

      // Ignore user-dismissed popup — not a real error
      if ((err as { code?: string }).code === 'auth/popup-closed-by-user') {
        return;
      }

      console.error('[AuthContext] signInWithGoogle error:', err);
      setError(message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await firebaseSignOut();
      // onAuthStateChanged will set user to null automatically
    } catch (err) {
      console.error('[AuthContext] signOut error:', err);
      setError('Sign-out failed. Please try again.');
    }
  }, []);

  const value: AuthContextValue = {
    user,
    status,
    error,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useAuth — consume auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
