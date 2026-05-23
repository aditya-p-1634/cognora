import type { NavItemId } from "@/config/navigation";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

export const CONTINUITY_SNAPSHOT_VERSION = 1 as const;

export interface ContinuitySnapshot {
  version: typeof CONTINUITY_SNAPSHOT_VERSION;
  savedAt: string;
  sessionStartedAt: string;
  sessionLabel: string;
  activeNav: NavItemId;
  selectedThreadId: string | null;
  capturedThreads: ThoughtThread[];
  captureContextMap: Record<string, ThoughtContext>;
}

export interface ContinuityDepthInput {
  threadCount: number;
  capturedCount: number;
  hasSelection: boolean;
  sessionStartedAt: string;
  lastSavedAt: string | null;
}
