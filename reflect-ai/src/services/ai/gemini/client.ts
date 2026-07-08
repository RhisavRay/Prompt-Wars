import { GoogleGenAI } from '@google/genai';
import { AI_CONFIG } from '../config';

let genAIInstance: GoogleGenAI | null = null;

/**
 * Initializes and returns the singleton instance of Google Gen AI SDK client.
 * Returns null if the Gemini API Key is missing or invalid.
 *
 * NOTE: The client should not perform any network requests or be instantiated
 * if the environment configuration is incomplete.
 */
export function getGenAI(): GoogleGenAI | null {
  const apiKey = AI_CONFIG.gemini.apiKey;

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    return null;
  }

  if (!genAIInstance) {
    try {
      genAIInstance = new GoogleGenAI({ apiKey });
    } catch (error) {
      console.error('Failed to initialize GoogleGenAI client:', error);
      return null;
    }
  }

  return genAIInstance;
}
