/**
 * AI Service Configuration Module
 *
 * Exposes server-side configuration settings and warns about missing environment variables.
 */

export const AI_CONFIG = {
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.2'),
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '2048', 10),
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS || '15000', 10),
    retryCount: parseInt(process.env.GEMINI_RETRY_COUNT || '3', 10),
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
