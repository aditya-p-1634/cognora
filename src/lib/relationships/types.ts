import type {
  ThoughtContext,
  ThoughtThread,
  ThoughtThreadStatus,
} from "@/types/workspace";

/** Calm affinity band — never expose raw scores in UI. */
export type RelationshipAffinity = "near" | "adjacent" | "latent";

export interface ThoughtSemanticProfile {
  threadId: string;
  themes: string[];
  tags: string[];
  tokens: string[];
  continuationTokens: string[];
  emotionalTone: string | null;
  isUnresolved: boolean;
  status: ThoughtThreadStatus;
  /** normalized key → display label */
  themeLabels: Record<string, string>;
}

export interface RelationshipScoreComponents {
  sharedEchoes: number;
  continuationLineage: number;
  unresolvedResonance: number;
  emotionalTone: number;
  languagePatterns: number;
}

export interface ScoredThreadRelationship {
  threadId: string;
  totalScore: number;
  components: RelationshipScoreComponents;
  sharedThemes: string[];
  sharedTokens: string[];
}

export interface RelatedThought {
  threadId: string;
  title: string;
  excerpt: string;
  status: ThoughtThreadStatus;
  affinity: RelationshipAffinity;
  /** Observational hint — no algorithmic framing. */
  resonanceHint: string;
}

export interface ThreadRelationshipSnapshot {
  focusThreadId: string;
  relatedThoughts: RelatedThought[];
  sharedResonance: string[];
  continuityEchoes: string[];
}

export interface RelationshipEngineInput {
  focusThreadId: string;
  threads: ThoughtThread[];
  contextByThreadId: Record<string, ThoughtContext>;
}
