import type { EmotionalTone } from "@/types/capture";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  normalizeSemanticKey,
  toDisplayLabel,
  tokenizeSemanticText,
} from "@/lib/relationships/semantic/normalize";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";

function registerTheme(
  themes: Set<string>,
  labels: Record<string, string>,
  raw: string
): void {
  const key = normalizeSemanticKey(raw);
  if (!key || key.length < 2) return;
  themes.add(key);
  if (!labels[key]) labels[key] = toDisplayLabel(raw.trim());
}

export function extractThoughtProfile(
  thread: ThoughtThread,
  context: ThoughtContext | undefined
): ThoughtSemanticProfile {
  const themes = new Set<string>();
  const themeLabels: Record<string, string> = {};
  const tags = new Set<string>();

  for (const theme of context?.recurringThemes ?? []) {
    registerTheme(themes, themeLabels, theme);
  }

  for (const concept of context?.relatedConcepts ?? []) {
    registerTheme(themes, themeLabels, concept.label);
  }

  for (const tag of thread.captured?.semanticTags ?? []) {
    const key = normalizeSemanticKey(tag);
    if (key) {
      tags.add(key);
      registerTheme(themes, themeLabels, tag);
    }
  }

  const textParts = [
    thread.title,
    thread.excerpt,
    context?.summary ?? "",
    thread.captured?.thought ?? "",
    ...(context?.unresolvedContinuations ?? []),
  ];

  const tokens = tokenizeSemanticText(textParts.join(" "));

  for (const token of tokens.slice(0, 6)) {
    if (token.length >= 5) registerTheme(themes, themeLabels, token);
  }

  const continuationRaw = [
    thread.captured?.continuationMarker ?? "",
    ...(context?.unresolvedContinuations ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  const continuationTokens = tokenizeSemanticText(continuationRaw, { maxTokens: 24 });

  const emotionalTone: EmotionalTone | null =
    thread.captured?.emotionalTone ?? null;

  const isUnresolved =
    thread.status === "unresolved" || Boolean(thread.captured?.markUnresolved);

  return {
    threadId: thread.id,
    themes: [...themes].sort((a, b) => a.localeCompare(b)),
    tags: [...tags].sort((a, b) => a.localeCompare(b)),
    tokens,
    continuationTokens,
    emotionalTone,
    isUnresolved,
    status: thread.status,
    themeLabels,
  };
}

export function extractProfilesForThreads(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>
): Map<string, ThoughtSemanticProfile> {
  const map = new Map<string, ThoughtSemanticProfile>();
  for (const thread of threads) {
    map.set(
      thread.id,
      extractThoughtProfile(thread, contextByThreadId[thread.id])
    );
  }
  return map;
}

/** Themes shared across the workspace — strengthens recurring conceptual language. */
export function computeRecurringConceptWeights(
  profiles: Iterable<ThoughtSemanticProfile>
): Map<string, number> {
  const counts = new Map<string, number>();

  for (const profile of profiles) {
    for (const theme of profile.themes) {
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }

  const weights = new Map<string, number>();
  for (const [theme, count] of counts) {
    if (count >= 2) {
      weights.set(theme, 1 + Math.min(count - 1, 3) * 0.35);
    }
  }
  return weights;
}
