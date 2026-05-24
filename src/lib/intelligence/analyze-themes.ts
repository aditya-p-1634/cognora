import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import type { ThemeCluster } from "@/lib/intelligence/types";

function normalizeTheme(value: string): string {
  return value.trim().toLowerCase();
}

function collectThreadThemes(
  thread: ThoughtThread,
  context: ThoughtContext | undefined
): string[] {
  const themes = new Set<string>();

  for (const tag of context?.recurringThemes ?? []) {
    const normalized = normalizeTheme(tag);
    if (normalized) themes.add(normalized);
  }

  for (const concept of context?.relatedConcepts ?? []) {
    const normalized = normalizeTheme(concept.label);
    if (normalized) themes.add(normalized);
  }

  for (const tag of thread.captured?.semanticTags ?? []) {
    const normalized = normalizeTheme(tag);
    if (normalized) themes.add(normalized);
  }

  const titleTokens = thread.title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 4);
  for (const token of titleTokens.slice(0, 2)) {
    themes.add(token);
  }

  return [...themes];
}

export function analyzeThemeClusters(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>
): ThemeCluster[] {
  const index = new Map<string, Set<string>>();

  for (const thread of threads) {
    const themes = collectThreadThemes(thread, contextByThreadId[thread.id]);
    for (const theme of themes) {
      const bucket = index.get(theme) ?? new Set<string>();
      bucket.add(thread.id);
      index.set(theme, bucket);
    }
  }

  return [...index.entries()]
    .map(([theme, threadIds]) => ({
      theme,
      threadIds: [...threadIds],
      weight: threadIds.size,
    }))
    .filter((cluster) => cluster.weight >= 2)
    .sort((a, b) => b.weight - a.weight || a.theme.localeCompare(b.theme));
}

export function collectLatentEchoes(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>,
  limit = 5
): string[] {
  const scores = new Map<string, number>();

  const bump = (raw: string, weight: number) => {
    const key = raw.trim();
    if (!key) return;
    scores.set(key, (scores.get(key) ?? 0) + weight);
  };

  for (const thread of threads) {
    const context = contextByThreadId[thread.id];
    for (const theme of context?.recurringThemes ?? []) bump(theme, 3);
    for (const concept of context?.relatedConcepts ?? []) {
      bump(concept.label, concept.affinity === "strong" ? 4 : 2);
    }
    for (const tag of thread.captured?.semanticTags ?? []) bump(tag, 4);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label]) => label);
}
