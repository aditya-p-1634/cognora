import { RELATIONSHIP_WEIGHTS } from "@/lib/relationships/scoring/constants";
import type {
  RelationshipScoreComponents,
  SemanticRelationKind,
  ThoughtSemanticProfile,
} from "@/lib/relationships/types";
 
function intersectSorted(a: string[], b: string[]): string[] {
  const result: string[] = []
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push(a[i]);
      i++;
      j++;
    } else if (a[i]! < b[j]!) {
      i++;
    } else {
      j++;
    }
  }
  return result;
}
 
/**
 * Compute kind-based score contribution between focus and candidate profiles.
 *
 * Looks up directed relationships from focus.relationKinds against the
 * candidate's theme keys. Checks both directions:
 *   focus-source → candidate-theme  (focus declares a relationship into candidate)
 *   candidate-theme → focus-source  (candidate is the target of a focus relationship)
 *
 * Returns the accumulated kind score and the dominant kind (highest weight)
 * for use in resonance hint derivation.
 */
function scoreKindRelationships(
  focusRelationKinds: Map<string, SemanticRelationKind>,
  candidateThemes: string[]
): { kindScore: number; dominantKind: SemanticRelationKind | null } {
  if (focusRelationKinds.size === 0 || candidateThemes.length === 0) {
    return { kindScore: 0, dominantKind: null };
  }
 
  const kindWeights: Record<SemanticRelationKind, number> = {
    continues: RELATIONSHIP_WEIGHTS.kindContinues,
    extends:   RELATIONSHIP_WEIGHTS.kindExtends,
    contrasts: RELATIONSHIP_WEIGHTS.kindContrasts,
    informs:   RELATIONSHIP_WEIGHTS.kindInforms,
    // "relates" is the neutral fallback assigned by inferCaptureRelationships —
    // it carries no additional score beyond what shared-theme scoring already provides
    relates:   0,
  };
 
  let kindScore = 0;
  let dominantKind: SemanticRelationKind | null = null;
  let dominantWeight = 0;
 
  // For each directed pair in focus.relationKinds, check if either the source
  // or the target key appears in the candidate's theme list.
  for (const [directedPair, kind] of focusRelationKinds) {
    const weight = kindWeights[kind];
    if (weight === 0) continue;
 
    // Parse the "source→target" key
    const arrowIdx = directedPair.indexOf("→");
    if (arrowIdx === -1) continue;
    const srcKey = directedPair.slice(0, arrowIdx);
    const tgtKey = directedPair.slice(arrowIdx + 1);
 
    // Match if candidate holds the target of a focus relationship,
    // or if candidate holds the source (bidirectional semantic relevance)
    const candidateHasTarget = candidateThemes.includes(tgtKey);
    const candidateHasSource = candidateThemes.includes(srcKey);
 
    if (candidateHasTarget || candidateHasSource) {
      kindScore += weight;
      if (weight > dominantWeight) {
        dominantWeight = weight;
        dominantKind = kind;
      }
    }
  }
 
  return { kindScore, dominantKind };
}
 
export function scoreRelationshipPair(
  focus: ThoughtSemanticProfile,
  candidate: ThoughtSemanticProfile,
  options?: {
    recurringWeights?: Map<string, number>;
    latentWeight?: number;
    gravityWeight?: number;
  }
): {
  totalScore: number;
  components: RelationshipScoreComponents;
  sharedThemes: string[];
  sharedTokens: string[];
  /** Dominant SemanticRelationKind found between the pair, or null. */
  dominantKind: SemanticRelationKind | null;
} {
  const recurring = options?.recurringWeights ?? new Map();
  const latentPull = options?.latentWeight ?? 0;
  const gravityPull = (options?.gravityWeight ?? 0) * 0.2;
  const latentMultiplier = 1 + latentPull + gravityPull;
 
  const sharedThemes = intersectSorted(focus.themes, candidate.themes);
  const sharedTags = intersectSorted(focus.tags, candidate.tags);
  const sharedTokens = intersectSorted(focus.tokens, candidate.tokens);
  const sharedContinuation = intersectSorted(
    focus.continuationTokens,
    candidate.continuationTokens
  );
 
  let sharedEchoes = 0;
  for (const tag of sharedTags) {
    sharedEchoes += RELATIONSHIP_WEIGHTS.sharedEchoTag;
    sharedEchoes +=
      (recurring.get(tag) ?? 0) * RELATIONSHIP_WEIGHTS.recurringConceptBonus;
  }
  for (const theme of sharedThemes) {
    if (sharedTags.includes(theme)) continue;
    sharedEchoes += RELATIONSHIP_WEIGHTS.sharedEchoTheme;
    sharedEchoes +=
      (recurring.get(theme) ?? 0) * RELATIONSHIP_WEIGHTS.recurringConceptBonus;
  }
 
  let continuationLineage = 0;
  if (sharedContinuation.length > 0) {
    continuationLineage +=
      sharedContinuation.length * RELATIONSHIP_WEIGHTS.continuationToken;
  }
  if (sharedThemes.length > 0 && sharedContinuation.length > 0) {
    continuationLineage += RELATIONSHIP_WEIGHTS.continuationThemeBridge;
  }
 
  let unresolvedResonance = 0;
  if (focus.isUnresolved || candidate.isUnresolved) {
    if (sharedThemes.length > 0 || sharedTags.length > 0) {
      unresolvedResonance += RELATIONSHIP_WEIGHTS.unresolvedResonance;
    }
    if (candidate.isUnresolved && sharedThemes.length > 0) {
      unresolvedResonance += RELATIONSHIP_WEIGHTS.unresolvedFieldBoost;
    }
  }
 
  let emotionalTone = 0;
  if (
    focus.emotionalTone &&
    candidate.emotionalTone &&
    focus.emotionalTone === candidate.emotionalTone
  ) {
    emotionalTone = RELATIONSHIP_WEIGHTS.emotionalToneMatch;
  }
 
  const languagePatterns = Math.min(
    RELATIONSHIP_WEIGHTS.languagePatternCap,
    sharedTokens.length * RELATIONSHIP_WEIGHTS.languagePatternToken
  );
 
  // ── SemanticRelationKind scoring ─────────────────────────────────────────
  //
  // Applied when focus.relationKinds is populated (i.e. when the context had
  // semanticRelationships). The gravity reach computation in
  // compute-gravity-field.ts passes profiles without kind data — those callers
  // receive kindScore: 0 and dominantKind: null with no behavior change.
  const { kindScore, dominantKind } = focus.relationKinds
    ? scoreKindRelationships(focus.relationKinds, candidate.themes)
    : { kindScore: 0, dominantKind: null };
 
  const components: RelationshipScoreComponents = {
    sharedEchoes,
    continuationLineage,
    unresolvedResonance,
    emotionalTone,
    languagePatterns,
    kindSignal: kindScore,
  };
 
  const rawTotal =
    sharedEchoes +
    continuationLineage +
    unresolvedResonance +
    emotionalTone +
    languagePatterns +
    kindScore;
 
  const totalScore = Math.round(rawTotal * latentMultiplier * 10) / 10;
 
  return { totalScore, components, sharedThemes, sharedTokens, dominantKind };
}