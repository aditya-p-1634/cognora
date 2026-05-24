import type { NavItemId } from "@/config/navigation";
import type { EmotionalTone } from "@/types/capture";
import type { GravityLedger } from "@/types/gravity";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

/** Storage schema version — bump when shape changes; migrate on read. */
export const WORKSPACE_PERSISTENCE_VERSION = 2 as const;

/**
 * Canonical persisted cognitive unit — extensible for graph, search, resurfacing, scoring.
 */
export interface PersistedCognitiveThought {
  id: string;
  capturedAt: string;
  /** Full preserved thought text. */
  thought: string;
  continuationMarker: string;
  /** Semantic tags / echoes captured at preserve time. */
  semanticTags: string[];
  emotionalTone: EmotionalTone | null;
  markUnresolved: boolean;
  /** Feed-facing thread projection. */
  thread: ThoughtThread;
  /** Context panel projection — summary, themes, continuations. */
  context: ThoughtContext;
}

export interface WorkspacePersistenceState {
  version: typeof WORKSPACE_PERSISTENCE_VERSION;
  savedAt: string;
  sessionStartedAt: string;
  sessionLabel: string;
  activeNav: NavItemId;
  selectedThreadId: string | null;
  thoughts: PersistedCognitiveThought[];
  /** Selection and reinforcement history for memory gravity. */
  gravityLedger?: GravityLedger;
}

/** Payload for save — version and savedAt are applied by the store. */
export type WorkspacePersistencePayload = Omit<
  WorkspacePersistenceState,
  "version" | "savedAt"
>;

export type { GravityLedger, ThreadContinuitySignals } from "@/types/gravity";
