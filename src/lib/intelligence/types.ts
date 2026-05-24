import type {
  ContinuitySuggestion,
  ThoughtContext,
  ThoughtThread,
} from "@/types/workspace";

export interface LatentGraphNode {
  id: string;
  label: string;
}

export interface LatentGraphEdge {
  source: string;
  target: string;
}

export interface LatentGraphSnapshot {
  nodes: LatentGraphNode[];
  edges: LatentGraphEdge[];
}

export interface ContinuityIntelligenceInput {
  threads: ThoughtThread[];
  contextByThreadId: Record<string, ThoughtContext>;
  selectedThreadId: string | null;
  sessionStartedAt: string;
  lastSavedAt: string | null;
  capturedCount: number;
}

export interface ContinuityIntelligence {
  suggestions: ContinuitySuggestion[];
  latentEchoes: string[];
  latentGraph: LatentGraphSnapshot;
}

export interface ThemeCluster {
  theme: string;
  threadIds: string[];
  weight: number;
}
