export type AIErrorCode =
  | 'MISSING_API_KEY'
  | 'INVALID_CONFIG'
  | 'GEMINI_REQUEST_FAILED'
  | 'INVALID_JSON'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'TIMEOUT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN_ERROR';

/**
 * Custom Error representing failures within the AI Service integration.
 * Ensures caller can handle failure cases gracefully with structured error codes.
 */
export class AIServiceError extends Error {
  constructor(
    public readonly code: AIErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIServiceError);
    }
  }
}
