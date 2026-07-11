import type { ActiveUserMemory, MemoryUpdateOperation } from '@/types/ai';

// ── Candidate Matching ───────────────────────────────────────────────────────
//
// This section intentionally isolates the matching strategy behind a single
// helper function. Currently, candidates are matched via text similarity
// (exact, substring, and word overlap). When stable item identifiers are
// introduced in a future sprint, only this function needs to change.

/**
 * Finds the index of the best-matching string in an array against a query string.
 *
 * Strategy (applied in priority order):
 * 1. Exact case-insensitive match
 * 2. Substring inclusion match
 * 3. Word overlap match (ignoring common stop words)
 *
 * This function is deliberately isolated so that transitioning from
 * similarity-based matching to identifier-based matching in the future
 * requires changing only this one component.
 *
 * @param arr - The current array of strings to search
 * @param query - The candidate string to match against
 * @returns The index of the best match, or -1 if no suitable match is found
 */
function findMatchIndex(arr: readonly string[], query: string): number {
  if (arr.length === 0) return -1;

  const queryLower = query.trim().toLowerCase();

  // 1. Exact match (case-insensitive)
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].trim().toLowerCase() === queryLower) {
      return i;
    }
  }

  // 2. Substring match
  for (let i = 0; i < arr.length; i++) {
    const itemLower = arr[i].trim().toLowerCase();
    if (queryLower.includes(itemLower) || itemLower.includes(queryLower)) {
      return i;
    }
  }

  // 3. Word overlap match (ignoring common stop words)
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
    'to', 'of', 'in', 'at', 'on', 'for', 'with', 'about', 'this', 'that',
    'user', 'feels', 'has',
  ]);
  const getWords = (str: string) =>
    str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));

  const queryWords = getWords(query);
  if (queryWords.length === 0) return -1;

  let bestIndex = -1;
  let maxOverlap = 0;

  for (let i = 0; i < arr.length; i++) {
    const itemWords = getWords(arr[i]);
    const overlap = itemWords.filter((w) => queryWords.includes(w)).length;
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestIndex = i;
    }
  }

  // Require at least one significant overlapping word to match
  return maxOverlap > 0 ? bestIndex : -1;
}

// ── Memory Applicator ────────────────────────────────────────────────────────

/**
 * Pure function that sequentially applies a list of validated MemoryUpdateOperations
 * against the current ActiveUserMemory, returning a brand-new updated instance.
 *
 * ActiveUserMemory is the evolving, live representation of the user across all
 * journal entries. It accumulates insight from each journal and is updated
 * incrementally via structured operations proposed by Gemini.
 *
 * This function is intentionally separate from the Firestore persistence layer.
 * It does not read from or write to the database.
 *
 * Supported operations:
 * - 'add': Appends to the target category array if not already present.
 * - 'update': Replaces the most similar candidate in the target category.
 * - 'remove' / 'archive': Removes the candidate from the target category.
 * - 'restore': Appends to the target category array if not already present.
 *
 * All operations are applied sequentially. If an operation target does not exist
 * or the payload is invalid, the operation is silently skipped to prevent partial
 * errors or corruption.
 *
 * @param activeMemory - The current ActiveUserMemory state
 * @param operations - The list of proposed memory updates
 * @returns A new ActiveUserMemory object with all updates applied
 */
export function applyMemoryUpdates(
  activeMemory: ActiveUserMemory,
  operations: readonly MemoryUpdateOperation[]
): ActiveUserMemory {
  // Deep clone memory arrays to ensure this function is pure (no mutations)
  const updatedMemory: ActiveUserMemory = {
    activeLifeEvents: [...activeMemory.activeLifeEvents],
    ongoingChallenges: [...activeMemory.ongoingChallenges],
    importantPeople: [...activeMemory.importantPeople],
    recurringThemes: [...activeMemory.recurringThemes],
    behaviouralObservations: [...activeMemory.behaviouralObservations],
    communicationStyle: [...activeMemory.communicationStyle],
    stableFacts: [...activeMemory.stableFacts],
    lastUpdated: new Date().toISOString(),
  };

  for (const op of operations) {
    const targetKey = op.target as keyof Omit<ActiveUserMemory, 'lastUpdated'>;

    // Safety check: ensure target matches a valid category array
    if (!(targetKey in updatedMemory) || !Array.isArray(updatedMemory[targetKey])) {
      continue;
    }

    const targetArray = updatedMemory[targetKey] as string[];
    const payloadStr =
      typeof op.payload === 'string' ? op.payload.trim() : String(op.payload || '').trim();
    if (!payloadStr) {
      continue;
    }

    switch (op.operation) {
      case 'add':
      case 'restore': {
        // Only append if it is not already in the target array (exact match check)
        const alreadyExists = targetArray.some(
          (item) => item.trim().toLowerCase() === payloadStr.toLowerCase()
        );
        if (!alreadyExists) {
          targetArray.push(payloadStr);
        }
        break;
      }

      case 'update': {
        // Find best match via the isolated matcher and replace it
        const matchIndex = findMatchIndex(targetArray, payloadStr);
        if (matchIndex !== -1) {
          targetArray[matchIndex] = payloadStr;
        } else {
          // If no suitable match is found, fall back to appending
          targetArray.push(payloadStr);
        }
        break;
      }

      case 'remove':
      case 'archive': {
        // Find best match via the isolated matcher and remove it
        const matchIndex = findMatchIndex(targetArray, payloadStr);
        if (matchIndex !== -1) {
          targetArray.splice(matchIndex, 1);
        }
        break;
      }

      default:
        // Safely skip any unsupported operations
        break;
    }
  }

  return updatedMemory;
}
