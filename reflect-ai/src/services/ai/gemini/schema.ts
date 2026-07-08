import { SUPPORTED_EMOTIONS, SUPPORTED_MEMORY_OPERATIONS } from '@/constants/ai';

/**
 * Structured Response Schema for Gemini
 * Conforms to the @google/genai SDK Schema definition format.
 * Defines the contract for the structured JSON response containing:
 * 1. Journal Memory
 * 2. Reflection
 * 3. Proposed Memory Updates
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    journalMemory: {
      type: 'OBJECT',
      description: 'The immutable snapshot analysis of this specific journal entry.',
      properties: {
        summary: {
          type: 'STRING',
          description: 'A brief, concise summary of the journal entry (maximum 200 characters).',
        },
        primaryEmotion: {
          type: 'STRING',
          enum: [...SUPPORTED_EMOTIONS],
          description: 'The dominant emotion observed in the text, or null if none is clear.',
          nullable: true,
        },
        secondaryEmotion: {
          type: 'STRING',
          enum: [...SUPPORTED_EMOTIONS],
          description: 'The secondary emotion observed in the text, or null if none is clear.',
          nullable: true,
        },
        emotionalShift: {
          type: 'OBJECT',
          description: 'Any shift in emotional state that occurred during or within the entry, if observable.',
          properties: {
            from: {
              type: 'STRING',
              enum: [...SUPPORTED_EMOTIONS],
              description: 'The starting emotion state, or null if starting from a neutral state.',
              nullable: true,
            },
            to: {
              type: 'STRING',
              enum: [...SUPPORTED_EMOTIONS],
              description: 'The ending emotion state.',
            },
            trigger: {
              type: 'STRING',
              description: 'The event, thought, or trigger that caused the transition.',
            },
          },
          required: ['to', 'trigger'],
          nullable: true,
        },
        themes: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Key themes or topics identified in this specific entry (limit to 5).',
        },
        events: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Specific incidents or events mentioned in the entry.',
        },
        peopleMentioned: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'People explicitly mentioned in the entry.',
        },
        importantObservations: {
          type: 'ARRAY',
          items: { type: 'STRING' },
          description: 'Noteworthy behavioral patterns, tendencies, or thoughts observed in this entry (limit to 4).',
        },
      },
      required: [
        'summary',
        'primaryEmotion',
        'secondaryEmotion',
        'themes',
        'events',
        'peopleMentioned',
        'importantObservations',
      ],
    },
    reflection: {
      type: 'OBJECT',
      description: 'The mirroring reflection response to present to the user.',
      properties: {
        body: {
          type: 'STRING',
          description: 'The core reflection text. Mirrors the user\'s thoughts with depth and emotional safety.',
        },
        followUpQuestion: {
          type: 'STRING',
          description: 'One thoughtful, open-ended question inviting further self-discovery.',
        },
      },
      required: ['body', 'followUpQuestion'],
    },
    memoryUpdates: {
      type: 'ARRAY',
      description: 'Proposed operations to apply to the evolving Active User Memory.',
      items: {
        type: 'OBJECT',
        properties: {
          operation: {
            type: 'STRING',
            enum: [...SUPPORTED_MEMORY_OPERATIONS],
            description: 'The type of change being proposed.',
          },
          target: {
            type: 'STRING',
            description: 'The category field in ActiveUserMemory being updated (e.g., "activeLifeEvents", "ongoingChallenges", "importantPeople", "recurringThemes", "behaviouralObservations", "communicationStyle", "stableFacts").',
          },
          payload: {
            type: 'STRING',
            description: 'The text value or data to add, update, remove, archive, or restore.',
          },
          reason: {
            type: 'STRING',
            description: 'The specific clinical or reflective rationale for proposing this update.',
          },
          confidence: {
            type: 'NUMBER',
            description: 'The confidence score of this update (between 0.0 and 1.0).',
          },
        },
        required: ['operation', 'target', 'payload', 'reason', 'confidence'],
      },
    },
  },
  required: ['journalMemory', 'reflection', 'memoryUpdates'],
} as const;
