/** Deterministic weights — stable, predictable relationship scoring. */
export const RELATIONSHIP_WEIGHTS = {
  sharedEchoTag: 6,
  sharedEchoTheme: 5,
  continuationToken: 4,
  continuationThemeBridge: 8,
  unresolvedResonance: 5,
  unresolvedFieldBoost: 2,
  emotionalToneMatch: 4,
  languagePatternToken: 1.5,
  languagePatternCap: 9,
  recurringConceptBonus: 2,
} as const;

export const RELATIONSHIP_THRESHOLDS = {
  minDisplayScore: 5,
  nearAffinity: 14,
  adjacentAffinity: 8,
  maxRelatedThoughts: 3,
  maxSharedResonance: 4,
  maxContinuityEchoes: 3,
} as const;
