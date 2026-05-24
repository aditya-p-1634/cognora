import { toDisplayLabel } from "@/lib/relationships/semantic/normalize";
import { GRAVITY_THRESHOLDS } from "@/lib/gravity/scoring/constants";
import type { ContinuityHub } from "@/lib/gravity/types";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";

export function deriveContinuityHubs(
  profiles: Map<string, ThoughtSemanticProfile>,
  gravityWeights: Map<string, number>
): ContinuityHub[] {
  const themeIndex = new Map<
    string,
    { threadIds: Set<string>; gravitySum: number }
  >();

  for (const profile of profiles.values()) {
    const gravity = gravityWeights.get(profile.threadId) ?? 0;
    if (gravity < GRAVITY_THRESHOLDS.resurfacingMin * 0.85) continue;

    for (const theme of profile.themes) {
      const bucket = themeIndex.get(theme) ?? {
        threadIds: new Set<string>(),
        gravitySum: 0,
      };
      bucket.threadIds.add(profile.threadId);
      bucket.gravitySum += gravity;
      themeIndex.set(theme, bucket);
    }
  }

  return [...themeIndex.entries()]
    .filter(([, bucket]) => bucket.threadIds.size >= GRAVITY_THRESHOLDS.hubMinThreads)
    .map(([theme, bucket]) => ({
      theme: toDisplayLabel(theme),
      threadIds: [...bucket.threadIds].sort((a, b) => a.localeCompare(b)),
      weight:
        Math.round(
          (bucket.gravitySum / bucket.threadIds.size) * bucket.threadIds.size * 100
        ) / 100,
    }))
    .sort((a, b) => b.weight - a.weight || a.theme.localeCompare(b.theme))
    .slice(0, GRAVITY_THRESHOLDS.maxHubs);
}

export function hubBoostForThread(
  threadId: string,
  hubs: ContinuityHub[]
): number {
  let boost = 0;
  for (const hub of hubs) {
    if (hub.threadIds.includes(threadId)) {
      boost += 0.15;
    }
  }
  return Math.min(1, boost);
}
