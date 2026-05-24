import { isGenericToken } from "@/lib/integrity/generic-language";
import type { RelationshipConfidence } from "@/lib/integrity/types";
import type { RelationshipScoreComponents } from "@/lib/relationships/types";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";

export function scoreRelationshipConfidence(input: {
  components: RelationshipScoreComponents;
  sharedThemes: string[];
  sharedTokens: string[];
  recurringWeights: Map<string, number>;
  focus: ThoughtSemanticProfile;
  candidate: ThoughtSemanticProfile;
}): RelationshipConfidence {
  const { components, sharedThemes, sharedTokens, recurringWeights } = input;

  let confidence = 0.34;
  let coherence: RelationshipConfidence["coherence"] = "weak";

  const recurringThemeHits = sharedThemes.filter(
    (t) => (recurringWeights.get(t) ?? 0) >= 1
  ).length;

  if (sharedThemes.length > 0) {
    confidence += 0.22 + Math.min(0.18, recurringThemeHits * 0.08);
    coherence = recurringThemeHits > 0 ? "strong" : "moderate";
  }

  if (components.continuationLineage > 0 && sharedThemes.length > 0) {
    confidence += 0.14;
    coherence = "strong";
  }

  if (components.unresolvedResonance > 0 && sharedThemes.length > 0) {
    confidence += 0.1;
    if (coherence === "weak") coherence = "moderate";
  }

  if (components.sharedEchoes > 0) {
    confidence += 0.08;
  }

  if (components.emotionalTone > 0) {
    confidence += 0.04;
  }

  const specificTokens = sharedTokens.filter((t) => !isGenericToken(t));
  const tokenOnly =
    components.languagePatterns > 0 &&
    sharedThemes.length === 0 &&
    components.sharedEchoes === 0;

  if (tokenOnly) {
    confidence -= 0.18;
    if (specificTokens.length < 2) confidence -= 0.1;
  } else if (specificTokens.length >= 2) {
    confidence += Math.min(0.08, specificTokens.length * 0.02);
  }

  if (
    components.languagePatterns > components.sharedEchoes &&
    sharedThemes.length === 0
  ) {
    confidence -= 0.08;
  }

  const clamped = Math.min(1, Math.max(0.22, confidence));

  if (clamped >= 0.62) coherence = "strong";
  else if (clamped >= 0.44) coherence = coherence === "weak" ? "moderate" : coherence;

  return { confidence: Math.round(clamped * 1000) / 1000, coherence };
}

export function effectiveRelationshipScore(
  rawScore: number,
  confidence: number,
  focusSignal: number,
  candidateSignal: number
): number {
  const signalBlend = Math.min(focusSignal, candidateSignal);
  const integrity = 0.4 + 0.6 * signalBlend;
  return Math.round(rawScore * confidence * integrity * 10) / 10;
}
