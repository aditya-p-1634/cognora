import type { CaptureDraft } from "@/types/capture";
import type { PersistedCognitiveThought } from "@/types/persistence";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  buildCapturedThread,
  buildContextFromCapture,
} from "@/lib/capture/build-captured-thread";
import { formatContinuityRelativeTime } from "@/lib/continuity/format-time";

/** Newest-first continuity ordering. */
export function sortThoughtsByContinuity(
  thoughts: PersistedCognitiveThought[]
): PersistedCognitiveThought[] {
  return [...thoughts].sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );
}

export function createPersistedThought(
  draft: CaptureDraft,
  id: string
): PersistedCognitiveThought {
  const { thread, meta } = buildCapturedThread(draft, id);
  const context = buildContextFromCapture(thread, draft);
  const thought = draft.thought.trim();

  return {
    id,
    capturedAt: meta.capturedAt,
    thought,
    continuationMarker: draft.continuationMarker.trim(),
    semanticTags: [...draft.semanticTags],
    emotionalTone: draft.emotionalTone,
    markUnresolved: draft.markUnresolved,
    thread,
    context,
  };
}

/** Refresh feed-relative timestamps after reload — calm, no emergence animation. */
export function hydrateThoughtForDisplay(
  record: PersistedCognitiveThought
): PersistedCognitiveThought {
  const lastTouched = formatContinuityRelativeTime(record.capturedAt);
  const captured = {
    thought: record.thought,
    semanticTags: record.semanticTags,
    emotionalTone: record.emotionalTone,
    continuationMarker: record.continuationMarker || undefined,
    markUnresolved: record.markUnresolved,
    capturedAt: record.capturedAt,
  };

  const thread: ThoughtThread = {
    ...record.thread,
    lastTouched,
    status: record.markUnresolved ? "unresolved" : record.thread.status,
    captured,
  };

  const context: ThoughtContext = {
    ...record.context,
    threadId: record.id,
    summary: record.thought || record.context.summary,
    recurringThemes:
      record.semanticTags.length > 0
        ? record.semanticTags
        : record.context.recurringThemes,
  };

  return { ...record, thread, context };
}

export function hydrateThoughtsForDisplay(
  thoughts: PersistedCognitiveThought[]
): PersistedCognitiveThought[] {
  return sortThoughtsByContinuity(thoughts.map(hydrateThoughtForDisplay));
}

export function thoughtsToFeedDerivatives(thoughts: PersistedCognitiveThought[]): {
  capturedThreads: ThoughtThread[];
  captureContextMap: Record<string, ThoughtContext>;
} {
  const ordered = sortThoughtsByContinuity(thoughts);
  return {
    capturedThreads: ordered.map((t) => t.thread),
    captureContextMap: Object.fromEntries(
      ordered.map((t) => [t.id, t.context])
    ),
  };
}

export function upsertThought(
  thoughts: PersistedCognitiveThought[],
  record: PersistedCognitiveThought
): PersistedCognitiveThought[] {
  const without = thoughts.filter((t) => t.id !== record.id);
  return sortThoughtsByContinuity([record, ...without]);
}
