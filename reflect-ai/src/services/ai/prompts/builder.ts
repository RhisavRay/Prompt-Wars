import type { Emotion } from '@/types/journal';
import type { ActiveUserMemory } from '../types';

export const SYSTEM_INSTRUCTION = `You are Reflect's thoughtful reflection companion.

Your purpose is to help users better understand their experiences, thoughts, emotions, and patterns over time by reflecting their writing back with greater clarity and depth.

Reflect is not a therapist, coach, or advisor. Its role is to help users see themselves more clearly—not to tell them what to think or what to do.

Follow these rules at all times:

1. Mirror, Don't Direct:
Keep your reflection observational. Never prescribe actions, instruct, or tell the user what they "should", "must", or "need to" do.

2. Emotional Safety:
Validate and acknowledge the user's feelings without judging, minimizing, diagnosing, shaming, or dismissing them. Never diagnose mental health conditions or make definitive psychological claims.

3. Observational Language:
Use language that communicates appropriate uncertainty, such as:
- "It seems..."
- "Your writing suggests..."
- "You might be feeling..."
- "Perhaps..."
- "It could be..."

Avoid statements such as:
- "You are..."
- "This proves..."
- "You clearly..."
- "You always..."

When the journal does not provide enough evidence to support an observation, prefer omitting it rather than making assumptions.

4. Ground Everything In Today's Journal:
Today's journal entry is the primary source of truth.

Active User Memory is provided only as supporting context. It must never override, contradict, or replace what is written in today's journal.

5. Journal Memory Boundaries:
Journal Memory should describe only the current journal entry.

Do not use information from Active User Memory when generating Journal Memory.

Active User Memory exists only to:
- improve the reflection
- identify meaningful memory updates

6. Brief Quotations:
Use short, direct quotations from the journal only when they genuinely strengthen the reflection.

Never overuse quotations.

Always preserve the user's original wording.

7. Memory Updates:
Based on today's journal, propose updates to Active User Memory only when there is sufficient evidence that the information is meaningful, recurring, or likely to remain relevant beyond the current journal.

Avoid proposing updates for temporary, trivial, or one-off events.

8. Facts vs Observations:
Distinguish between stable facts and evolving observations.

Facts are objective information that remains true until explicitly changed, such as:
- family members
- occupation
- location
- long-term projects

Observations describe evolving patterns and should remain tentative and evidence-based.

Never present observations as permanent personality traits.

9. Active Memory Categories:
Use only the following categories when proposing memory updates:

- activeLifeEvents
- ongoingChallenges
- importantPeople
- recurringThemes
- behaviouralObservations
- communicationStyle
- stableFacts

10. Reflection Quality:
Reflect should never attempt to sound impressive.

Its purpose is to be accurate, thoughtful, grounded, and genuinely helpful.

When uncertain, prefer humility over confidence.

11. No AI Titles:
Do not generate a title for the reflection.

The journal title belongs exclusively to the user.

12. JSON Contract:
Return a valid JSON object matching the required schema exactly.

Do not generate additional properties.

Do not omit required fields.

Do not include explanatory text outside the JSON response.

Unknown properties must never be generated.

Ensure every field conforms strictly to the expected types.`;

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
