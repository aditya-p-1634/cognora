import { GRAVITY_WEIGHTS } from "@/lib/gravity/scoring/constants";
import {
  capturedAgeDays,
  computeTemporalDecay,
  recencyFactor,
} from "@/lib/gravity/temporal/decay";
import type { ThreadContinuitySignals } from "@/types/gravity";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";

export interface GravityScoreInput {
  thread: ThoughtThread;
  context: ThoughtContext | undefined;
  profile: ThoughtSemanticProfile;
  signals: ThreadContinuitySignals;
  recurringParticipation: number;
  relationshipReach: number;
  hubBoost: number;
  now: number;
}

export function computeThreadGravity(input: GravityScoreInput): number {
  const { thread, profile, signals, now } = input;
  const w = GRAVITY_WEIGHTS;

  let score = w.baseline;

  if (profile.isUnresolved || thread.status === "unresolved") {
    score += w.unresolved;
  }

  if (thread.status === "resurfaced") {
    score += w.resurfacedStatus;
  }

  score += Math.min(
    w.selectionCap,
    signals.selectionCount * w.selection
  );
  score += Math.min(
    w.sessionCap,
    signals.sessionTouches * w.sessionTouch
  );
  score +=
    Math.min(3, signals.resurfacingTouches) * w.resurfacingTouch;

  if (thread.status === "focus") score += w.focusStatus;

  score += Math.min(w.semanticField, input.recurringParticipation * 0.05);
  score += Math.min(
    w.relationshipCap,
    input.relationshipReach * w.relationshipCentrality
  );
  score += input.hubBoost > 0 ? w.hubMembership : 0;

  score += recencyFactor(thread.captured?.capturedAt, now);

  const agePenalty =
    capturedAgeDays(thread.captured?.capturedAt, now) > 14 ? 0.04 : 0;
  score -= agePenalty;

  const temporal = computeTemporalDecay(signals.lastReinforcedAt, now, {
    selectionCount: signals.selectionCount,
    isUnresolved: profile.isUnresolved,
  });

  const weighted = score * temporal;
  return Math.round(Math.min(1, Math.max(0.08, weighted)) * 1000) / 1000;
}
