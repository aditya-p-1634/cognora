import type { CapturedThoughtMeta } from "@/types/capture";

export type ThoughtThreadStatus = "active" | "unresolved" | "resurfaced" | "focus";

export interface ThoughtThread {
  id: string;
  title: string;
  excerpt: string;
  status: ThoughtThreadStatus;
  lastTouched: string;
  momentum?: "high" | "medium" | "low";
  projectLabel?: string;
  /** Present for thoughts preserved through the capture overlay. */
  captured?: CapturedThoughtMeta;
}

export interface ContinuitySuggestion {
  id: string;
  message: string;
  actionLabel?: string;
}

export interface ActiveSession {
  id: string;
  label: string;
  startedAt: string;
  threadCount: number;
}

export type ConceptAffinity = "strong" | "moderate" | "latent";

export interface RelatedConcept {
  id: string;
  label: string;
  affinity: ConceptAffinity;
}

export type SemanticRelationKind =
  | "extends"
  | "relates"
  | "continues"
  | "contrasts"
  | "informs";

export interface SemanticRelationship {
  id: string;
  source: string;
  target: string;
  kind: SemanticRelationKind;
}

export interface ConnectedSession {
  id: string;
  label: string;
  relativeTime: string;
  threadCount: number;
}

export interface ThoughtContext {
  threadId: string;
  summary: string;
  relatedConcepts: RelatedConcept[];
  semanticRelationships: SemanticRelationship[];
  recurringThemes: string[];
  unresolvedContinuations: string[];
  connectedSessions: ConnectedSession[];
}
