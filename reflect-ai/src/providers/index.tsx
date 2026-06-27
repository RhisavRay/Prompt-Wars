'use client';

import React from 'react';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Global application providers wrapper
 * Minimal structure for future provider injection (e.g. auth contexts)
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <>
      {children}
    </>
  );
}
