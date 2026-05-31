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
 
  /**
   * SemanticRelationKind weights.
   *
   * These apply when a directed kind relationship is found between the focus
   * profile's source/target theme keys and any of the candidate's theme keys.
   *
   * Calibration rationale:
   *
   * kindContinues (7): "continues" implies sequential cognitive flow — the
   *   candidate directly extends the focus's line of thought. Strong signal,
   *   below continuationThemeBridge (8) since it's declared, not derived.
   *
   * kindExtends (6): "extends" implies elaboration or deepening — related but
   *   not sequential. Equivalent to a shared tag (6) since both indicate a
   *   strong intentional connection.
   *
   * kindInforms (4): "informs" implies one thought provides context for another.
   *   Moderate — equivalent to emotionalToneMatch. Directional but looser than
   *   continuation or extension.
   *
   * kindContrasts (5): "contrasts" is a productive tension signal — the candidate
   *   holds an opposing or qualifying view in the same semantic field. Scored
   *   positively because contrast is cognitively significant, but lower than
   *   kindContinues. The kind is tracked separately in components so the
   *   resonance hint can express tension rather than agreement.
   */
  kindContinues: 7,
  kindExtends: 6,
  kindInforms: 4,
  kindContrasts: 5,
} as const;
 
export const RELATIONSHIP_THRESHOLDS = {
  minDisplayScore: 5,
  nearAffinity: 14,
  adjacentAffinity: 8,
  maxRelatedThoughts: 3,
  maxSharedResonance: 4,
  maxContinuityEchoes: 3,
} as const;