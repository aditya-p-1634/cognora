import type {
  SemanticRelationKind,
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
  /**
   * Directed relationship kinds extracted from context.semanticRelationships.
   * Key format: "<normalizedSourceKey>→<normalizedTargetKey>"
   * Value: the SemanticRelationKind for that directed pair.
   *
   * Optional — absent for profiles built from contexts with no semanticRelationships
   * (e.g. during gravity reach computation, which doesn't need kind data).
   */
  relationKinds?: Map<string, SemanticRelationKind>;
}
 
export interface RelationshipScoreComponents {
  sharedEchoes: number;
  continuationLineage: number;
  unresolvedResonance: number;
  emotionalTone: number;
  languagePatterns: number;
  /**
   * Score contribution from SemanticRelationKind — sum of kind-based bonuses.
   * Zero when no directed kind relationships are found between the pair.
   */
  kindSignal: number;
}
 
export interface ScoredThreadRelationship {
  threadId: string;
  totalScore: number;
  components: RelationshipScoreComponents;
  sharedThemes: string[];
  sharedTokens: string[];
  /**
   * Dominant SemanticRelationKind found between the pair.
   * Null when no directed kind relationships matched.
   * Used by deriveResonanceHint to produce kind-specific hints.
   */
  dominantKind: SemanticRelationKind | null;
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
 
/** Re-export for consumers that import kinds from the relationships barrel. */
export type { SemanticRelationKind };