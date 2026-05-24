/** Deterministic gravity coefficients — stable, non-gamified. */
export const GRAVITY_WEIGHTS = {
  baseline: 0.16,
  unresolved: 0.24,
  resurfacedStatus: 0.1,
  resurfacingTouch: 0.035,
  selection: 0.04,
  selectionCap: 0.2,
  focusStatus: 0.07,
  sessionTouch: 0.018,
  sessionCap: 0.1,
  semanticField: 0.14,
  hubMembership: 0.06,
  relationshipCentrality: 0.05,
  relationshipCap: 0.12,
} as const;

export const GRAVITY_THRESHOLDS = {
  resurfacingMin: 0.32,
  hubMinThreads: 2,
  maxHubs: 4,
} as const;
