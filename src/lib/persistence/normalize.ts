import type { EmotionalTone } from "@/types/capture";
import type { PersistedCognitiveThought } from "@/types/persistence";
import type {
  ConceptAffinity,
  ConnectedSession,
  RelatedConcept,
  SemanticRelationship,
  ThoughtContext,
  ThoughtThread,
  ThoughtThreadStatus,
} from "@/types/workspace";

const THREAD_STATUSES = new Set<ThoughtThreadStatus>([
  "active",
  "unresolved",
  "resurfaced",
  "focus",
]);

const EMOTIONAL_TONES = new Set<EmotionalTone>([
  "contemplative",
  "curious",
  "uncertain",
  "energized",
  "calm",
]);

const AFFINITIES = new Set<ConceptAffinity>(["strong", "moderate", "latent"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeRelatedConcepts(value: unknown): RelatedConcept[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index): RelatedConcept | null => {
      if (!isRecord(item) || typeof item.label !== "string" || !item.label) {
        return null;
      }
      const affinity = item.affinity;
      return {
        id: typeof item.id === "string" ? item.id : `c-${index}`,
        label: item.label,
        affinity: AFFINITIES.has(affinity as ConceptAffinity)
          ? (affinity as ConceptAffinity)
          : "moderate",
      };
    })
    .filter((item): item is RelatedConcept => item !== null);
}

function normalizeSemanticRelationships(value: unknown): SemanticRelationship[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index): SemanticRelationship | null => {
      if (!isRecord(item)) return null;
      if (
        typeof item.source !== "string" ||
        typeof item.target !== "string" ||
        typeof item.kind !== "string"
      ) {
        return null;
      }
      return {
        id: typeof item.id === "string" ? item.id : `sr-${index}`,
        source: item.source,
        target: item.target,
        kind: item.kind as SemanticRelationship["kind"],
      };
    })
    .filter((item): item is SemanticRelationship => item !== null);
}

function normalizeConnectedSessions(value: unknown): ConnectedSession[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index): ConnectedSession | null => {
      if (!isRecord(item) || typeof item.label !== "string") return null;
      return {
        id: typeof item.id === "string" ? item.id : `sess-${index}`,
        label: item.label,
        relativeTime:
          typeof item.relativeTime === "string" ? item.relativeTime : "Recently",
        threadCount:
          typeof item.threadCount === "number" ? item.threadCount : 0,
      };
    })
    .filter((item): item is ConnectedSession => item !== null);
}

/** Lenient context parse — fills defaults for older snapshots. */
export function normalizeThoughtContext(
  value: unknown,
  threadId: string
): ThoughtContext | null {
  if (!isRecord(value)) return null;

  const summary = typeof value.summary === "string" ? value.summary : "";

  return {
    threadId: typeof value.threadId === "string" ? value.threadId : threadId,
    summary,
    relatedConcepts: normalizeRelatedConcepts(value.relatedConcepts),
    semanticRelationships: normalizeSemanticRelationships(value.semanticRelationships),
    recurringThemes: asStringArray(value.recurringThemes),
    unresolvedContinuations: asStringArray(value.unresolvedContinuations),
    connectedSessions: normalizeConnectedSessions(value.connectedSessions),
  };
}

export function normalizeThoughtThread(
  value: unknown,
  fallbackId?: string
): ThoughtThread | null {
  if (!isRecord(value)) return null;

  const id =
    typeof value.id === "string"
      ? value.id
      : typeof fallbackId === "string"
        ? fallbackId
        : null;
  if (!id) return null;

  const status = THREAD_STATUSES.has(value.status as ThoughtThreadStatus)
    ? (value.status as ThoughtThreadStatus)
    : "active";

  return {
    id,
    title: typeof value.title === "string" ? value.title : "Captured thought",
    excerpt:
      typeof value.excerpt === "string"
        ? value.excerpt
        : "Held in continuity — awaiting further connection.",
    status,
    lastTouched:
      typeof value.lastTouched === "string" ? value.lastTouched : "Recently",
    momentum:
      value.momentum === "high" || value.momentum === "medium" || value.momentum === "low"
        ? value.momentum
        : "medium",
    projectLabel:
      typeof value.projectLabel === "string" ? value.projectLabel : undefined,
    captured: isRecord(value.captured)
      ? {
          thought:
            typeof value.captured.thought === "string"
              ? value.captured.thought
              : "",
          semanticTags: asStringArray(value.captured.semanticTags),
          emotionalTone:
            value.captured.emotionalTone === null ||
            EMOTIONAL_TONES.has(value.captured.emotionalTone as EmotionalTone)
              ? (value.captured.emotionalTone as EmotionalTone | null)
              : null,
          continuationMarker:
            typeof value.captured.continuationMarker === "string"
              ? value.captured.continuationMarker
              : undefined,
          markUnresolved: Boolean(value.captured.markUnresolved),
          capturedAt:
            typeof value.captured.capturedAt === "string"
              ? value.captured.capturedAt
              : new Date().toISOString(),
        }
      : undefined,
  };
}

export function normalizePersistedThought(value: unknown): PersistedCognitiveThought | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id : null;
  if (!id) return null;

  const thread = normalizeThoughtThread(value.thread, id);
  const context = normalizeThoughtContext(value.context, id);
  if (!thread || !context) return null;

  const thought =
    typeof value.thought === "string"
      ? value.thought
      : thread.captured?.thought || context.summary;

  const capturedAt =
    typeof value.capturedAt === "string"
      ? value.capturedAt
      : thread.captured?.capturedAt ?? new Date().toISOString();

  const semanticTags = asStringArray(value.semanticTags);
  const resolvedTags =
    semanticTags.length > 0 ? semanticTags : context.recurringThemes;

  const tone = value.emotionalTone;
  const emotionalTone =
    tone === null || EMOTIONAL_TONES.has(tone as EmotionalTone)
      ? (tone as EmotionalTone | null)
      : (thread.captured?.emotionalTone ?? null);

  return {
    id,
    capturedAt,
    thought,
    continuationMarker:
      typeof value.continuationMarker === "string"
        ? value.continuationMarker
        : thread.captured?.continuationMarker ?? "",
    semanticTags: resolvedTags,
    emotionalTone,
    markUnresolved:
      typeof value.markUnresolved === "boolean"
        ? value.markUnresolved
        : thread.status === "unresolved",
    thread: {
      ...thread,
      captured: {
        thought,
        semanticTags: resolvedTags,
        emotionalTone,
        continuationMarker:
          typeof value.continuationMarker === "string"
            ? value.continuationMarker
            : thread.captured?.continuationMarker,
        markUnresolved:
          typeof value.markUnresolved === "boolean"
            ? value.markUnresolved
            : thread.status === "unresolved",
        capturedAt,
      },
    },
    context: {
      ...context,
      threadId: id,
      summary: thought || context.summary,
      recurringThemes:
        resolvedTags.length > 0 ? resolvedTags : context.recurringThemes,
    },
  };
}
