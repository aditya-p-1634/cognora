import {
  effectiveRelationshipScore,
  scoreRelationshipConfidence,
} from "@/lib/integrity/score-relationship-confidence";
import { RELATIONSHIP_THRESHOLDS } from "@/lib/relationships/scoring/constants";
import type { CognitionSignalProfile } from "@/lib/integrity/types";
import type {
  ScoredThreadRelationship,
  ThoughtSemanticProfile,
} from "@/lib/relationships/types";

export interface IntegrityScoredRelationship extends ScoredThreadRelationship {
  effectiveScore: number;
  confidence: number;
}

export function applyIntegrityToRelationships(
  focus: ThoughtSemanticProfile,
  scored: ScoredThreadRelationship[],
  profiles: Map<string, ThoughtSemanticProfile>,
  signals: Map<string, CognitionSignalProfile>,
  recurringWeights: Map<string, number>
): IntegrityScoredRelationship[] {
  const focusSignal = signals.get(focus.threadId)?.signal ?? 0.35;

  const enriched: IntegrityScoredRelationship[] = [];

  for (const entry of scored) {
    const candidate = profiles.get(entry.threadId);
    if (!candidate) continue;

    const candidateSignal = signals.get(entry.threadId)?.signal ?? 0.35;
    const { confidence } = scoreRelationshipConfidence({
      components: entry.components,
      sharedThemes: entry.sharedThemes,
      sharedTokens: entry.sharedTokens,
      recurringWeights,
      focus,
      candidate,
    });

    const effectiveScore = effectiveRelationshipScore(
      entry.totalScore,
      confidence,
      focusSignal,
      candidateSignal
    );

    const adaptiveMin =
      RELATIONSHIP_THRESHOLDS.minDisplayScore /
      Math.max(0.45, Math.min(focusSignal, candidateSignal));

    if (effectiveScore < adaptiveMin) continue;
    if (confidence < 0.28 && entry.sharedThemes.length === 0) continue;

    enriched.push({
      ...entry,
      effectiveScore,
      confidence,
      totalScore: effectiveScore,
    });
  }

  return enriched.sort(
    (a, b) =>
      b.effectiveScore - a.effectiveScore ||
      a.threadId.localeCompare(b.threadId)
  );
}

export function filterResonanceThemes(
  scored: IntegrityScoredRelationship[],
  focusLabels: Record<string, string>,
  limit: number
): string[] {
  const themes: string[] = [];

  for (const entry of scored) {
    if (entry.confidence < 0.4) continue;
    for (const theme of entry.sharedThemes) {
      const label = focusLabels[theme] ?? theme;
      if (!themes.includes(label)) themes.push(label);
      if (themes.length >= limit) return themes;
    }
  }

  return themes;
}
