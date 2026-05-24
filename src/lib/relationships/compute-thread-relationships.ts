import { buildRelationshipField } from "@/lib/relationships/detect-related-thoughts";
import type { CognitionSignalProfile } from "@/lib/integrity/types";
import type {
  RelationshipEngineInput,
  ThreadRelationshipSnapshot,
} from "@/lib/relationships/types";

export function computeThreadRelationships(
  input: RelationshipEngineInput,
  options?: {
    gravityWeights?: Map<string, number>;
    cognitionSignals?: Map<string, CognitionSignalProfile>;
  }
): ThreadRelationshipSnapshot | null {
  const { focusThreadId, threads, contextByThreadId } = input;

  const field = buildRelationshipField(
    focusThreadId,
    threads,
    contextByThreadId,
    options
  );
  if (!field) return null;

  return {
    focusThreadId,
    relatedThoughts: field.relatedThoughts,
    sharedResonance: field.sharedResonance,
    continuityEchoes: field.continuityEchoes,
  };
}
