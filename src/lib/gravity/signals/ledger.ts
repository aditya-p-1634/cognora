import type { GravityLedger, ThreadContinuitySignals } from "@/types/gravity";
import type { ThoughtThread } from "@/types/workspace";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function nowIso(now: number): string {
  return new Date(now).toISOString();
}

export function createDefaultSignals(
  now: number,
  thread?: ThoughtThread
): ThreadContinuitySignals {
  const base = nowIso(now);

  if (!thread) {
    return {
      selectionCount: 0,
      lastSelectedAt: null,
      lastReinforcedAt: base,
      resurfacingTouches: 0,
      sessionTouches: 0,
    };
  }

  let resurfacingTouches = 0;
  let sessionTouches = 1;

  if (thread.status === "resurfaced") resurfacingTouches = 1;
  if (thread.status === "focus") sessionTouches = 2;

  return {
    selectionCount: thread.status === "focus" ? 1 : 0,
    lastSelectedAt: null,
    lastReinforcedAt: base,
    resurfacingTouches,
    sessionTouches,
  };
}

/** Baseline signals for mock threads without ledger history. */
export function syntheticSignalsForThread(
  thread: ThoughtThread,
  now: number
): ThreadContinuitySignals {
  const signals = createDefaultSignals(now, thread);

  if (thread.status === "unresolved") {
    signals.resurfacingTouches = Math.max(signals.resurfacingTouches, 1);
    signals.sessionTouches += 1;
  }

  if (thread.captured?.markUnresolved) {
    signals.resurfacingTouches += 1;
  }

  const capturedAt = thread.captured?.capturedAt;
  if (capturedAt) {
    const ageDays = (now - new Date(capturedAt).getTime()) / MS_PER_DAY;
    if (ageDays < 2) signals.sessionTouches += 1;
  }

  return signals;
}

export function resolveThreadSignals(
  thread: ThoughtThread,
  ledger: GravityLedger,
  now: number
): ThreadContinuitySignals {
  return ledger[thread.id] ?? syntheticSignalsForThread(thread, now);
}

export function reinforceSelection(
  ledger: GravityLedger,
  threadId: string,
  thread: ThoughtThread | null,
  now: number
): GravityLedger {
  const existing =
    ledger[threadId] ??
    (thread ? syntheticSignalsForThread(thread, now) : createDefaultSignals(now));

  return {
    ...ledger,
    [threadId]: {
      ...existing,
      selectionCount: existing.selectionCount + 1,
      lastSelectedAt: nowIso(now),
      lastReinforcedAt: nowIso(now),
      sessionTouches: existing.sessionTouches + 1,
      resurfacingTouches:
        thread?.status === "resurfaced"
          ? existing.resurfacingTouches + 1
          : existing.resurfacingTouches,
    },
  };
}

export function touchSessionForThreads(
  ledger: GravityLedger,
  threadIds: string[],
  threadsById: Map<string, ThoughtThread>,
  now: number
): GravityLedger {
  const next = { ...ledger };

  for (const id of threadIds) {
    const thread = threadsById.get(id);
    const existing =
      next[id] ??
      (thread ? syntheticSignalsForThread(thread, now) : createDefaultSignals(now));

    next[id] = {
      ...existing,
      sessionTouches: existing.sessionTouches + 1,
      lastReinforcedAt: existing.lastReinforcedAt,
    };
  }

  return next;
}

export function normalizeGravityLedger(raw: unknown): GravityLedger {
  if (typeof raw !== "object" || raw === null) return {};

  const ledger: GravityLedger = {};

  for (const [threadId, value] of Object.entries(raw)) {
    if (typeof value !== "object" || value === null) continue;
    const record = value as Record<string, unknown>;

    ledger[threadId] = {
      selectionCount:
        typeof record.selectionCount === "number" ? record.selectionCount : 0,
      lastSelectedAt:
        typeof record.lastSelectedAt === "string" ? record.lastSelectedAt : null,
      lastReinforcedAt:
        typeof record.lastReinforcedAt === "string"
          ? record.lastReinforcedAt
          : new Date().toISOString(),
      resurfacingTouches:
        typeof record.resurfacingTouches === "number" ? record.resurfacingTouches : 0,
      sessionTouches:
        typeof record.sessionTouches === "number" ? record.sessionTouches : 0,
    };
  }

  return ledger;
}
