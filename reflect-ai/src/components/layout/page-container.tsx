'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable centered page container with animations and responsive paddings.
 * Adheres to standard mental wellness calm design guidelines.
 */
export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12 ${className}`}
    >
      {children}
    </motion.main>
  );
}
