'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Standard app-level loading fallback indicator.
 * Minimalist, calming design featuring a slow-rotating loader.
 */
export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="relative flex flex-col items-center space-y-4">
        {/* Calming glow background animation */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-4 rounded-full bg-emerald-100/40 blur-xl"
        />

        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-8 w-8 rounded-full border-[3px] border-stone-200 border-t-emerald-600 relative z-10"
        />

        <p className="text-sm font-medium text-stone-400 tracking-wide animate-pulse relative z-10">
          Gathering space...
        </p>
      </div>
    </div>
  );
}
