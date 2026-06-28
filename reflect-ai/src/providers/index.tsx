'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/auth';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global application providers wrapper.
 * Add new providers here, wrapping inward (outermost = least dependent).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
