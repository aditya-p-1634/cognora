import type { CognitionSignalProfile } from "@/lib/integrity/types";

/** Blend raw gravity with cognition signal — low-signal thoughts stay latent. */
export function modulateGravityWeight(
  rawWeight: number,
  signal: CognitionSignalProfile
): number {
  const pull = 0.36 + 0.64 * signal.signal;
  let effective = rawWeight * pull;

  if (rawWeight >= 0.45 && signal.isLowSignal) {
    effective = Math.min(effective, rawWeight * 0.58);
  }

  return Math.round(Math.min(1, Math.max(0.06, effective)) * 1000) / 1000;
}

export function modulateGravityField(
  rawWeights: Map<string, number>,
  signals: Map<string, CognitionSignalProfile>
): Map<string, number> {
  const effective = new Map<string, number>();

  for (const [threadId, raw] of rawWeights) {
    const profile = signals.get(threadId);
    effective.set(
      threadId,
      profile ? modulateGravityWeight(raw, profile) : raw * 0.5
    );
  }

  return effective;
}
