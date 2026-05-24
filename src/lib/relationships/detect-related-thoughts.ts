import {
  affinityFromScore,
  deriveContinuityEcho,
  deriveResonanceHint,
} from "@/lib/relationships/derive-resonance-hint";
import {
  computeRecurringConceptWeights,
  extractProfilesForThreads,
} from "@/lib/relationships/semantic/extract-profile";
import { toDisplayLabel } from "@/lib/relationships/semantic/normalize";
import { scoreRelationshipPair } from "@/lib/relationships/scoring/score-pair";
import { RELATIONSHIP_THRESHOLDS } from "@/lib/relationships/scoring/constants";
import { computeLatentContinuityWeights } from "@/lib/relationships/latent-continuity";
import type {
  RelatedThought,
  ScoredThreadRelationship,
  ThoughtSemanticProfile,
} from "@/lib/relationships/types";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

export function scoreAllRelationships(
  focus: ThoughtSemanticProfile,
  profiles: Map<string, ThoughtSemanticProfile>,
  options?: {
    recurringWeights?: Map<string, number>;
    latentWeights?: Map<string, number>;
    gravityWeights?: Map<string, number>;
  }
): ScoredThreadRelationship[] {
  const scored: ScoredThreadRelationship[] = [];

  for (const [threadId, candidate] of profiles) {
    if (threadId === focus.threadId) continue;

    const { totalScore, components, sharedThemes, sharedTokens } =
      scoreRelationshipPair(focus, candidate, {
        recurringWeights: options?.recurringWeights,
        latentWeight: options?.latentWeights?.get(threadId),
        gravityWeight: options?.gravityWeights?.get(threadId),
      });

    if (totalScore < RELATIONSHIP_THRESHOLDS.minDisplayScore) continue;

    scored.push({
      threadId,
      totalScore,
      components,
      sharedThemes,
      sharedTokens,
    });
  }

  return scored.sort(
    (a, b) =>
      b.totalScore - a.totalScore ||
      a.threadId.localeCompare(b.threadId)
  );
}

export function detectRelatedThoughts(
  focus: ThoughtSemanticProfile,
  threads: ThoughtThread[],
  profiles: Map<string, ThoughtSemanticProfile>,
  scored: ScoredThreadRelationship[]
): RelatedThought[] {
  const threadById = new Map(threads.map((t) => [t.id, t]));
  const limit = RELATIONSHIP_THRESHOLDS.maxRelatedThoughts;

  return scored.slice(0, limit).flatMap((entry) => {
    const thread = threadById.get(entry.threadId);
    const candidate = profiles.get(entry.threadId);
    if (!thread || !candidate) return [];

    const resonanceHint = deriveResonanceHint(
      entry.components,
      entry.sharedThemes,
      focus.themeLabels,
      candidate.isUnresolved,
      candidate.emotionalTone
    );

    return [
      {
        threadId: thread.id,
        title: thread.title,
        excerpt: thread.excerpt,
        status: thread.status,
        affinity: affinityFromScore(entry.totalScore),
        resonanceHint,
      },
    ];
  });
}

export function buildRelationshipField(
  focusThreadId: string,
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>,
  gravityWeights?: Map<string, number>
) {
  const profiles = extractProfilesForThreads(threads, contextByThreadId);
  const focus = profiles.get(focusThreadId);
  if (!focus) return null;

  const recurringWeights = computeRecurringConceptWeights(profiles.values());
  const latentWeights = computeLatentContinuityWeights(threads, contextByThreadId);

  const scored = scoreAllRelationships(focus, profiles, {
    recurringWeights,
    latentWeights,
    gravityWeights,
  });

  const relatedThoughts = detectRelatedThoughts(
    focus,
    threads,
    profiles,
    scored
  );

  const sharedResonance = [
    ...new Set(
      scored.flatMap((s) =>
        s.sharedThemes.map((t) => focus.themeLabels[t] ?? toDisplayLabel(t))
      )
    ),
  ].slice(0, RELATIONSHIP_THRESHOLDS.maxSharedResonance);

  const continuityEchoes: string[] = [];
  for (const entry of scored) {
    if (continuityEchoes.length >= RELATIONSHIP_THRESHOLDS.maxContinuityEchoes) break;
    const echo = deriveContinuityEcho(
      focus.themeLabels,
      entry.sharedThemes,
      entry.sharedTokens
    );
    if (echo && !continuityEchoes.includes(echo)) {
      continuityEchoes.push(echo);
    }
  }

  return {
    focus,
    profiles,
    scored,
    relatedThoughts,
    sharedResonance,
    continuityEchoes,
    recurringWeights,
    latentWeights,
  };
}
