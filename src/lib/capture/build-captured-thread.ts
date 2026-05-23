import type { CaptureDraft, CapturedThoughtMeta } from "@/types/capture";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

function firstLine(text: string): string {
  const line = text.split(/\n/)[0]?.trim() ?? "";
  return line;
}

function deriveTitle(thought: string): string {
  const line = firstLine(thought);
  if (!line) return "Captured thought";
  if (line.length <= 72) return line;
  return `${line.slice(0, 69).trimEnd()}…`;
}

function deriveExcerpt(thought: string, title: string): string {
  const normalized = thought.trim();
  const lines = normalized.split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    const body = lines.slice(1).join(" ");
    return body.length > 160 ? `${body.slice(0, 157)}…` : body;
  }
  if (normalized.length > title.length + 12) {
    const rest = normalized.slice(title.length).trim();
    if (rest) return rest.length > 160 ? `${rest.slice(0, 157)}…` : rest;
  }
  return "Held in continuity — awaiting further connection.";
}

export function buildCapturedThread(
  draft: CaptureDraft,
  id: string
): { thread: ThoughtThread; meta: CapturedThoughtMeta } {
  const thought = draft.thought.trim();
  const title = deriveTitle(thought);
  const excerpt = deriveExcerpt(thought, title);

  const meta: CapturedThoughtMeta = {
    thought,
    semanticTags: draft.semanticTags,
    emotionalTone: draft.emotionalTone,
    continuationMarker: draft.continuationMarker.trim() || undefined,
    markUnresolved: draft.markUnresolved,
    capturedAt: new Date().toISOString(),
  };

  const thread: ThoughtThread = {
    id,
    title,
    excerpt,
    status: draft.markUnresolved ? "unresolved" : "active",
    lastTouched: "Just now",
    momentum: "medium",
    captured: meta,
  };

  return { thread, meta };
}

export function buildContextFromCapture(
  thread: ThoughtThread,
  draft: CaptureDraft
): ThoughtContext {
  const thought = draft.thought.trim();
  const themes = draft.semanticTags.length > 0 ? draft.semanticTags : ["captured thought"];

  const continuations: string[] = [];
  if (draft.continuationMarker.trim()) {
    continuations.push(`Continuation: ${draft.continuationMarker.trim()}`);
  }
  if (draft.markUnresolved) {
    continuations.push("Marked as an open loop at capture");
  }
  if (continuations.length === 0) {
    continuations.push("Thought preserved — context may deepen with connection");
  }

  return {
    threadId: thread.id,
    summary: thought || thread.excerpt,
    relatedConcepts: themes.slice(0, 4).map((label, i) => ({
      id: `${thread.id}-c${i}`,
      label,
      affinity: i === 0 ? "strong" : "moderate",
    })),
    semanticRelationships: [],
    recurringThemes: themes,
    unresolvedContinuations: continuations,
    connectedSessions: [],
  };
}
