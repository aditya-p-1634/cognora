import { mockLatentHints } from "@/data/mock/workspace";
import {
  analyzeThemeClusters,
  collectLatentEchoes,
} from "@/lib/intelligence/analyze-themes";
import { deriveContinuitySuggestions } from "@/lib/intelligence/derive-suggestions";
import { deriveLatentGraph } from "@/lib/intelligence/derive-latent-graph";
import type {
  ContinuityIntelligence,
  ContinuityIntelligenceInput,
} from "@/lib/intelligence/types";

export function computeContinuityIntelligence(
  input: ContinuityIntelligenceInput
): ContinuityIntelligence {
  const {
    threads,
    contextByThreadId,
    selectedThreadId,
    sessionStartedAt,
    capturedCount,
    gravityWeights,
    resurfacingOrder,
  } = input;

  const themeClusters = analyzeThemeClusters(threads, contextByThreadId);

  const suggestions = deriveContinuitySuggestions({
    threads,
    themeClusters,
    selectedThreadId,
    sessionStartedAt,
    capturedCount,
    gravityWeights,
    resurfacingOrder,
  });

  const echoes = collectLatentEchoes(threads, contextByThreadId, 5, gravityWeights);
  const latentEchoes =
    echoes.length > 0 ? echoes : [...mockLatentHints];

  const latentGraph = deriveLatentGraph(contextByThreadId);

  return {
    suggestions,
    latentEchoes,
    latentGraph,
  };
}
