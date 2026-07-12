import { NextResponse } from 'next/server';
import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { orchestrationDeps } from '@/services/ai/orchestration';
import { createEmptyActiveUserMemory } from '@/services/ai';
import { enqueueJob } from '@/services/ai/queue/aiQueueManager';
import type { Journal, AIStatus } from '@/types/journal';
import type { ActiveUserMemory, JournalMemory, AIReflection } from '@/types/ai';

// Lock this route to the Node.js runtime.
// firebase-admin depends on Node.js-specific APIs (crypto, net, fs) and will
// fail at startup if placed in the Edge Runtime.
export const runtime = 'nodejs';

// ─── Firebase Admin Initialization ───────────────────────────────────────────
// Only initialise once across hot reloads in development.
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
      ),
    }),
  });
}

const adminDb = getFirestore();
const adminAuth = getAuth();

// ─── Admin SDK Orchestration Dependency Overrides ────────────────────────────
// The orchestrator uses injectable `orchestrationDeps`. We override each
// dependency with an Admin SDK implementation so every Firestore operation
// runs with administrative privileges, bypassing client-side security rules
// and eliminating PERMISSION_DENIED errors entirely.

orchestrationDeps.updateAIStatus = async (
  uid: string,
  journalId: string,
  status: AIStatus,
  processedAt: Date | null = null
): Promise<void> => {
  console.log(`[ADMIN updateAIStatus] uid: ${uid}, journalId: ${journalId}, status: ${status}`);
  const docRef = adminDb.doc(`users/${uid}/journals/${journalId}`);
  const updateData: Record<string, unknown> = { aiStatus: status };
  if (processedAt) {
    updateData.aiProcessedAt = Timestamp.fromDate(processedAt);
  }
  await docRef.update(updateData);
};

orchestrationDeps.getJournal = async (uid: string, journalId: string): Promise<Journal> => {
  console.log(`[ADMIN getJournal] uid: ${uid}, journalId: ${journalId}`);
  const docRef = adminDb.doc(`users/${uid}/journals/${journalId}`);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new Error(`Journal not found: ${journalId}`);
  }
  const data = snapshot.data()!;
  return {
    id: snapshot.id,
    title: data.title || '',
    content: data.content || '',
    initialCheckIn: data.initialCheckIn || null,
    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
    updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
    aiStatus: data.aiStatus || 'idle',
    aiProcessedAt: data.aiProcessedAt ? (data.aiProcessedAt as Timestamp).toDate() : null,
  } as Journal;
};

orchestrationDeps.getActiveUserMemory = async (uid: string): Promise<ActiveUserMemory | null> => {
  console.log(`[ADMIN getActiveUserMemory] uid: ${uid}`);
  const docRef = adminDb.doc(`users/${uid}/activeUserMemory/active`);
  const snapshot = await docRef.get();
  if (!snapshot.exists) return null;
  return snapshot.data() as ActiveUserMemory;
};

orchestrationDeps.saveActiveUserMemory = async (
  uid: string,
  memory: ActiveUserMemory
): Promise<void> => {
  console.log(`[ADMIN saveActiveUserMemory] uid: ${uid}`);
  await adminDb.doc(`users/${uid}/activeUserMemory/active`).set(memory);
};

orchestrationDeps.initializeActiveUserMemory = async (
  uid: string
): Promise<ActiveUserMemory> => {
  console.log(`[ADMIN initializeActiveUserMemory] uid: ${uid}`);
  const empty = createEmptyActiveUserMemory();
  await adminDb.doc(`users/${uid}/activeUserMemory/active`).set(empty);
  return empty;
};

orchestrationDeps.saveJournalMemory = async (
  uid: string,
  journalId: string,
  memory: JournalMemory
): Promise<void> => {
  console.log(`[ADMIN saveJournalMemory] uid: ${uid}, journalId: ${journalId}`);
  await adminDb
    .doc(`users/${uid}/journals/${journalId}/journalMemory/${journalId}`)
    .set(memory);
};

orchestrationDeps.saveReflection = async (
  uid: string,
  journalId: string,
  reflection: AIReflection
): Promise<void> => {
  console.log(`[ADMIN saveReflection] uid: ${uid}, journalId: ${journalId}`);
  await adminDb
    .doc(`users/${uid}/journals/${journalId}/reflection/${journalId}`)
    .set(reflection);
};

orchestrationDeps.getJournalMemory = async (
  uid: string,
  journalId: string
): Promise<JournalMemory | null> => {
  console.log(`[ADMIN getJournalMemory] uid: ${uid}, journalId: ${journalId}`);
  const snapshot = await adminDb
    .doc(`users/${uid}/journals/${journalId}/journalMemory/${journalId}`)
    .get();
  if (!snapshot.exists) return null;
  return snapshot.data() as JournalMemory;
};

orchestrationDeps.deleteJournalMemory = async (
  uid: string,
  journalId: string
): Promise<void> => {
  console.log(`[ADMIN deleteJournalMemory] uid: ${uid}, journalId: ${journalId}`);
  await adminDb
    .doc(`users/${uid}/journals/${journalId}/journalMemory/${journalId}`)
    .delete();
};

orchestrationDeps.deleteReflection = async (
  uid: string,
  journalId: string
): Promise<void> => {
  console.log(`[ADMIN deleteReflection] uid: ${uid}, journalId: ${journalId}`);
  await adminDb
    .doc(`users/${uid}/journals/${journalId}/reflection/${journalId}`)
    .delete();
};

// ─── Date Deserialization ─────────────────────────────────────────────────────
/**
 * Re-converts JSON string timestamps to native JavaScript Date objects.
 * Next.js serialises Date values to strings when passing through the HTTP
 * boundary; the orchestrator expects real Date instances.
 */
function parseJournalDates(journal: Record<string, unknown>): Journal {
  return {
    ...journal,
    createdAt: typeof journal.createdAt === 'string' ? new Date(journal.createdAt) : new Date(),
    updatedAt: typeof journal.updatedAt === 'string' ? new Date(journal.updatedAt) : new Date(),
    aiProcessedAt:
      typeof journal.aiProcessedAt === 'string' ? new Date(journal.aiProcessedAt) : null,
  } as unknown as Journal;
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    console.log('[API /api/ai/process] POST request received');

    // 1. Validate Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[API /api/ai/process] 401: Missing or malformed Authorization header');
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);

    // 2. Parse request body
    const body = await request.json();
    const { action, uid, journal, journalId } = body as {
      action: string;
      uid: string;
      journal?: Record<string, unknown>;
      journalId?: string;
    };

    console.log(
      `[API /api/ai/process] action=${action}, uid=${uid}, journalId=${journalId ?? journal?.id}`
    );

    if (!uid) {
      return NextResponse.json({ error: 'Bad Request: Missing uid' }, { status: 400 });
    }

    // 3. Verify Firebase ID token using Admin SDK
    let verifiedUid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      verifiedUid = decoded.uid;
      console.log(`[API /api/ai/process] Token verified. uid=${verifiedUid}`);
    } catch (err) {
      console.warn('[API /api/ai/process] 401: Token verification failed:', err);
      return NextResponse.json(
        { error: `Unauthorized: ${err instanceof Error ? err.message : 'Invalid token'}` },
        { status: 401 }
      );
    }

    // Protect against UID spoofing — the verified token uid must match
    if (verifiedUid !== uid) {
      console.warn(
        `[API /api/ai/process] 403: UID mismatch (token=${verifiedUid}, request=${uid})`
      );
      return NextResponse.json({ error: 'Forbidden: UID mismatch' }, { status: 403 });
    }

    // 4. Enqueue the AI job — returns immediately; processing runs in the background.
    if (action === 'new') {
      if (!journal) {
        return NextResponse.json({ error: 'Bad Request: Missing journal' }, { status: 400 });
      }
      const parsedJournal = parseJournalDates(journal);
      console.log(
        `[API /api/ai/process] Enqueueing 'new' job for journalId=${parsedJournal.id}`
      );
      await enqueueJob({ uid, journalId: parsedJournal.id, action: 'new', journal: parsedJournal });
      return NextResponse.json({ success: true, aiStatus: 'queued' });

    } else if (action === 'update') {
      if (!journal) {
        return NextResponse.json({ error: 'Bad Request: Missing journal' }, { status: 400 });
      }
      const parsedJournal = parseJournalDates(journal);
      console.log(
        `[API /api/ai/process] Enqueueing 'update' job for journalId=${parsedJournal.id}`
      );
      await enqueueJob({ uid, journalId: parsedJournal.id, action: 'update', journal: parsedJournal });
      return NextResponse.json({ success: true, aiStatus: 'queued' });

    } else if (action === 'delete') {
      if (!journalId) {
        return NextResponse.json({ error: 'Bad Request: Missing journalId' }, { status: 400 });
      }
      console.log(
        `[API /api/ai/process] Enqueueing 'delete' job for journalId=${journalId}`
      );
      // Delete jobs do not write a 'queued' Firestore status (document is being removed).
      await enqueueJob({ uid, journalId, action: 'delete' });
      return NextResponse.json({ success: true });

    } else {
      console.warn(`[API /api/ai/process] 400: Invalid action "${action}"`);
      return NextResponse.json(
        { error: `Bad Request: Invalid action "${action}"` },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[API /api/ai/process] Unhandled error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
