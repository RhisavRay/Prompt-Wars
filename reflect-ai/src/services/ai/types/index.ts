/**
 * AI Module Type Definitions
 * Re-exports shared AI models and defines service-level types.
 */

export * from '@/types/ai';

export interface ServiceValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors: readonly string[];
}
