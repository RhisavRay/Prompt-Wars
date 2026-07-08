import type { ActiveUserMemory } from '../types';

/**
 * Creates an empty, default structure for a new user's Active User Memory.
 *
 * @returns A freshly initialized ActiveUserMemory object.
 */
export function createEmptyActiveUserMemory(): ActiveUserMemory {
  return {
    activeLifeEvents: [],
    ongoingChallenges: [],
    importantPeople: [],
    recurringThemes: [],
    behaviouralObservations: [],
    communicationStyle: [],
    stableFacts: [],
    lastUpdated: new Date().toISOString(),
  };
}
