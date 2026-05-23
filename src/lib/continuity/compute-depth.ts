import type { ContinuityDepthInput } from "@/lib/continuity/types";

/**
 * Continuity depth — a calm signal of how much cognitive state is held,
 * not a productivity score. Bounded 0–100.
 */
export function computeContinuityDepth(input: ContinuityDepthInput): number {
  const { threadCount, capturedCount, hasSelection, sessionStartedAt, lastSavedAt } =
    input;

  let score = 24;
  score += Math.min(threadCount, 10) * 4;
  score += Math.min(capturedCount, 6) * 7;
  if (hasSelection) score += 9;

  const now = Date.now();
  const sessionAgeHours =
    (now - new Date(sessionStartedAt).getTime()) / (1000 * 60 * 60);
  if (sessionAgeHours < 48) score += 8;

  if (lastSavedAt) {
    const hoursSinceSave =
      (now - new Date(lastSavedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSave < 24) score += 10;
    else if (hoursSinceSave < 168) score += 5;
  }

  return Math.min(100, Math.round(score));
}
