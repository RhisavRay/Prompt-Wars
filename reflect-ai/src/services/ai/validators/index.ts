import type { Emotion } from '@/types/journal';
import type { ReflectionResult, MemoryUpdateOperation } from '../types';
import type { ServiceValidationResult } from '../types';
import { SUPPORTED_EMOTIONS, SUPPORTED_MEMORY_OPERATIONS, AI_CONSTANTS } from '@/constants/ai';

/**
 * Validates whether a value is a valid Emotion.
 */
function isEmotion(value: unknown): value is Emotion {
  return typeof value === 'string' && SUPPORTED_EMOTIONS.includes(value as Emotion);
}

/**
 * Validates whether a value is a valid MemoryUpdateAction.
 */
function isMemoryUpdateAction(value: unknown): value is MemoryUpdateOperation['operation'] {
  return typeof value === 'string' && SUPPORTED_MEMORY_OPERATIONS.includes(value as MemoryUpdateOperation['operation']);
}

/**
 * Reusable validator that parses and validates a raw response string from Gemini.
 * Ensuring it conforms to the strict Structured Reflection Result contract.
 *
 * @param rawResponse - The raw JSON string returned by the model.
 * @returns ServiceValidationResult containing the parsed and typed data or a list of validation errors.
 */
export function validateGeminiResponse(rawResponse: string): ServiceValidationResult<ReflectionResult> {
  const errors: string[] = [];
  let parsed: unknown;

  // 1. JSON Parsing
  try {
    parsed = JSON.parse(rawResponse);
  } catch (err: unknown) {
    return {
      success: false,
      errors: [`Invalid JSON format: ${err instanceof Error ? err.message : String(err)}`],
    };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      success: false,
      errors: ['Response root must be an object.'],
    };
  }

  const parsedObj = parsed as Record<string, unknown>;

  // 2. Unknown properties at Root level
  const rootKeys = Object.keys(parsedObj);
  const allowedRootKeys = ['journalMemory', 'reflection', 'memoryUpdates'];
  for (const key of rootKeys) {
    if (!allowedRootKeys.includes(key)) {
      errors.push(`Unknown property at response root: "${key}".`);
    }
  }

  // Check required root structures
  if (!('journalMemory' in parsedObj)) errors.push('Missing required property: "journalMemory".');
  if (!('reflection' in parsedObj)) errors.push('Missing required property: "reflection".');
  if (!('memoryUpdates' in parsedObj)) errors.push('Missing required property: "memoryUpdates".');

  // 3. Validate journalMemory if present and is an object
  if ('journalMemory' in parsedObj) {
    const journalMemory = parsedObj.journalMemory;
    if (typeof journalMemory !== 'object' || journalMemory === null || Array.isArray(journalMemory)) {
      errors.push('Property "journalMemory" must be an object.');
    } else {
      const journalMemoryObj = journalMemory as Record<string, unknown>;
      // Unknown properties check
      const journalMemoryKeys = Object.keys(journalMemoryObj);
      const allowedJournalMemoryKeys = [
        'entryId',
        'createdAt',
        'summary',
        'primaryEmotion',
        'secondaryEmotion',
        'emotionalShift',
        'themes',
        'events',
        'peopleMentioned',
        'importantObservations',
      ];
      for (const key of journalMemoryKeys) {
        if (!allowedJournalMemoryKeys.includes(key)) {
          errors.push(`Unknown property in journalMemory: "${key}".`);
        }
      }

      // Required fields check
      const requiredFields = [
        'summary',
        'primaryEmotion',
        'secondaryEmotion',
        'themes',
        'events',
        'peopleMentioned',
        'importantObservations',
      ];
      for (const field of requiredFields) {
        if (!(field in journalMemoryObj)) {
          errors.push(`Missing required property in journalMemory: "${field}".`);
        }
      }

      // Validate summary if present
      if ('summary' in journalMemoryObj) {
        if (typeof journalMemoryObj.summary !== 'string') {
          errors.push('journalMemory.summary must be a string.');
        } else if (journalMemoryObj.summary.length > AI_CONSTANTS.maxJournalSummaryLength) {
          errors.push(`journalMemory.summary exceeds maximum length of ${AI_CONSTANTS.maxJournalSummaryLength} characters.`);
        }
      }

      // Validate primaryEmotion if present
      if ('primaryEmotion' in journalMemoryObj) {
        if (journalMemoryObj.primaryEmotion !== null && !isEmotion(journalMemoryObj.primaryEmotion)) {
          errors.push(`journalMemory.primaryEmotion contains invalid emotion: "${journalMemoryObj.primaryEmotion}".`);
        }
      }

      // Validate secondaryEmotion if present
      if ('secondaryEmotion' in journalMemoryObj) {
        if (journalMemoryObj.secondaryEmotion !== null && !isEmotion(journalMemoryObj.secondaryEmotion)) {
          errors.push(`journalMemory.secondaryEmotion contains invalid emotion: "${journalMemoryObj.secondaryEmotion}".`);
        }
      }

      // Validate emotionalShift if present
      if ('emotionalShift' in journalMemoryObj && journalMemoryObj.emotionalShift !== null) {
        const shift = journalMemoryObj.emotionalShift;
        if (typeof shift !== 'object' || Array.isArray(shift)) {
          errors.push('journalMemory.emotionalShift must be an object or null.');
        } else {
          const shiftObj = shift as Record<string, unknown>;
          // Unknown properties check
          const shiftKeys = Object.keys(shiftObj);
          const allowedShiftKeys = ['from', 'to', 'trigger'];
          for (const key of shiftKeys) {
            if (!allowedShiftKeys.includes(key)) {
              errors.push(`Unknown property in journalMemory.emotionalShift: "${key}".`);
            }
          }

          // fields validation
          if (!('to' in shiftObj)) {
            errors.push('Missing required property in journalMemory.emotionalShift: "to".');
          } else if (!isEmotion(shiftObj.to)) {
            errors.push(`journalMemory.emotionalShift.to contains invalid emotion: "${shiftObj.to}".`);
          }

          if ('from' in shiftObj && shiftObj.from !== null && !isEmotion(shiftObj.from)) {
            errors.push(`journalMemory.emotionalShift.from contains invalid emotion: "${shiftObj.from}".`);
          }

          if (!('trigger' in shiftObj)) {
            errors.push('Missing required property in journalMemory.emotionalShift: "trigger".');
          } else if (typeof shiftObj.trigger !== 'string') {
            errors.push('journalMemory.emotionalShift.trigger must be a string.');
          }
        }
      }

      // themes
      if ('themes' in journalMemoryObj) {
        if (!Array.isArray(journalMemoryObj.themes)) {
          errors.push('journalMemory.themes must be an array.');
        } else {
          const themesArr = journalMemoryObj.themes as unknown[];
          if (themesArr.length > AI_CONSTANTS.themeLimit) {
            errors.push(`journalMemory.themes exceeds the maximum size limit of ${AI_CONSTANTS.themeLimit}.`);
          }
          themesArr.forEach((theme: unknown, index: number) => {
            if (typeof theme !== 'string') {
              errors.push(`journalMemory.themes[${index}] must be a string.`);
            }
          });
        }
      }

      // events
      if ('events' in journalMemoryObj) {
        if (!Array.isArray(journalMemoryObj.events)) {
          errors.push('journalMemory.events must be an array.');
        } else {
          const eventsArr = journalMemoryObj.events as unknown[];
          eventsArr.forEach((event: unknown, index: number) => {
            if (typeof event !== 'string') {
              errors.push(`journalMemory.events[${index}] must be a string.`);
            }
          });
        }
      }

      // peopleMentioned
      if ('peopleMentioned' in journalMemoryObj) {
        if (!Array.isArray(journalMemoryObj.peopleMentioned)) {
          errors.push('journalMemory.peopleMentioned must be an array.');
        } else {
          const peopleArr = journalMemoryObj.peopleMentioned as unknown[];
          peopleArr.forEach((person: unknown, index: number) => {
            if (typeof person !== 'string') {
              errors.push(`journalMemory.peopleMentioned[${index}] must be a string.`);
            }
          });
        }
      }

      // importantObservations
      if ('importantObservations' in journalMemoryObj) {
        if (!Array.isArray(journalMemoryObj.importantObservations)) {
          errors.push('journalMemory.importantObservations must be an array.');
        } else {
          const observationsArr = journalMemoryObj.importantObservations as unknown[];
          if (observationsArr.length > AI_CONSTANTS.observationLimit) {
            errors.push(`journalMemory.importantObservations exceeds the maximum size limit of ${AI_CONSTANTS.observationLimit}.`);
          }
          observationsArr.forEach((observation: unknown, index: number) => {
            if (typeof observation !== 'string') {
              errors.push(`journalMemory.importantObservations[${index}] must be a string.`);
            }
          });
        }
      }
    }
  }

  // 4. Validate reflection if present and is an object
  if ('reflection' in parsedObj) {
    const reflection = parsedObj.reflection;
    if (typeof reflection !== 'object' || reflection === null || Array.isArray(reflection)) {
      errors.push('Property "reflection" must be an object.');
    } else {
      const reflectionObj = reflection as Record<string, unknown>;
      // Unknown properties check
      const reflectionKeys = Object.keys(reflectionObj);
      const allowedReflectionKeys = ['title', 'body', 'followUpQuestion'];
      for (const key of reflectionKeys) {
        if (!allowedReflectionKeys.includes(key)) {
          errors.push(`Unknown property in reflection: "${key}".`);
        }
      }

      // Required fields check
      const requiredFields = ['title', 'body', 'followUpQuestion'];
      for (const field of requiredFields) {
        if (!(field in reflectionObj)) {
          errors.push(`Missing required property in reflection: "${field}".`);
        }
      }

      if ('title' in reflectionObj && typeof reflectionObj.title !== 'string') {
        errors.push('reflection.title must be a string.');
      } else if (typeof reflectionObj.title === 'string' && reflectionObj.title.length > AI_CONSTANTS.maxReflectionTitleLength) {
        errors.push(`reflection.title exceeds maximum length of ${AI_CONSTANTS.maxReflectionTitleLength} characters.`);
      }

      if ('body' in reflectionObj && typeof reflectionObj.body !== 'string') {
        errors.push('reflection.body must be a string.');
      } else if (typeof reflectionObj.body === 'string' && reflectionObj.body.length > AI_CONSTANTS.maxReflectionBodyLength) {
        errors.push(`reflection.body exceeds maximum length of ${AI_CONSTANTS.maxReflectionBodyLength} characters.`);
      }

      if ('followUpQuestion' in reflectionObj && typeof reflectionObj.followUpQuestion !== 'string') {
        errors.push('reflection.followUpQuestion must be a string.');
      } else if (typeof reflectionObj.followUpQuestion === 'string' && reflectionObj.followUpQuestion.length > AI_CONSTANTS.maxReflectionFollowUpQuestionLength) {
        errors.push(`reflection.followUpQuestion exceeds maximum length of ${AI_CONSTANTS.maxReflectionFollowUpQuestionLength} characters.`);
      }
    }
  }

  // 5. Validate memoryUpdates if present
  if ('memoryUpdates' in parsedObj) {
    const memoryUpdates = parsedObj.memoryUpdates;
    if (!Array.isArray(memoryUpdates)) {
      errors.push('Property "memoryUpdates" must be an array.');
    } else {
      const updatesArr = memoryUpdates as unknown[];
      updatesArr.forEach((op: unknown, index: number) => {
        if (typeof op !== 'object' || op === null || Array.isArray(op)) {
          errors.push(`memoryUpdates[${index}] must be an object.`);
        } else {
          const opObj = op as Record<string, unknown>;
          // Unknown properties check
          const opKeys = Object.keys(opObj);
          const allowedOpKeys = ['operation', 'target', 'payload', 'reason', 'confidence'];
          for (const key of opKeys) {
            if (!allowedOpKeys.includes(key)) {
              errors.push(`Unknown property in memoryUpdates[${index}]: "${key}".`);
            }
          }

          // Required fields check
          const requiredFields = ['operation', 'target', 'payload', 'reason', 'confidence'];
          for (const field of requiredFields) {
            if (!(field in opObj)) {
              errors.push(`Missing required property in memoryUpdates[${index}]: "${field}".`);
            }
          }

          if ('operation' in opObj && !isMemoryUpdateAction(opObj.operation)) {
            errors.push(`memoryUpdates[${index}].operation contains invalid value: "${opObj.operation}".`);
          }

          if ('target' in opObj && typeof opObj.target !== 'string') {
            errors.push(`memoryUpdates[${index}].target must be a string.`);
          }

          if ('reason' in opObj && typeof opObj.reason !== 'string') {
            errors.push(`memoryUpdates[${index}].reason must be a string.`);
          }

          if ('confidence' in opObj) {
            if (typeof opObj.confidence !== 'number') {
              errors.push(`memoryUpdates[${index}].confidence must be a number.`);
            } else if (opObj.confidence < 0 || opObj.confidence > 1) {
              errors.push(`memoryUpdates[${index}].confidence must be between 0.0 and 1.0.`);
            }
          }
        }
      });
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  interface RawJournalMemory {
    entryId?: string;
    summary: string;
    primaryEmotion: Emotion | null;
    secondaryEmotion: Emotion | null;
    emotionalShift: { from: Emotion | null; to: Emotion; trigger: string } | null;
    themes: string[];
    events: string[];
    peopleMentioned: string[];
    importantObservations: string[];
    createdAt?: string;
  }

  interface RawAIReflection {
    title: string;
    body: string;
    followUpQuestion: string;
  }

  interface RawMemoryUpdate {
    operation: MemoryUpdateOperation['operation'];
    target: string;
    payload: unknown;
    reason: string;
    confidence: number;
  }

  // Since it passed all validations, construct the ReflectionResult with strong typing.
  const journalMemory = parsedObj.journalMemory as unknown as RawJournalMemory;
  const reflection = parsedObj.reflection as unknown as RawAIReflection;
  const memoryUpdates = parsedObj.memoryUpdates as unknown as RawMemoryUpdate[];

  const validatedResult: ReflectionResult = {
    journalMemory: {
      entryId: journalMemory.entryId ?? '',
      summary: journalMemory.summary,
      primaryEmotion: journalMemory.primaryEmotion,
      secondaryEmotion: journalMemory.secondaryEmotion,
      emotionalShift: journalMemory.emotionalShift
        ? {
            from: journalMemory.emotionalShift.from ?? null,
            to: journalMemory.emotionalShift.to,
            trigger: journalMemory.emotionalShift.trigger,
          }
        : null,
      themes: journalMemory.themes,
      events: journalMemory.events,
      peopleMentioned: journalMemory.peopleMentioned,
      importantObservations: journalMemory.importantObservations,
      createdAt: journalMemory.createdAt ?? new Date().toISOString(),
    },
    reflection: {
      title: reflection.title,
      body: reflection.body,
      followUpQuestion: reflection.followUpQuestion,
    },
    memoryUpdates: memoryUpdates.map((op) => ({
      operation: op.operation,
      target: op.target,
      payload: op.payload,
      reason: op.reason,
      confidence: op.confidence,
    })),
  };


  return {
    success: true,
    data: validatedResult,
    errors: [],
  };
}
