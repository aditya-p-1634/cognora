export { computeGravityField } from "./compute-gravity-field";
export {
  reinforceSelection,
  resolveThreadSignals,
  touchSessionForThreads,
  normalizeGravityLedger,
  syntheticSignalsForThread,
  createDefaultSignals,
} from "./signals/ledger";
export { sortThreadsByGravity, pickHighestGravityThread } from "./utils/sort-threads";
export {
  gravityInfluenceMultiplier,
  combineInfluenceMultipliers,
} from "./influence/gravity-multipliers";
export { computeTemporalDecay } from "./temporal/decay";
export { rankResurfacingCandidates } from "./resurfacing/rank-candidates";
export type {
  ContinuityGravityField,
  ContinuityHub,
  GravityFieldInput,
  ThreadGravityEntry,
} from "./types";
