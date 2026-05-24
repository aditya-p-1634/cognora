import { RELATIONSHIP_WEIGHTS } from "@/lib/relationships/scoring/constants";
import type {
  RelationshipScoreComponents,
  ThoughtSemanticProfile,
} from "@/lib/relationships/types";

function intersectSorted(a: string[], b: string[]): string[] {
  const result: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push(a[i]);
      i++;
      j++;
    } else if (a[i] < b[j]) {
      i++;
    } else {
      j++;
    }
  }
  return result;
}

export function scoreRelationshipPair(
  focus: ThoughtSemanticProfile,
  candidate: ThoughtSemanticProfile,
  options?: {
    recurringWeights?: Map<string, number>;
    latentWeight?: number;
  }
): {
  totalScore: number;
  components: RelationshipScoreComponents;
  sharedThemes: string[];
  sharedTokens: string[];
} {
  const recurring = options?.recurringWeights ?? new Map();
  const latentMultiplier = 1 + (options?.latentWeight ?? 0);

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

  const components: RelationshipScoreComponents = {
    sharedEchoes,
    continuationLineage,
    unresolvedResonance,
    emotionalTone,
    languagePatterns,
  };

  const rawTotal =
    sharedEchoes +
    continuationLineage +
    unresolvedResonance +
    emotionalTone +
    languagePatterns;

  const totalScore = Math.round(rawTotal * latentMultiplier * 10) / 10;

  return { totalScore, components, sharedThemes, sharedTokens };
}
