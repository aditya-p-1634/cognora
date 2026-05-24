import type { NavItemId } from "@/config/navigation";
import { mockSession } from "@/data/mock/workspace";
import {
  normalizePersistedThought,
  normalizeThoughtContext,
  normalizeThoughtThread,
} from "@/lib/persistence/normalize";
import {
  WORKSPACE_PERSISTENCE_VERSION,
  type PersistedCognitiveThought,
  type WorkspacePersistenceState,
} from "@/types/persistence";

const NAV_IDS = new Set<NavItemId>([
  "dashboard",
  "projects",
  "thoughts",
  "timeline",
  "reflections",
  "search",
  "settings",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseThoughts(raw: unknown): PersistedCognitiveThought[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizePersistedThought)
    .filter((t): t is PersistedCognitiveThought => t !== null)
    .sort(
      (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
}

function baseWorkspaceFields(
  raw: Record<string, unknown>,
  thoughts: PersistedCognitiveThought[]
): WorkspacePersistenceState {
  const savedAt =
    typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString();

  return {
    version: WORKSPACE_PERSISTENCE_VERSION,
    savedAt,
    sessionStartedAt:
      typeof raw.sessionStartedAt === "string" ? raw.sessionStartedAt : savedAt,
    sessionLabel:
      typeof raw.sessionLabel === "string" ? raw.sessionLabel : mockSession.label,
    activeNav: NAV_IDS.has(raw.activeNav as NavItemId)
      ? (raw.activeNav as NavItemId)
      : "dashboard",
    selectedThreadId:
      typeof raw.selectedThreadId === "string" ? raw.selectedThreadId : null,
    thoughts,
  };
}

export function parseWorkspacePersistenceV2(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw) || raw.version !== WORKSPACE_PERSISTENCE_VERSION) return null;
  const thoughts = parseThoughts(raw.thoughts);
  return baseWorkspaceFields(raw, thoughts);
}

/** Legacy v1 continuity snapshot (threads + context map). */
export function parseWorkspacePersistenceV1(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw) || raw.version !== 1) return null;

  const savedAt =
    typeof raw.savedAt === "string" ? raw.savedAt : new Date().toISOString();

  const capturedThreads = Array.isArray(raw.capturedThreads)
    ? raw.capturedThreads
        .map((thread) => normalizeThoughtThread(thread))
        .filter((t): t is NonNullable<typeof t> => t !== null)
    : [];

  const captureContextMap: Record<string, ReturnType<typeof normalizeThoughtContext>> =
    {};
  if (isRecord(raw.captureContextMap)) {
    for (const [key, value] of Object.entries(raw.captureContextMap)) {
      const context = normalizeThoughtContext(value, key);
      if (context) captureContextMap[key] = context;
    }
  }

  const thoughts: PersistedCognitiveThought[] = capturedThreads
    .map((thread) => {
      const context = captureContextMap[thread.id];
      if (!context) return null;

      return normalizePersistedThought({
        id: thread.id,
        capturedAt: thread.captured?.capturedAt ?? savedAt,
        thought: thread.captured?.thought ?? context.summary,
        continuationMarker: thread.captured?.continuationMarker ?? "",
        semanticTags: thread.captured?.semanticTags ?? context.recurringThemes,
        emotionalTone: thread.captured?.emotionalTone ?? null,
        markUnresolved: thread.status === "unresolved",
        thread,
        context,
      });
    })
    .filter((t): t is PersistedCognitiveThought => t !== null);

  return baseWorkspaceFields(raw, parseThoughts(thoughts));
}

/** Unversioned / partial snapshots — recover captured threads if present. */
export function parseWorkspacePersistenceLegacy(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw)) return null;
  if (raw.version === WORKSPACE_PERSISTENCE_VERSION || raw.version === 1) return null;

  if (Array.isArray(raw.thoughts)) {
    return baseWorkspaceFields({ ...raw, version: WORKSPACE_PERSISTENCE_VERSION }, parseThoughts(raw.thoughts));
  }

  if (Array.isArray(raw.capturedThreads)) {
    return parseWorkspacePersistenceV1({ ...raw, version: 1 });
  }

  return null;
}

export function parseWorkspacePersistence(
  raw: unknown
): WorkspacePersistenceState | null {
  if (!isRecord(raw)) return null;

  return (
    parseWorkspacePersistenceV2(raw) ??
    parseWorkspacePersistenceV1(raw) ??
    parseWorkspacePersistenceLegacy(raw)
  );
}
