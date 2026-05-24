import type { ThoughtThread } from "@/types/workspace";

/** Stable sort by gravity — tie-break on thread id. */
export function sortThreadsByGravity(
  threads: ThoughtThread[],
  gravityWeights: Map<string, number>
): ThoughtThread[] {
  return [...threads].sort(
    (a, b) =>
      (gravityWeights.get(b.id) ?? 0) - (gravityWeights.get(a.id) ?? 0) ||
      a.id.localeCompare(b.id)
  );
}

export function pickHighestGravityThread(
  threads: ThoughtThread[],
  gravityWeights: Map<string, number>
): ThoughtThread | undefined {
  const sorted = sortThreadsByGravity(threads, gravityWeights);
  return sorted[0];
}
