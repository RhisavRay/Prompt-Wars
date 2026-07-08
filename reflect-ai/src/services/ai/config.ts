/**
 * AI Service Configuration Module
 *
 * Exposes server-side configuration settings and warns about missing environment variables.
 */

export const AI_CONFIG = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

// Perform validation in development environments
if (process.env.NODE_ENV === 'development') {
  if (!AI_CONFIG.gemini.apiKey || AI_CONFIG.gemini.apiKey === 'your-gemini-api-key-here') {
    console.warn(
      '[AI Config WARNING]: GEMINI_API_KEY is missing or contains a placeholder value in your environment variables.'
    );
  }
}
