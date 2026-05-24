import { GRAVITY_THRESHOLDS } from "@/lib/gravity/scoring/constants";
import type { CognitionSignalProfile } from "@/lib/integrity/types";
import type { ThoughtThread } from "@/types/workspace";

/**
 * Resurfacing prefers meaningful unresolved cognition over noisy fragments.
 */
export function refineResurfacingOrder(
  threads: ThoughtThread[],
  effectiveGravity: Map<string, number>,
  signals: Map<string, CognitionSignalProfile>
): string[] {
  const minGravity = GRAVITY_THRESHOLDS.resurfacingMin;

  return [...threads]
    .filter((t) => {
      const gravity = effectiveGravity.get(t.id) ?? 0;
      const signal = signals.get(t.id)?.signal ?? 0.3;

      if (gravity < minGravity) return false;

      const meaningfulUnresolved =
        t.status === "unresolved" && signal >= 0.38;
      const resurfaced = t.status === "resurfaced" && signal >= 0.34;
      const strongField =
        gravity >= minGravity + 0.1 && signal >= 0.45;

      return meaningfulUnresolved || resurfaced || strongField;
    })
    .sort((a, b) => {
      const scoreA = compositeResurfacingScore(a, effectiveGravity, signals);
      const scoreB = compositeResurfacingScore(b, effectiveGravity, signals);
      return scoreB - scoreA || a.id.localeCompare(b.id);
    })
    .map((t) => t.id);
}

function compositeResurfacingScore(
  thread: ThoughtThread,
  gravity: Map<string, number>,
  signals: Map<string, CognitionSignalProfile>
): number {
  const g = gravity.get(thread.id) ?? 0;
  const s = signals.get(thread.id)?.signal ?? 0.3;
  let score = g * 0.65 + s * 0.35;

  if (thread.status === "unresolved") score += 0.06;
  if (thread.status === "resurfaced") score += 0.03;

  return score;
}
