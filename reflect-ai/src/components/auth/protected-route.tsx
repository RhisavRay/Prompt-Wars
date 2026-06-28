'use client';

/**
 * ProtectedRoute
 *
 * Wraps protected page content. While auth is initializing it renders a
 * full-screen loading state. Once resolved:
 *   - Authenticated  → renders children
 *   - Unauthenticated → redirects to /login
 */

import React, { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth';
import { AuthLoadingScreen } from '@/components/auth/auth-loading-screen';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return <AuthLoadingScreen />;
  }

  return <>{children}</>;
}
