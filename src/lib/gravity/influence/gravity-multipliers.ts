/** Ambient influence multiplier for relationships and latent continuity. */
export function gravityInfluenceMultiplier(weight: number): number {
  return weight * 0.2;
}

export function combineInfluenceMultipliers(
  latentWeight: number,
  gravityWeight: number
): number {
  return 1 + latentWeight + gravityInfluenceMultiplier(gravityWeight);
}
