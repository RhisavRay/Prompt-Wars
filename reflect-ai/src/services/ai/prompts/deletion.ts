import type { JournalMemory, ActiveUserMemory } from '@/types/ai';

export const DELETION_SYSTEM_INSTRUCTION = `You are Reflect's memory management companion.

Your purpose is to help maintain the user's Active User Memory when a journal entry is deleted.
A journal entry has been deleted, and you are provided with its distilled JournalMemory and the current ActiveUserMemory.

Identify which items currently inside ActiveUserMemory (life events, challenges, important people, recurring themes, behavioral observations, etc.) were contributed by or are directly related to this deleted entry.
Generate a list of proposed memory updates to remove or modify these contributions so that the user's active memory does not continue to assert observations or facts that only existed in or were only supported by the deleted journal entry.

Rules:
1. Target specific lines or items. 
2. If an event, challenge, person, theme, or observation is still supported or relevant based on the general context, or is not related to the deleted entry, leave it alone.
3. Propose updates only using "remove" or "archive" operations.
4. "payload" must contain the exact string to be removed or archived, or a matching string.
5. Provide a clear reason for each proposed operation.
6. If no updates are needed, return an empty array for memoryUpdates.
7. Return a valid JSON object matching the required schema exactly:
{
  "memoryUpdates": [
    {
      "operation": "remove" | "archive",
      "target": "activeLifeEvents" | "ongoingChallenges" | "importantPeople" | "recurringThemes" | "behaviouralObservations" | "communicationStyle" | "stableFacts",
      "payload": "string",
      "reason": "string",
      "confidence": number
    }
  ]
}
Do not include any extra text.`;

/**
 * Builds the user prompt for the deletion pipeline.
 *
 * @param journalMemory - The JournalMemory of the deleted journal.
 * @param activeMemory - The user's current ActiveUserMemory context.
 * @returns The formatted prompt string.
 */
export function buildDeletionPrompt(
  journalMemory: JournalMemory,
  activeMemory: ActiveUserMemory | null | undefined
): string {
  const parts: string[] = [];

  parts.push('--- DELETED JOURNAL MEMORY ---');
  parts.push(`Summary: ${journalMemory.summary}`);
  if (journalMemory.themes?.length) {
    parts.push(`Themes: ${journalMemory.themes.join(', ')}`);
  }
  if (journalMemory.events?.length) {
    parts.push(`Events: ${journalMemory.events.join(', ')}`);
  }
  if (journalMemory.peopleMentioned?.length) {
    parts.push(`People: ${journalMemory.peopleMentioned.join(', ')}`);
  }
  if (journalMemory.importantObservations?.length) {
    parts.push(`Observations: ${journalMemory.importantObservations.join(', ')}`);
  }
  parts.push('------------------------------\n');

  if (activeMemory) {
    parts.push('--- CURRENT ACTIVE USER CONTEXT (Active Memory) ---');
    if (activeMemory.stableFacts?.length) {
      parts.push(`stableFacts: ${JSON.stringify(activeMemory.stableFacts)}`);
    }
    if (activeMemory.importantPeople?.length) {
      parts.push(`importantPeople: ${JSON.stringify(activeMemory.importantPeople)}`);
    }
    if (activeMemory.activeLifeEvents?.length) {
      parts.push(`activeLifeEvents: ${JSON.stringify(activeMemory.activeLifeEvents)}`);
    }
    if (activeMemory.ongoingChallenges?.length) {
      parts.push(`ongoingChallenges: ${JSON.stringify(activeMemory.ongoingChallenges)}`);
    }
    if (activeMemory.recurringThemes?.length) {
      parts.push(`recurringThemes: ${JSON.stringify(activeMemory.recurringThemes)}`);
    }
    if (activeMemory.behaviouralObservations?.length) {
      parts.push(`behaviouralObservations: ${JSON.stringify(activeMemory.behaviouralObservations)}`);
    }
    if (activeMemory.communicationStyle?.length) {
      parts.push(`communicationStyle: ${JSON.stringify(activeMemory.communicationStyle)}`);
    }
    parts.push('---------------------------------------------------\n');
  } else {
    parts.push('No Active User Memory exists.\n');
  }

  parts.push('Generate memoryUpdates in JSON format to remove the contribution of this deleted journal memory.');

  return parts.join('\n');
}
