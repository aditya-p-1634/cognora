import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  computeRecurringConceptWeights,
  extractThoughtProfile,
} from "@/lib/relationships/semantic/extract-profile";
import { toDisplayLabel } from "@/lib/relationships/semantic/normalize";
import { computeLatentContinuityWeights } from "@/lib/relationships/latent-continuity";
import type { ThemeCluster } from "@/lib/intelligence/types";

export function analyzeThemeClusters(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>
): ThemeCluster[] {
  const index = new Map<string, Set<string>>();

  for (const thread of threads) {
    const profile = extractThoughtProfile(thread, contextByThreadId[thread.id]);
    for (const theme of profile.themes) {
      const bucket = index.get(theme) ?? new Set<string>();
      bucket.add(thread.id);
      index.set(theme, bucket);
    }
  }

  return [...index.entries()]
    .map(([theme, threadIds]) => ({
      theme: toDisplayLabel(theme),
      threadIds: [...threadIds],
      weight: threadIds.size,
    }))
    .filter((cluster) => cluster.weight >= 2)
    .sort((a, b) => b.weight - a.weight || a.theme.localeCompare(b.theme));
}

export function collectLatentEchoes(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>,
  limit = 5,
  gravityWeights?: Map<string, number>,
  cognitionSignals?: Map<string, { signal: number }>
): string[] {
  const profiles = threads.map((thread) =>
    extractThoughtProfile(thread, contextByThreadId[thread.id])
  );
  const recurring = computeRecurringConceptWeights(profiles);
  const latentWeights = computeLatentContinuityWeights(
    threads,
    contextByThreadId,
    gravityWeights
  );
  const scores = new Map<string, number>();

  const bump = (
    themeKey: string,
    label: string,
    weight: number,
    threadId: string
  ) => {
    const display = label.trim();
    if (!display) return;
    const latentBoost = 1 + (latentWeights.get(threadId) ?? 0);
    const recurringBoost = recurring.has(themeKey) ? 1.4 : 1;
    const signalBoost = 0.55 + 0.45 * (cognitionSignals?.get(threadId)?.signal ?? 0.4);
    scores.set(
      display,
      (scores.get(display) ?? 0) +
        weight * latentBoost * recurringBoost * signalBoost
    );
  };

  for (const thread of threads) {
    const profile = extractThoughtProfile(thread, contextByThreadId[thread.id]);
    for (const theme of profile.themes) {
      bump(
        theme,
        profile.themeLabels[theme] ?? toDisplayLabel(theme),
        3,
        thread.id
      );
    }
    for (const tag of profile.tags) {
      bump(tag, profile.themeLabels[tag] ?? toDisplayLabel(tag), 4, thread.id);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label]) => label);
}
