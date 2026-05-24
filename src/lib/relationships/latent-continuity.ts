import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import { extractProfilesForThreads } from "@/lib/relationships/semantic/extract-profile";

/**
 * Soft latent weights for unresolved / resurfaced threads.
 * Influences relationship scoring without notifications or aggressive resurfacing.
 */
export function computeLatentContinuityWeights(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>,
  gravityWeights?: Map<string, number>
): Map<string, number> {
  const profiles = extractProfilesForThreads(threads, contextByThreadId);
  const weights = new Map<string, number>();

  for (const thread of threads) {
    const profile = profiles.get(thread.id);
    if (!profile) continue;

    let weight = 0;
    if (profile.isUnresolved) weight += 0.12;
    if (profile.status === "resurfaced") weight += 0.06;
    if (thread.captured) weight += 0.04;

    const gravity = gravityWeights?.get(thread.id) ?? 0;
    weight += gravity * 0.14;

    if (weight > 0) weights.set(thread.id, Math.min(weight, 0.24));
  }

  return weights;
}
