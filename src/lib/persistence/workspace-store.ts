import { readStorageJson, writeStorageJson } from "@/lib/persistence/local-storage";
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

export function saveWorkspacePersistence(
  payload: WorkspacePersistencePayload
): boolean {
  const state: WorkspacePersistenceState = {
    version: WORKSPACE_PERSISTENCE_VERSION,
    savedAt: new Date().toISOString(),
    ...payload,
  };
  return writeStorageJson(WORKSPACE_STORAGE_KEY, state);
}
