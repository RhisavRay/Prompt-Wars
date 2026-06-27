'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

/**
 * Standard 404 Page Not Found Component.
 * Styled with calming pastel gradients and centered layout container.
 */
export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <div className="max-w-md w-full bg-white border border-stone-100 p-8 rounded-2xl shadow-sm">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
          <Compass className="h-6 w-6" />
        </div>

        <h2 className="text-xl font-semibold text-stone-900 tracking-tight mb-2">
          Page not found
        </h2>

        <p className="text-sm text-stone-500 mb-6 leading-relaxed">
          The space you are searching for does not exist or has been moved to another location.
        </p>

        <Link href="/" passHref legacyBehavior>
          <Button className="w-full sm:w-auto bg-stone-900 text-stone-100 hover:bg-stone-700 font-medium px-4 py-2 rounded-lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
