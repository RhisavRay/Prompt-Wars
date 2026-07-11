import { getGenAI } from './client';
import { AI_CONFIG } from '../config';
import { buildReflectionPrompt, SYSTEM_INSTRUCTION, buildDeletionPrompt, DELETION_SYSTEM_INSTRUCTION } from '../prompts';
import { validateGeminiResponse, validateDeletionResponse } from '../validators';
import { AIServiceError } from '../errors';
import { GEMINI_RESPONSE_SCHEMA, GEMINI_DELETION_SCHEMA } from './schema';
import type { Emotion } from '@/types/journal';
import type { ActiveUserMemory, ReflectionResult, JournalMemory, MemoryUpdateOperation } from '../types';

/**
 * Helper to wrap a promise with a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new AIServiceError('TIMEOUT', `Gemini request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

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
 * Runs through a robust validation pipeline (Prompt -> Gemini -> Validation -> Structured Output).
 * Handles rate limits, timeouts, and validation errors gracefully.
 *
 * @param journalContent - The text body of the user's journal entry.
 * @param activeMemory - The current ActiveUserMemory of the user.
 * @param initialCheckIn - Optional user-selected emotion check-in.
 * @returns A promise that resolves to the validated ReflectionResult.
 * @throws AIServiceError with a structured error code representing the failure.
 */
export async function generateReflection(
  journalContent: string,
  activeMemory: ActiveUserMemory | null,
  initialCheckIn?: Emotion | null
): Promise<ReflectionResult> {
  // 1. Validation of environment variables
  if (!isGeminiActive()) {
    throw new AIServiceError(
      'MISSING_API_KEY',
      'Gemini AI API key is missing or invalid. Please set GEMINI_API_KEY in your environment.'
    );
  }

  // 2. Build Prompt
  const currentDate = new Date().toISOString();
  const userPrompt = buildReflectionPrompt(journalContent, initialCheckIn, activeMemory, currentDate);

  let attempt = 0;
  const maxAttempts = AI_CONFIG.gemini.retryCount;
  let lastError: unknown;

  // 3. Retry loop with exponential backoff
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const ai = getGenAI();
      if (!ai) {
        throw new AIServiceError(
          'MISSING_API_KEY',
          'Gemini AI API key is missing or invalid. Please set GEMINI_API_KEY in your environment.'
        );
      }

      // Call Gemini using the official unified SDK
      const call = ai.models.generateContent({
        model: AI_CONFIG.gemini.model,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_RESPONSE_SCHEMA as unknown as Record<string, unknown>,
          temperature: AI_CONFIG.gemini.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxOutputTokens,
        },
      });

      // Wrap request in timeout
      const response = await withTimeout(call, AI_CONFIG.gemini.timeoutMs);

      const responseText = response.text;
      if (!responseText) {
        throw new AIServiceError('INVALID_JSON', 'Gemini returned an empty response text.');
      }

      // 4. Validate output matches strict contracts
      const validationResult = validateGeminiResponse(responseText);

      if (!validationResult.success) {
        throw new AIServiceError(
          'SCHEMA_VALIDATION_FAILED',
          `Schema validation failed: ${validationResult.errors.join('; ')}`,
          validationResult.errors
        );
      }

      // Return fully typed validation result
      return validationResult.data!;
    } catch (error: unknown) {
      lastError = error;

      // Do NOT retry for configuration or validation failures
      if (
        error instanceof AIServiceError &&
        (error.code === 'MISSING_API_KEY' ||
          error.code === 'INVALID_CONFIG' ||
          error.code === 'SCHEMA_VALIDATION_FAILED')
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Identify rate limits and network/HTTP errors
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        const rateLimitErr = new AIServiceError('RATE_LIMIT_EXCEEDED', 'Gemini API rate limit exceeded.', error);
        if (attempt >= maxAttempts) {
          throw rateLimitErr;
        }
        lastError = rateLimitErr;
      } else if (error instanceof AIServiceError && error.code === 'TIMEOUT') {
        if (attempt >= maxAttempts) {
          throw error;
        }
      } else {
        const requestErr = new AIServiceError(
          'GEMINI_REQUEST_FAILED',
          `Gemini request failed: ${errorMessage}`,
          error
        );
        if (attempt >= maxAttempts) {
          throw requestErr;
        }
        lastError = requestErr;
      }

      // Wait with exponential backoff before next attempt
      const backoffMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new AIServiceError('UNKNOWN_ERROR', 'AI reflection request failed.');
}

/**
 * Generates proposed memory updates to clean up ActiveUserMemory when a journal entry is deleted.
 * Relies on the distilled JournalMemory snapshot.
 */
export async function generateDeletionUpdates(
  journalMemory: JournalMemory,
  activeMemory: ActiveUserMemory | null
): Promise<MemoryUpdateOperation[]> {
  // 1. Validation of environment variables
  if (!isGeminiActive()) {
    throw new AIServiceError(
      'MISSING_API_KEY',
      'Gemini AI API key is missing or invalid. Please set GEMINI_API_KEY in your environment.'
    );
  }

  // 2. Build Prompt
  const userPrompt = buildDeletionPrompt(journalMemory, activeMemory);

  let attempt = 0;
  const maxAttempts = AI_CONFIG.gemini.retryCount;
  let lastError: unknown;

  // 3. Retry loop with exponential backoff
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const ai = getGenAI();
      if (!ai) {
        throw new AIServiceError(
          'MISSING_API_KEY',
          'Gemini AI API key is missing or invalid. Please set GEMINI_API_KEY in your environment.'
        );
      }

      // Call Gemini using the official unified SDK
      const call = ai.models.generateContent({
        model: AI_CONFIG.gemini.model,
        contents: userPrompt,
        config: {
          systemInstruction: DELETION_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: GEMINI_DELETION_SCHEMA as unknown as Record<string, unknown>,
          temperature: AI_CONFIG.gemini.temperature,
          maxOutputTokens: AI_CONFIG.gemini.maxOutputTokens,
        },
      });

      // Wrap request in timeout
      const response = await withTimeout(call, AI_CONFIG.gemini.timeoutMs);

      const responseText = response.text;
      if (!responseText) {
        throw new AIServiceError('INVALID_JSON', 'Gemini returned an empty response text.');
      }

      // 4. Validate output matches strict contracts
      const validationResult = validateDeletionResponse(responseText);

      if (!validationResult.success) {
        throw new AIServiceError(
          'SCHEMA_VALIDATION_FAILED',
          `Schema validation failed: ${validationResult.errors.join('; ')}`,
          validationResult.errors
        );
      }

      return validationResult.data!;
    } catch (error: unknown) {
      lastError = error;

      // Do NOT retry for configuration or validation failures
      if (
        error instanceof AIServiceError &&
        (error.code === 'MISSING_API_KEY' ||
          error.code === 'INVALID_CONFIG' ||
          error.code === 'SCHEMA_VALIDATION_FAILED')
      ) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);

      // Identify rate limits and network/HTTP errors
      if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        const rateLimitErr = new AIServiceError('RATE_LIMIT_EXCEEDED', 'Gemini API rate limit exceeded.', error);
        if (attempt >= maxAttempts) {
          throw rateLimitErr;
        }
        lastError = rateLimitErr;
      } else if (error instanceof AIServiceError && error.code === 'TIMEOUT') {
        if (attempt >= maxAttempts) {
          throw error;
        }
      } else {
        const requestErr = new AIServiceError(
          'GEMINI_REQUEST_FAILED',
          `Gemini request failed: ${errorMessage}`,
          error
        );
        if (attempt >= maxAttempts) {
          throw requestErr;
        }
        lastError = requestErr;
      }

      // Wait with exponential backoff before next attempt
      const backoffMs = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new AIServiceError('UNKNOWN_ERROR', 'AI deletion updates generation failed.');
}
