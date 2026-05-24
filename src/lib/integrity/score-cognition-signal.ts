import { specificThemeCount, isGenericTheme } from "@/lib/integrity/generic-language";
import type { CognitionSignalProfile } from "@/lib/integrity/types";
import type { ThreadContinuitySignals } from "@/types/gravity";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import type { ThoughtSemanticProfile } from "@/lib/relationships/types";

const SIGNAL_FLOOR = 0.28;
const SIGNAL_CEILING = 1;

function textMass(thread: ThoughtThread, context: ThoughtContext | undefined): number {
  const parts = [
    thread.title,
    thread.excerpt,
    context?.summary ?? "",
    thread.captured?.thought ?? "",
  ];
  return parts.join(" ").trim().length;
}

export function scoreCognitionSignal(input: {
  thread: ThoughtThread;
  context: ThoughtContext | undefined;
  profile: ThoughtSemanticProfile;
  recurringParticipation?: number;
  signals?: ThreadContinuitySignals;
}): CognitionSignalProfile {
  const { thread, context, profile } = input;
  let signal = 0.32;

  const specificThemes = specificThemeCount(profile.themes);
  const themeCount = profile.themes.length;
  const tagCount = profile.tags.length;
  const conceptCount = context?.relatedConcepts.length ?? 0;
  const continuationCount = context?.unresolvedContinuations.length ?? 0;
  const mass = textMass(thread, context);

  signal += Math.min(0.22, specificThemes * 0.06);
  signal += Math.min(0.1, tagCount * 0.04);
  signal += Math.min(0.12, conceptCount * 0.03);
  signal += Math.min(0.08, (input.recurringParticipation ?? 0) * 0.04);

  if (profile.isUnresolved && continuationCount > 0) {
    signal += 0.1;
  }

  if (mass >= 120) signal += 0.08;
  else if (mass >= 60) signal += 0.04;
  else if (mass < 28) signal -= 0.12;

  if (themeCount > 0 && specificThemes === 0) signal -= 0.14;
  if (themeCount === 0 && tagCount === 0) signal -= 0.1;

  const genericOnly =
    profile.tokens.length > 0 &&
    profile.tokens.every((t) => isGenericTheme(t));
  if (genericOnly) signal -= 0.1;

  if (thread.captured && tagCount === 0 && specificThemes === 0) {
    signal -= 0.06;
  }

  const selectionReinforcement = Math.min(
    0.08,
    (input.signals?.selectionCount ?? 0) * 0.02
  );
  signal += selectionReinforcement;

  const clamped =
    Math.round(
      Math.min(SIGNAL_CEILING, Math.max(SIGNAL_FLOOR, signal)) * 1000
    ) / 1000;

  return {
    threadId: thread.id,
    signal: clamped,
    isLowSignal: clamped < 0.42,
  };
}

export function scoreAllCognitionSignals(
  threads: ThoughtThread[],
  contextByThreadId: Record<string, ThoughtContext>,
  profiles: Map<string, ThoughtSemanticProfile>,
  recurring: Map<string, number>,
  ledger?: Record<string, ThreadContinuitySignals>
): Map<string, CognitionSignalProfile> {
  const map = new Map<string, CognitionSignalProfile>();

  for (const thread of threads) {
    const profile = profiles.get(thread.id);
    if (!profile) continue;

    let recurringParticipation = 0;
    for (const theme of profile.themes) {
      recurringParticipation += recurring.get(theme) ?? 0;
    }

    map.set(
      thread.id,
      scoreCognitionSignal({
        thread,
        context: contextByThreadId[thread.id],
        profile,
        recurringParticipation,
        signals: ledger?.[thread.id],
      })
    );
  }

  return map;
}
