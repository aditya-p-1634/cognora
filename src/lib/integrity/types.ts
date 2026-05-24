import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import type { ContinuityGravityField } from "@/lib/gravity/types";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";
import type { ThreadContinuitySignals } from "@/types/gravity";

/** Internal cognition signal — never surfaced in UI. */
export interface CognitionSignalProfile {
  threadId: string;
  signal: number;
  isLowSignal: boolean;
}

export interface RelationshipConfidence {
  confidence: number;
  /** Theme/tag overlap vs token-only overlap. */
  coherence: "strong" | "moderate" | "weak";
}

export interface SemanticIntegrityField {
  signals: Map<string, CognitionSignalProfile>;
  effectiveGravity: Map<string, number>;
  resurfacingOrder: string[];
}

export interface IntegrityFieldInput {
  threads: ThoughtThread[];
  contextByThreadId: Record<string, ThoughtContext>;
  gravityField: ContinuityGravityField;
  profiles?: Map<string, ThoughtSemanticProfile>;
  recurringWeights?: Map<string, number>;
  ledger?: Record<string, ThreadContinuitySignals>;
  now?: number;
}
