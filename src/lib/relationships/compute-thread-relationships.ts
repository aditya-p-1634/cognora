import { buildRelationshipField } from "@/lib/relationships/detect-related-thoughts";
import type {
  RelationshipEngineInput,
  ThreadRelationshipSnapshot,
} from "@/lib/relationships/types";

/** Primary entry — computes contextual relationships for the selected thought. */
export function computeThreadRelationships(
  input: RelationshipEngineInput,
  gravityWeights?: Map<string, number>
): ThreadRelationshipSnapshot | null {
  const { focusThreadId, threads, contextByThreadId } = input;

  const field = buildRelationshipField(
    focusThreadId,
    threads,
    contextByThreadId,
    gravityWeights
  );
  if (!field) return null;

  return {
    focusThreadId,
    relatedThoughts: field.relatedThoughts,
    sharedResonance: field.sharedResonance,
    continuityEchoes: field.continuityEchoes,
  };
}
