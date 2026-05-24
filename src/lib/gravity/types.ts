import type { GravityLedger, ThreadContinuitySignals } from "@/types/gravity";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

export interface ContinuityHub {
  theme: string;
  threadIds: string[];
  /** Internal cohesion — not shown in UI. */
  weight: number;
}

export interface ThreadGravityEntry {
  threadId: string;
  weight: number;
  signals: ThreadContinuitySignals;
}

export interface ContinuityGravityField {
  weights: Map<string, number>;
  entries: ThreadGravityEntry[];
  hubs: ContinuityHub[];
  /** Stable resurfacing priority — highest gravity first. */
  resurfacingOrder: string[];
}

export interface GravityFieldInput {
  threads: ThoughtThread[];
  contextByThreadId: Record<string, ThoughtContext>;
  ledger: GravityLedger;
  now?: number;
}

export type { ThreadContinuitySignals, GravityLedger };
