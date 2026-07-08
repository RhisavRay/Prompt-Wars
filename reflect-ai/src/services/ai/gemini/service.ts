import { getGenAI } from './client';
import type { ActiveUserMemory, ReflectionResult } from '../types';

/**
 * Checks if the Gemini AI service is active and properly configured.
 *
 * @returns True if the client is initialized, false otherwise.
 */
export function isGeminiActive(): boolean {
  return getGenAI() !== null;
}

/**
 * Generates an AI reflection and proposes Active User Memory updates for a journal entry.
 *
 * NOTE: This is a placeholder skeleton function for Milestone 1.
 * It will not perform actual network requests or prompt generation.
 *
 * @param journalContent - The text body of the user's journal entry.
 * @param activeMemory - The current ActiveUserMemory of the user.
 * @returns A promise that resolves to the Structured Reflection Result.
 * @throws An error indicating the service is inactive or not yet implemented.
 */
export async function generateReflection(
  journalContent: string,
  activeMemory: ActiveUserMemory | null
): Promise<ReflectionResult> {
  // Use arguments to avoid unused variable warning
  void journalContent;
  void activeMemory;

  if (!isGeminiActive()) {
    throw new Error(
      'Gemini AI Service is inactive. Please configure a valid GEMINI_API_KEY in your environment.'
    );
  }

  // Placeholder error as AI generation is out of scope for this infrastructure milestone.
  throw new Error('AI reflection generation is not yet implemented.');
}

