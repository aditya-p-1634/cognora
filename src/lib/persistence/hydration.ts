import { readStorageRaw } from "@/lib/persistence/local-storage";
import { hydrateThoughtsForDisplay } from "@/lib/persistence/thought-records";
import { parseWorkspacePersistence } from "@/lib/persistence/validators";
import { WORKSPACE_STORAGE_KEY } from "@/lib/persistence/workspace-store";
import type { WorkspacePersistenceState } from "@/types/persistence";

export interface HydratedWorkspacePersistence {
  state: WorkspacePersistenceState;
  /** True when data was read from disk (including legacy shapes). */
  fromStorage: boolean;
}

/**
 * Loads and normalizes workspace persistence for provider hydration.
 * Never throws — returns null when storage is empty or unrecoverable.
 */
export function hydrateWorkspaceFromStorage(): HydratedWorkspacePersistence | null {
  const raw = readStorageRaw(WORKSPACE_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = parseWorkspacePersistence(JSON.parse(raw) as unknown);
    if (!parsed) return null;

    const thoughts = hydrateThoughtsForDisplay(parsed.thoughts);

    return {
      fromStorage: true,
      state: {
        ...parsed,
        thoughts,
      },
    };
  } catch {
    return null;
  }
}
