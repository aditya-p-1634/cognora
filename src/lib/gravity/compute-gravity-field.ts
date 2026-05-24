import { resolveThreadSignals } from "@/lib/gravity/signals/ledger";
import { computeThreadGravity } from "@/lib/gravity/scoring/compute-gravity";
import {
  deriveContinuityHubs,
  hubBoostForThread,
} from "@/lib/gravity/topology/continuity-hubs";
import { rankResurfacingCandidates } from "@/lib/gravity/resurfacing/rank-candidates";
import {
  computeRecurringConceptWeights,
  extractProfilesForThreads,
} from "@/lib/relationships/semantic/extract-profile";
import { scoreRelationshipPair } from "@/lib/relationships/scoring/score-pair";
import type { ContinuityGravityField, GravityFieldInput } from "@/lib/gravity/types";

function recurringParticipation(
  profileThemes: string[],
  recurring: Map<string, number>
): number {
  let sum = 0;
  for (const theme of profileThemes) {
    sum += recurring.get(theme) ?? 0;
  }
  return sum;
}

function relationshipReach(
  focusProfiles: ReturnType<typeof extractProfilesForThreads>,
  threadId: string,
  recurring: Map<string, number>
): number {
  const focus = focusProfiles.get(threadId);
  if (!focus) return 0;

  let reach = 0;
  for (const [otherId, other] of focusProfiles) {
    if (otherId === threadId) continue;
    const { totalScore } = scoreRelationshipPair(focus, other, { recurringWeights: recurring });
    if (totalScore >= 5) reach += 1;
  }
  return reach;
}

/** Primary entry — memory gravity field for the workspace. */
export function computeGravityField(input: GravityFieldInput): ContinuityGravityField {
  const { threads, contextByThreadId, ledger } = input;
  const now = input.now ?? Date.now();

  const profiles = extractProfilesForThreads(threads, contextByThreadId);
  const recurring = computeRecurringConceptWeights(profiles.values());

  const provisionalWeights = new Map<string, number>();

  for (const thread of threads) {
    const profile = profiles.get(thread.id);
    if (!profile) continue;

    const signals = resolveThreadSignals(thread, ledger, now);
    const weight = computeThreadGravity({
      thread,
      context: contextByThreadId[thread.id],
      profile,
      signals,
      recurringParticipation: recurringParticipation(profile.themes, recurring),
      relationshipReach: relationshipReach(profiles, thread.id, recurring),
      hubBoost: 0,
      now,
    });
    provisionalWeights.set(thread.id, weight);
  }

  const hubs = deriveContinuityHubs(profiles, provisionalWeights);
  const weights = new Map<string, number>();
  const entries = [];

  for (const thread of threads) {
    const profile = profiles.get(thread.id);
    if (!profile) continue;

    const signals = resolveThreadSignals(thread, ledger, now);
    const hubBoost = hubBoostForThread(thread.id, hubs);
    const weight = computeThreadGravity({
      thread,
      context: contextByThreadId[thread.id],
      profile,
      signals,
      recurringParticipation: recurringParticipation(profile.themes, recurring),
      relationshipReach: relationshipReach(profiles, thread.id, recurring),
      hubBoost,
      now,
    });

    weights.set(thread.id, weight);
    entries.push({ threadId: thread.id, weight, signals });
  }

  entries.sort(
    (a, b) => b.weight - a.weight || a.threadId.localeCompare(b.threadId)
  );

  return {
    weights,
    entries,
    hubs,
    resurfacingOrder: rankResurfacingCandidates(threads, weights),
  };
}
