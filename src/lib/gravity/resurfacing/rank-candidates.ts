import { GRAVITY_THRESHOLDS } from "@/lib/gravity/scoring/constants";
import type { ThoughtThread } from "@/types/workspace";

/** Stable gravity-based resurfacing order — not recommendation ranking. */
export function rankResurfacingCandidates(
  threads: ThoughtThread[],
  gravityWeights: Map<string, number>
): string[] {
  return [...threads]
    .filter((t) => {
      const weight = gravityWeights.get(t.id) ?? 0;
      if (weight < GRAVITY_THRESHOLDS.resurfacingMin) return false;
      return (
        t.status === "resurfaced" ||
        t.status === "unresolved" ||
        weight >= GRAVITY_THRESHOLDS.resurfacingMin + 0.12
      );
    })
    .sort(
      (a, b) =>
        (gravityWeights.get(b.id) ?? 0) - (gravityWeights.get(a.id) ?? 0) ||
        a.id.localeCompare(b.id)
    )
    .map((t) => t.id);
}
