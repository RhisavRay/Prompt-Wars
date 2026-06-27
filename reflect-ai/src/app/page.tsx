'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { APP_CONFIG } from '@/config/app';

export default function Home() {
  // Stagger animation container config
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
  };

  return (
    <PageContainer className="flex-1 flex flex-col justify-center">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-semibold tracking-wide uppercase mb-6"
        >
          <Sparkles className="h-3 w-3" />
          Mindful Space Foundation Active
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 mb-6 leading-[1.15]"
        >
          Your space for <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">mindful clarity</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base md:text-lg text-stone-500 leading-relaxed font-normal"
        >
          Reflect is a private, intelligent journaling workspace designed to help you process your thoughts, track your moods, and unlock mental wellness insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Button 
            className="w-full sm:w-auto bg-stone-900 text-stone-100 hover:bg-stone-700 px-6 py-4.5 rounded-full font-medium transition-all shadow-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-90"
            disabled
          >
            Enter Reflect Space
            <span className="text-xs py-0.5 px-2 bg-stone-750 rounded-full text-stone-300">Soon</span>
          </Button>
          
          <a
            href="https://github.com/RhisavRay/Prompt-Wars"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-stone-500 hover:text-stone-700 font-medium text-sm transition-colors py-2 px-4 rounded-full border border-stone-200 hover:bg-stone-50 text-center"
          >
            Explore Codebase
          </a>
        </motion.div>
      </div>

      {/* Core Feature Pillars Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto w-full"
      >
        {/* Pillar 1 */}
        <motion.div
          variants={itemVariants}
          className="group relative bg-white border border-stone-100 p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">Intentional Journaling</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Write without boundaries. Express your moods, daily activities, and observations in a clean, quiet interface.
          </p>
        </motion.div>

        {/* Pillar 2 */}
        <motion.div
          variants={itemVariants}
          className="group relative bg-white border border-stone-100 p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">Cognitive Insights</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Uncover correlations between your behaviors, stress levels, and emotional patterns using advanced AI modeling.
          </p>
        </motion.div>

        {/* Pillar 3 */}
        <motion.div
          variants={itemVariants}
          className="group relative bg-white border border-stone-100 p-6 rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">Wellness Analytics</h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Visualize your wellness vectors through beautiful, interactive health charts and monthly introspection metrics.
          </p>
        </motion.div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1 }}
        className="mt-16 md:mt-24 text-center border-t border-stone-100 pt-8"
      >
        <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5 font-medium">
          <Shield className="h-3.5 w-3.5 text-stone-300" />
          End-to-End Privacy Preserved. Your data is encrypted and saved under secure Firebase policies.
        </p>
      </motion.div>
    </PageContainer>
  );
}
