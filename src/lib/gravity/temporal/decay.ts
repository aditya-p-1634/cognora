const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;

/** Slow temporal decay — reinforced thoughts resist fading. */
export function computeTemporalDecay(
  lastReinforcedAt: string,
  now: number,
  options?: {
    selectionCount?: number;
    isUnresolved?: boolean;
  }
): number {
  const reinforced = new Date(lastReinforcedAt).getTime();
  if (Number.isNaN(reinforced)) return 0.85;

  const ageDays = Math.max(0, (now - reinforced) / MS_PER_DAY);
  const ageHours = Math.max(0, (now - reinforced) / MS_PER_HOUR);

  let decay = 1 - ageDays * 0.035;
  if (ageHours < 6) decay += 0.04;

  const selectionBonus = Math.min(0.12, (options?.selectionCount ?? 0) * 0.025);
  const unresolvedHold = options?.isUnresolved ? 0.08 : 0;

  return Math.min(1, Math.max(0.52, decay + selectionBonus + unresolvedHold));
}

export function capturedAgeDays(capturedAt: string | undefined, now: number): number {
  if (!capturedAt) return 0;
  const ts = new Date(capturedAt).getTime();
  if (Number.isNaN(ts)) return 0;
  return Math.max(0, (now - ts) / MS_PER_DAY);
}

/** Recent capture boost — does not dominate older reinforced thoughts. */
export function recencyFactor(capturedAt: string | undefined, now: number): number {
  const days = capturedAgeDays(capturedAt, now);
  if (days < 0.5) return 0.06;
  if (days < 3) return 0.03;
  return 0;
}
