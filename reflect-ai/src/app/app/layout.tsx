'use client';

/**
 * /app layout
 *
 * Wraps all routes under /app with ProtectedRoute to ensure only
 * authenticated users can access them.
 */

import React, { type ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
