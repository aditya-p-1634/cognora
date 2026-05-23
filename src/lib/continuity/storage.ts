import {
  loadWorkspacePersistence,
  saveWorkspacePersistence,
} from "@/lib/persistence/workspace-store";
import type { ContinuitySnapshot } from "@/lib/continuity/types";
import { thoughtsToFeedDerivatives } from "@/lib/persistence/thought-records";
import type { WorkspacePersistencePayload } from "@/types/persistence";

export const CONTINUITY_STORAGE_KEY = "cognora.continuity.v1";

function payloadToLegacySnapshot(
  payload: WorkspacePersistencePayload
): ContinuitySnapshot {
  const { capturedThreads, captureContextMap } = thoughtsToFeedDerivatives(
    payload.thoughts
  );
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    sessionStartedAt: payload.sessionStartedAt,
    sessionLabel: payload.sessionLabel,
    activeNav: payload.activeNav,
    selectedThreadId: payload.selectedThreadId,
    capturedThreads,
    captureContextMap,
  };
}

/** @deprecated Prefer loadWorkspacePersistence from @/lib/persistence */
export function loadContinuitySnapshot(): ContinuitySnapshot | null {
  const state = loadWorkspacePersistence();
  if (!state) return null;
  return payloadToLegacySnapshot(state);
}

/** @deprecated Prefer saveWorkspacePersistence from @/lib/persistence */
export function saveContinuitySnapshot(
  snapshot: Omit<ContinuitySnapshot, "version" | "savedAt">
): void {
  saveWorkspacePersistence({
    sessionStartedAt: snapshot.sessionStartedAt,
    sessionLabel: snapshot.sessionLabel,
    activeNav: snapshot.activeNav,
    selectedThreadId: snapshot.selectedThreadId,
    thoughts: snapshot.capturedThreads
      .map((thread) => {
        const context = snapshot.captureContextMap[thread.id];
        if (!context) return null;
        const captured = thread.captured;
        return {
          id: thread.id,
          capturedAt: captured?.capturedAt ?? new Date().toISOString(),
          thought: captured?.thought ?? context.summary,
          continuationMarker: captured?.continuationMarker ?? "",
          semanticTags: captured?.semanticTags ?? context.recurringThemes,
          emotionalTone: captured?.emotionalTone ?? null,
          markUnresolved: captured?.markUnresolved ?? thread.status === "unresolved",
          thread,
          context,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null),
  });
}

export function createInitialContinuitySnapshot(): ContinuitySnapshot {
  const now = new Date().toISOString();
  return {
    version: 1,
    savedAt: now,
    sessionStartedAt: now,
    sessionLabel: "Workspace foundation",
    activeNav: "dashboard",
    selectedThreadId: null,
    capturedThreads: [],
    captureContextMap: {},
  };
}
