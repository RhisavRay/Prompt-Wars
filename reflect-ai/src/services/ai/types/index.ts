/**
 * AI Module Type Definitions
 * Re-exports shared AI models, service-level types, and custom errors.
 */

export * from '@/types/ai';
export * from '../errors';

export interface ServiceValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors: readonly string[];
}
