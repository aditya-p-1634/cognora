import type { NavItemId } from "@/config/navigation";
import type { EmotionalTone } from "@/types/capture";
import {
  WORKSPACE_PERSISTENCE_VERSION,
  type PersistedCognitiveThought,
  type WorkspacePersistenceState,
} from "@/types/persistence";
import type { ThoughtContext, ThoughtThread, ThoughtThreadStatus } from "@/types/workspace";

const NAV_IDS = new Set<NavItemId>([
  "dashboard",
  "projects",
  "thoughts",
  "timeline",
  "reflections",
  "search",
  "settings",
]);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isThoughtContext(value: unknown): value is ThoughtContext {
  if (!isRecord(value)) return false;
  return (
    typeof value.threadId === "string" &&
    typeof value.summary === "string" &&
    Array.isArray(value.relatedConcepts) &&
    Array.isArray(value.recurringThemes) &&
    Array.isArray(value.unresolvedContinuations) &&
    Array.isArray(value.semanticRelationships) &&
    Array.isArray(value.connectedSessions)
  );
}

function isThoughtThread(value: unknown): value is ThoughtThread {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.excerpt === "string" &&
    typeof value.lastTouched === "string" &&
    THREAD_STATUSES.has(value.status as ThoughtThreadStatus)
  );
}

function isPersistedThought(value: unknown): value is PersistedCognitiveThought {
  if (!isRecord(value)) return false;
  const tone = value.emotionalTone;
  return (
    typeof value.id === "string" &&
    typeof value.capturedAt === "string" &&
    typeof value.thought === "string" &&
    typeof value.continuationMarker === "string" &&
    isStringArray(value.semanticTags) &&
    (tone === null || EMOTIONAL_TONES.has(tone as EmotionalTone)) &&
    typeof value.markUnresolved === "boolean" &&
    isThoughtThread(value.thread) &&
    isThoughtContext(value.context) &&
    value.thread.id === value.id &&
    value.context.threadId === value.id
  );
}

function parseThoughts(raw: unknown): PersistedCognitiveThought[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isPersistedThought).sort(
    (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
  );
}

export function parseWorkspacePersistenceV2(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw) || raw.version !== WORKSPACE_PERSISTENCE_VERSION) return null;

  const savedAt =
    typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString();

  return {
    version: WORKSPACE_PERSISTENCE_VERSION,
    savedAt,
    sessionStartedAt:
      typeof raw.sessionStartedAt === "string" ? raw.sessionStartedAt : savedAt,
    sessionLabel:
      typeof raw.sessionLabel === "string" ? raw.sessionLabel : "Workspace foundation",
    activeNav: NAV_IDS.has(raw.activeNav as NavItemId)
      ? (raw.activeNav as NavItemId)
      : "dashboard",
    selectedThreadId:
      typeof raw.selectedThreadId === "string" ? raw.selectedThreadId : null,
    thoughts: parseThoughts(raw.thoughts),
  };
}

/** Legacy v1 continuity snapshot (threads + context map). */
export function parseWorkspacePersistenceV1(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw) || raw.version !== 1) return null;

  const savedAt =
    typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString();

  const capturedThreads = Array.isArray(raw.capturedThreads)
    ? raw.capturedThreads.filter(isThoughtThread)
    : [];

  const captureContextMap: Record<string, ThoughtContext> = {};
  if (isRecord(raw.captureContextMap)) {
    for (const [key, value] of Object.entries(raw.captureContextMap)) {
      if (isThoughtContext(value)) captureContextMap[key] = value;
    }
  }

  const thoughts: PersistedCognitiveThought[] = capturedThreads
    .map((thread) => {
      const context = captureContextMap[thread.id];
      if (!context) return null;

      const captured = thread.captured;
      const thought =
        (captured && "thought" in captured && typeof captured.thought === "string"
          ? captured.thought
          : context.summary) ?? context.summary;

      return {
        id: thread.id,
        capturedAt: captured?.capturedAt ?? savedAt,
        thought,
        continuationMarker: captured?.continuationMarker ?? "",
        semanticTags: captured?.semanticTags ?? context.recurringThemes,
        emotionalTone: captured?.emotionalTone ?? null,
        markUnresolved: thread.status === "unresolved",
        thread,
        context,
      } satisfies PersistedCognitiveThought;
    })
    .filter((t): t is PersistedCognitiveThought => t !== null);

  return {
    version: WORKSPACE_PERSISTENCE_VERSION,
    savedAt,
    sessionStartedAt:
      typeof raw.sessionStartedAt === "string" ? raw.sessionStartedAt : savedAt,
    sessionLabel:
      typeof raw.sessionLabel === "string" ? raw.sessionLabel : "Workspace foundation",
    activeNav: NAV_IDS.has(raw.activeNav as NavItemId)
      ? (raw.activeNav as NavItemId)
      : "dashboard",
    selectedThreadId:
      typeof raw.selectedThreadId === "string" ? raw.selectedThreadId : null,
    thoughts: parseThoughts(thoughts),
  };
}

export function parseWorkspacePersistence(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw)) return null;
  if (raw.version === WORKSPACE_PERSISTENCE_VERSION) {
    return parseWorkspacePersistenceV2(raw);
  }
  if (raw.version === 1) {
    return parseWorkspacePersistenceV1(raw);
  }
  return null;
}
