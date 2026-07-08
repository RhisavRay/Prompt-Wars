/**
 * AI Prompt Templates and Construction Layer
 *
 * NOTE: Prompt engineering is out of scope for this milestone and will be
 * fully implemented during Milestone 2.
 */

export interface PromptBuilderOptions {
  readonly includeContext: boolean;
}

export const PROMPTS = {
  reflectionSystemInstruction: 'Placeholder system instruction for reflection generation.',
  memoryUpdateInstruction: 'Placeholder system instruction for active memory extraction.',
} as const;
