/**
 * Global Application Configuration Module
 *
 * Houses constants, routing targets, features flags, and operational limits.
 * All application-wide rules are governed here.
 */

export const APP_CONFIG = {
  name: 'Reflect',
  description: 'A calm, modern space for mindful reflection and wellness.',
  supportEmail: 'support@reflect-ai.example.com',
  
  // Future operational limits
  limits: {
    maxJournalLength: 5000,
    maxTitleLength: 100,
    maxTagsPerEntry: 5,
  },

  // Future feature flags
  features: {
    aiSuggestions: false,
    moodAnalysis: false,
    weeklyReports: false,
  },

  // Route definitions
  routes: {
    home: '/',
    dashboard: '/dashboard',
    journal: '/journal',
    reflect: '/reflect',
    profile: '/profile',
    settings: '/settings',
  },
};
