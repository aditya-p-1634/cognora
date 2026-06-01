/**
 * Influence Engine Phase 1.
 *
 * Computes a gravity-weighted inbound connection field across all thoughts.
 * "A thought is influential when many other thoughts connect to it."
 *
 * This is a field property, not a user-facing score. The InfluenceField is
 * available to any system that needs to understand cognitive centrality —
 * resurfacing, whisper generation, topology — without any UI commitment.
 *
 * Algorithm:
 *   For each thought T, influence(T) = Σ gravity(Ci) × normScore(T, Ci)
 *   for each Ci where score(T, Ci) ≥ MIN_CONNECTION_THRESHOLD.
 *   Normalized by workspace size. Bands derived from field percentiles.
 */
 
import {
  extractProfilesForThreads,
  computeRecurringConceptWeights,
} from "@/lib/relationships/semantic/extract-profile";
import { scoreRelationshipPair } from "@/lib/relationships/scoring/score-pair";
import { RELATIONSHIP_THRESHOLDS } from "@/lib/relationships/scoring/constants";
import type {
  InfluenceBand,
  InfluenceEntry,
  InfluenceField,
  SemanticRelationKind,
} from "@/lib/relationships/types";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
 
/** Minimum score for a relationship to contribute to influence. */
const MIN_CONNECTION_THRESHOLD = RELATIONSHIP_THRESHOLDS.minDisplayScore;
 
/**
 * Minimum number of thoughts with above-threshold connections before
 * the field-anchor band is assigned. Prevents a single well-connected
 * thought in a sparse workspace from being called a "field anchor".
 */
const MIN_POPULATION_FOR_ANCHOR = 3;
 
/** Percentile boundaries for band assignment (descending score order). */
const BAND_PERCENTILES = {
  fieldAnchor: 0.15,  // top 15%
  strong:      0.35,  // 15–35%
  moderate:    0.65,  // 35–65%
  // peripheral: bottom 35% and score = 0
} as const;
 
export interface InfluenceFieldInput {
  threads: ThoughtThread[];
  contextByThreadId: Record<string, ThoughtContext>;
  /** Post-integrity effective gravity weights from memoryGravity.weights. */
  gravityWeights: Map<string, number>;
}
 
export function computeInfluenceField(
  input: InfluenceFieldInput
): InfluenceField {
  const { threads, contextByThreadId, gravityWeights } = input;
 
  if (threads.length < 2) {
    return { byThreadId: new Map(), ranked: [], fieldAnchorIds: [] };
  }
 
  const profiles = extractProfilesForThreads(threads, contextByThreadId);
  const recurringWeights = computeRecurringConceptWeights(profiles.values());
 
  // The maximum possible raw score across all pairs — used for normalization.
  // Computed lazily on first meaningful pair to avoid dividing by zero.
  let scoreMax = 0;
 
  // ── Pass 1: score all pairs once, accumulate inbound signals ─────────────
  //
  // For each ordered pair (A, B) where A ≠ B, compute score(A, B).
  // This score contributes to B's influence (B is the candidate receiving
  // attention from A) weighted by A's effective gravity.
  //
  // We score (A, B) and (B, A) as the same undirected score — scoreRelationshipPair
  // is symmetric in practice (both directions produce the same totalScore because
  // kind lookup checks both directions). We call it once per unordered pair and
  // apply the result to both directions.
 
  // Accumulator: threadId → { weightedSum, count, kindCounts }
  const accumulator = new Map<
    string,
    { weightedSum: number; count: number; kindCounts: Map<SemanticRelationKind, number> }
  >();
 
  for (const thread of threads) {
    accumulator.set(thread.id, {
      weightedSum: 0,
      count: 0,
      kindCounts: new Map(),
    });
  }
 
  const threadList = [...threads];
 
  for (let i = 0; i < threadList.length; i++) {
    for (let j = i + 1; j < threadList.length; j++) {
      const a = threadList[i]!;
      const b = threadList[j]!;
 
      const focusProfile = profiles.get(a.id);
      const candidateProfile = profiles.get(b.id);
      if (!focusProfile || !candidateProfile) continue;
 
      const { totalScore, dominantKind } = scoreRelationshipPair(
        focusProfile,
        candidateProfile,
        { recurringWeights }
      );
 
      if (totalScore < MIN_CONNECTION_THRESHOLD) continue;
 
      if (totalScore > scoreMax) scoreMax = totalScore;
 
      const gravityA = gravityWeights.get(a.id) ?? 0;
      const gravityB = gravityWeights.get(b.id) ?? 0;
 
      // B receives influence from A (weighted by A's gravity)
      const accB = accumulator.get(b.id)!;
      accB.weightedSum += gravityA * totalScore;
      accB.count += 1;
      if (dominantKind) {
        accB.kindCounts.set(dominantKind, (accB.kindCounts.get(dominantKind) ?? 0) + 1);
      }
 
      // A receives influence from B (weighted by B's gravity)
      const accA = accumulator.get(a.id)!;
      accA.weightedSum += gravityB * totalScore;
      accA.count += 1;
      if (dominantKind) {
        accA.kindCounts.set(dominantKind, (accA.kindCounts.get(dominantKind) ?? 0) + 1);
      }
    }
  }
 
  // ── Pass 2: normalize scores ──────────────────────────────────────────────
  //
  // Raw weighted sum is divided by (threads.length × scoreMax) so that
  // influence scores remain comparable regardless of workspace size.
  // A workspace with 4 thoughts and one with 40 produce values in the same range.
 
  const normDivisor = threads.length * Math.max(scoreMax, 1);
 
  const rawEntries: Array<{
    threadId: string;
    score: number;
    inboundCount: number;
    dominantKindReceived: SemanticRelationKind | null;
  }> = [];
 
  for (const thread of threads) {
    const acc = accumulator.get(thread.id);
    if (!acc) continue;
 
    const score = acc.weightedSum / normDivisor;
    const inboundCount = acc.count;
 
    // Most frequent inbound kind — the kind this thought most often receives
    let dominantKindReceived: SemanticRelationKind | null = null;
    let maxKindCount = 0;
    for (const [kind, count] of acc.kindCounts) {
      if (count > maxKindCount) {
        maxKindCount = count;
        dominantKindReceived = kind;
      }
    }
 
    rawEntries.push({ threadId: thread.id, score, inboundCount, dominantKindReceived });
  }
 
  // Sort descending by score, stable by threadId
  rawEntries.sort(
    (a, b) => b.score - a.score || a.threadId.localeCompare(b.threadId)
  );
 
  // ── Pass 3: derive bands from field percentiles ───────────────────────────
  //
  // Bands are derived from position within the distribution, not fixed thresholds.
  // This ensures bands fill meaningfully regardless of workspace size.
  //
  // Guard: if fewer than MIN_POPULATION_FOR_ANCHOR thoughts have any inbound
  // connections, suppress field-anchor — a sparse workspace has no anchors yet.
 
  const connectedCount = rawEntries.filter((e) => e.inboundCount > 0).length;
  const anchorEnabled = connectedCount >= MIN_POPULATION_FOR_ANCHOR;
  const total = rawEntries.length;
 
  function deriveBand(index: number, score: number): InfluenceBand {
    if (score === 0) return "peripheral";
 
    const percentile = index / total;
 
    if (anchorEnabled && percentile < BAND_PERCENTILES.fieldAnchor) {
      return "field-anchor";
    }
    if (percentile < BAND_PERCENTILES.strong) {
      return "strong";
    }
    if (percentile < BAND_PERCENTILES.moderate) {
      return "moderate";
    }
    return "peripheral";
  }
 
  // ── Assemble output ───────────────────────────────────────────────────────
 
  const byThreadId = new Map<string, InfluenceEntry>();
  const ranked: InfluenceEntry[] = [];
  const fieldAnchorIds: string[] = [];
 
  rawEntries.forEach((raw, index) => {
    const band = deriveBand(index, raw.score);
    const entry: InfluenceEntry = {
      threadId: raw.threadId,
      score: Math.round(raw.score * 10000) / 10000,
      band,
      inboundCount: raw.inboundCount,
      dominantKindReceived: raw.dominantKindReceived,
    };
 
    byThreadId.set(raw.threadId, entry);
    ranked.push(entry);
    if (band === "field-anchor") fieldAnchorIds.push(raw.threadId);
  });
 
  return { byThreadId, ranked, fieldAnchorIds };
}