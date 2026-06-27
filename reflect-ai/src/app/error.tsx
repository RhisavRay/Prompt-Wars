'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global Next.js app router error rendering screen.
 * Gracefully reports runtime anomalies.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics endpoint if required
    console.error('Unhandled app-level error boundary trigger:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white border border-stone-100 p-8 rounded-2xl shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-2">
          Something went wrong
        </h2>
        
        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          We encountered an unexpected issue while loading this page. Please try reloading.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-stone-900 text-stone-100 hover:bg-stone-700 font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto border-stone-200 hover:bg-stone-50 text-stone-600"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
