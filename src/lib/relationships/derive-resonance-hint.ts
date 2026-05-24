import {
  formatThemeList,
  toDisplayLabel,
} from "@/lib/relationships/semantic/normalize";
import type {
  RelationshipScoreComponents,
  RelationshipAffinity,
} from "@/lib/relationships/types";

const TONE_LABELS: Record<string, string> = {
  contemplative: "contemplative",
  curious: "curious",
  uncertain: "open",
  energized: "energized",
  calm: "calm",
};

export function affinityFromScore(totalScore: number): RelationshipAffinity {
  if (totalScore >= 14) return "near";
  if (totalScore >= 8) return "adjacent";
  return "latent";
}

export function deriveResonanceHint(
  components: RelationshipScoreComponents,
  sharedThemes: string[],
  themeLabels: Record<string, string>,
  candidateIsUnresolved: boolean,
  emotionalTone: string | null
): string {
  const ranked: { weight: number; hint: string }[] = [];

  if (components.sharedEchoes > 0 && sharedThemes.length > 0) {
    const labels = sharedThemes.map((t) => themeLabels[t] ?? toDisplayLabel(t));
    ranked.push({
      weight: components.sharedEchoes,
      hint: `touches on ${formatThemeList(labels, 2)}`,
    });
  }

  if (components.continuationLineage > 0) {
    ranked.push({
      weight: components.continuationLineage,
      hint: "continues a nearby line of thought",
    });
  }

  if (components.unresolvedResonance > 0 && candidateIsUnresolved) {
    ranked.push({
      weight: components.unresolvedResonance,
      hint: "holds an open loop in the same field",
    });
  } else if (components.unresolvedResonance > 0) {
    ranked.push({
      weight: components.unresolvedResonance,
      hint: "resonates with unresolved continuity nearby",
    });
  }

  if (components.emotionalTone > 0 && emotionalTone) {
    const tone = TONE_LABELS[emotionalTone] ?? emotionalTone;
    ranked.push({
      weight: components.emotionalTone,
      hint: `carries a similar ${tone} tone`,
    });
  }

  if (components.languagePatterns > 0) {
    ranked.push({
      weight: components.languagePatterns,
      hint: "shares phrasing in the continuity field",
    });
  }

  ranked.sort((a, b) => b.weight - a.weight);

  if (ranked.length > 0) return ranked[0].hint;
  return "rests adjacent in the continuity field";
}

export function deriveContinuityEcho(
  focusLabels: Record<string, string>,
  sharedThemes: string[],
  sharedTokens: string[]
): string | null {
  if (sharedThemes.length >= 2) {
    const labels = sharedThemes.map((t) => focusLabels[t] ?? toDisplayLabel(t));
    return `Held together by ${formatThemeList(labels, 3)}`;
  }

  if (sharedThemes.length === 1) {
    const label = focusLabels[sharedThemes[0]] ?? toDisplayLabel(sharedThemes[0]);
    return `Both orbit ${label}`;
  }

  if (sharedTokens.length >= 2) {
    return `Shared language around ${sharedTokens.slice(0, 2).join(" and ")}`;
  }

  return null;
}
