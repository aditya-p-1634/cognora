import {
  formatThemeList,
  toDisplayLabel,
} from "@/lib/relationships/semantic/normalize";
import type {
  RelationshipAffinity,
  RelationshipScoreComponents,
  SemanticRelationKind,
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
 
/**
 * Derives the resonance hint shown in the context panel's "Adjacent cognition" list.
 *
 * When dominantKind is provided, it overrides or augments generic hints with
 * kind-specific language that reflects the actual cognitive relationship:
 *
 *   continues  → directional flow ("carries this thinking further")
 *   extends    → elaboration     ("deepens this within the same field")
 *   contrasts  → tension         ("holds a different angle on this")
 *   informs    → context         ("provides context for this thread")
 *   relates    → neutral         (no override — uses existing hint logic)
 *
 * dominantKind is optional for backward compatibility — callers that don't
 * pass it receive the same hint behavior as before.
 */
export function deriveResonanceHint(
  components: RelationshipScoreComponents,
  sharedThemes: string[],
  themeLabels: Record<string, string>,
  candidateIsUnresolved: boolean,
  emotionalTone: string | null,
  dominantKind?: SemanticRelationKind | null
): string {
  const ranked: { weight: number; hint: string }[] = [];
 
  // ── Kind-specific hints (highest priority when kind is meaningful) ────────
  //
  // These replace the generic continuation/echo hints when a directed kind
  // relationship was found. "relates" is explicitly excluded — it's the neutral
  // fallback assigned to all captured tag pairs and carries no directional meaning.
  if (dominantKind && dominantKind !== "relates") {
    const themeContext =
      sharedThemes.length > 0
        ? ` around ${formatThemeList(
            sharedThemes.map((t) => themeLabels[t] ?? toDisplayLabel(t)),
            2
          )}`
        : "";
 
    switch (dominantKind) {
      case "continues":
        ranked.push({
          weight: components.kindSignal + 2, // prioritize over generic continuation
          hint: sharedThemes.length > 0
            ? `carries this thinking further${themeContext}`
            : "carries this thinking further",
        });
        break;
      case "extends":
        ranked.push({
          weight: components.kindSignal + 1,
          hint: sharedThemes.length > 0
            ? `deepens this${themeContext}`
            : "deepens the same field of thinking",
        });
        break;
      case "contrasts":
        ranked.push({
          weight: components.kindSignal + 1,
          hint: sharedThemes.length > 0
            ? `holds a different angle${themeContext}`
            : "holds a contrasting perspective",
        });
        break;
      case "informs":
        ranked.push({
          weight: components.kindSignal,
          hint: sharedThemes.length > 0
            ? `provides context${themeContext}`
            : "provides context for this thread",
        });
        break;
    }
  }
 
  // ── Existing component-based hints ───────────────────────────────────────
  //
  // These run regardless of dominantKind. If a kind hint was added above, it
  // will typically outrank these by weight. If dominantKind is null or "relates",
  // these are the only hints and behavior is identical to before this change.
 
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