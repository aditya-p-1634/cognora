import {
  readStorageJson,
  readStorageRaw,
  writeStorageJson,
} from "@/lib/persistence/local-storage";
import { parseWorkspacePersistence } from "@/lib/persistence/validators";
import type {
  WorkspacePersistencePayload,
  WorkspacePersistenceState,
} from "@/types/persistence";
import { WORKSPACE_PERSISTENCE_VERSION } from "@/types/persistence";

export const WORKSPACE_STORAGE_KEY = "cognora.continuity.v1";

export function loadWorkspacePersistence(): WorkspacePersistenceState | null {
  return readStorageJson(WORKSPACE_STORAGE_KEY, parseWorkspacePersistence);
}

function existingThoughtCount(): number {
  const raw = readStorageRaw(WORKSPACE_STORAGE_KEY);
  if (!raw) return 0;
  try {
    const parsed = parseWorkspacePersistence(JSON.parse(raw) as unknown);
    return parsed?.thoughts.length ?? 0;
  } catch {
    return 0;
  }
}

export function saveWorkspacePersistence(
  payload: WorkspacePersistencePayload
): boolean {
  if (payload.thoughts.length === 0 && existingThoughtCount() > 0) {
    return false;
  }

  const state: WorkspacePersistenceState = {
    version: WORKSPACE_PERSISTENCE_VERSION,
    savedAt: new Date().toISOString(),
    ...payload,
  };
  return writeStorageJson(WORKSPACE_STORAGE_KEY, state);
}
