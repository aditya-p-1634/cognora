/** Per-thought continuity signals — persisted across sessions. */
export interface ThreadContinuitySignals {
  selectionCount: number;
  lastSelectedAt: string | null;
  lastReinforcedAt: string;
  resurfacingTouches: number;
  sessionTouches: number;
}

export type GravityLedger = Record<string, ThreadContinuitySignals>;
