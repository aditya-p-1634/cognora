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
 
// ─── Influence Engine ─────────────────────────────────────────────────────────
 
/**
 * Qualitative influence band — the position of a thought in the field
 * relative to all other thoughts.
 *
 * Never expose the numeric score that produced this band in the UI.
 * The band is the signal; the number behind it is an implementation detail.
 *
 * field-anchor  — top 15% of influence scores; minimum one inbound connection.
 *                 The thoughts the rest of the field gravitates toward.
 * strong        — 15–35% percentile. Clearly connected, multiple relationships.
 * moderate      — 35–65%. Participates in the field; some inbound connections.
 * peripheral    — bottom 35%, or score = 0. Few or no inbound connections.
 */
export type InfluenceBand =
  | "field-anchor"
  | "strong"
  | "moderate"
  | "peripheral";
 
/**
 * Influence state for a single thought.
 *
 * score         — gravity-weighted inbound connection sum. Internal only.
 * band          — qualitative position derived from field distribution.
 * inboundCount  — number of other thoughts that scored ≥ minThreshold against this one.
 * dominantKindReceived — the most common SemanticRelationKind among inbound connections,
 *                        or null when no kind data was present.
 */
export interface InfluenceEntry {
  threadId: string;
  score: number;
  band: InfluenceBand;
  inboundCount: number;
  dominantKindReceived: SemanticRelationKind | null;
}
 
/**
 * The complete influence field for the current workspace state.
 *
 * byThreadId    — O(1) lookup by thread ID.
 * ranked        — all entries sorted descending by score; stable for iteration.
 * fieldAnchorIds — shortcut: IDs of field-anchor thoughts in score order.
 */
export interface InfluenceField {
  byThreadId: Map<string, InfluenceEntry>;
  ranked: InfluenceEntry[];
  fieldAnchorIds: string[];
}