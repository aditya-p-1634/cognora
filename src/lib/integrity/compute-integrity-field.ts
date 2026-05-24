import { modulateGravityField } from "@/lib/integrity/modulate-gravity";
import { refineResurfacingOrder } from "@/lib/integrity/refine-resurfacing";
import { scoreAllCognitionSignals } from "@/lib/integrity/score-cognition-signal";
import type { IntegrityFieldInput, SemanticIntegrityField } from "@/lib/integrity/types";
import {
  computeRecurringConceptWeights,
  extractProfilesForThreads,
} from "@/lib/relationships/semantic/extract-profile";

/** Primary entry — semantic integrity field for the workspace. */
export function computeSemanticIntegrityField(
  input: IntegrityFieldInput
): SemanticIntegrityField {
  const { threads, contextByThreadId, gravityField, ledger } = input;

  const profiles =
    input.profiles ??
    extractProfilesForThreads(threads, contextByThreadId);
  const recurring =
    input.recurringWeights ??
    computeRecurringConceptWeights(profiles.values());

  const signalMap = scoreAllCognitionSignals(
    threads,
    contextByThreadId,
    profiles,
    recurring,
    ledger
  );

  const effectiveGravity = modulateGravityField(gravityField.weights, signalMap);

  const resurfacingOrder = refineResurfacingOrder(
    threads,
    effectiveGravity,
    signalMap
  );

  return {
    signals: signalMap,
    effectiveGravity,
    resurfacingOrder,
  };
}
