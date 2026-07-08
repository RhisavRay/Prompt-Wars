import type { Emotion } from '@/types/journal';
import type { ActiveUserMemory } from '../types';

export const SYSTEM_INSTRUCTION = `You are Reflect's thoughtful reflection companion.
Your purpose is to help users better understand themselves by reflecting their thoughts back with added depth, highlighting patterns, and asking gentle, open-ended questions.

Follow these strict rules at all times:
1. Mirror, Don't Direct: Keep your reflection observational. Never prescribe actions, instruct, or tell the user what they "should" do.
2. Emotional Safety: Validate and acknowledge the user's feelings without judging, minimizing, diagnosing, or shaming them. Do not diagnose any mental health conditions or make definitive psychological claims.
3. Observational Language: Use phrasing that communicates appropriate uncertainty (e.g., "It seems...", "Your writing suggests...", "You might be feeling...", "Perhaps..."). Avoid absolute declarations like "You are...", "This proves...".
4. Brief Quotations: Use short, direct quotes from the journal entry only when they genuinely improve the reflection. Never overuse quotations.
5. No AI Titles: Do not generate a title for the reflection.
6. Propose Memory Updates: Based on the entry, identify any changes or new observations to propose as updates to the user's Active User Memory.
7. Active Memory Categories:
   - "activeLifeEvents": Current events/incidents.
   - "ongoingChallenges": Evolving difficulties/stressors.
   - "importantPeople": Relationships or individuals mentioned.
   - "recurringThemes": Reemerging topics across entries.
   - "behaviouralObservations": Noticed habits or reflection style.
   - "communicationStyle": Evolving voice or tone patterns.
   - "stableFacts": Concrete constants (e.g. job, location, family).

You must return a valid JSON object matching the requested schema. Ensure all fields are fully populated and conform strictly to formatting types.`;

/**
 * Builds the user prompt for the reflection pipeline.
 * Combines journal content, initial check-in (if provided), active user memory, and the current date.
 * Does not include user IDs, metadata, or auth secrets.
 *
 * @param journalContent - The text contents of the journal.
 * @param initialCheckIn - The initial check-in emotion selected by the user.
 * @param activeMemory - The user's ActiveUserMemory context.
 * @param currentDate - The current date string.
 * @returns The formatted prompt string.
 */
export function buildReflectionPrompt(
  journalContent: string,
  initialCheckIn: Emotion | null | undefined,
  activeMemory: ActiveUserMemory | null | undefined,
  currentDate: string
): string {
  const parts: string[] = [];

  parts.push(`Current Date: ${currentDate}\n`);

  if (initialCheckIn) {
    parts.push(`User's Initial Check-In Emotion: ${initialCheckIn}\n`);
  }

  if (activeMemory) {
    parts.push('--- ACTIVE USER CONTEXT (Evolving Memory) ---');
    if (activeMemory.stableFacts?.length) {
      parts.push(`Stable Facts: ${activeMemory.stableFacts.join(', ')}`);
    }
    if (activeMemory.importantPeople?.length) {
      parts.push(`Important People: ${activeMemory.importantPeople.join(', ')}`);
    }
    if (activeMemory.activeLifeEvents?.length) {
      parts.push(`Active Life Events: ${activeMemory.activeLifeEvents.join(', ')}`);
    }
    if (activeMemory.ongoingChallenges?.length) {
      parts.push(`Ongoing Challenges: ${activeMemory.ongoingChallenges.join(', ')}`);
    }
    if (activeMemory.recurringThemes?.length) {
      parts.push(`Recurring Themes: ${activeMemory.recurringThemes.join(', ')}`);
    }
    if (activeMemory.behaviouralObservations?.length) {
      parts.push(`Behavioral Observations: ${activeMemory.behaviouralObservations.join(', ')}`);
    }
    if (activeMemory.communicationStyle?.length) {
      parts.push(`Communication Style: ${activeMemory.communicationStyle.join(', ')}`);
    }
    parts.push('--------------------------------------------\n');
  }

  parts.push('--- JOURNAL ENTRY CONTENT ---');
  parts.push(journalContent);
  parts.push('-----------------------------');

  return parts.join('\n');
}
