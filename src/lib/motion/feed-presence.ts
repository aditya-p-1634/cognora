import type { ThoughtThread, ThoughtThreadStatus } from "@/types/workspace";
 
/** Cognitive energy state for feed hierarchy — not a UI label. */
export type ThreadSemanticPresence =
  | "magnetic"
  | "dormant"
  | "awake"
  | "active"
  | "unresolved"
  | "resurfaced";
 
export function resolveThreadPresence(
  thread: ThoughtThread,
  options: { selected: boolean; dimmed: boolean }
): ThreadSemanticPresence {
  if (options.selected) return "magnetic";
  if (options.dimmed) return "dormant";
  return statusToPresence(thread.status);
}
 
function statusToPresence(status: ThoughtThreadStatus): ThreadSemanticPresence {
  switch (status) {
    case "focus":
      return "awake";
    case "active":
      return "active";
    case "unresolved":
      return "unresolved";
    case "resurfaced":
      return "resurfaced";
    default:
      return "active";
  }
}
 
/** Resting opacity when nothing is selected. */
export const presenceRestOpacity: Record<
  Exclude<ThreadSemanticPresence, "magnetic" | "dormant">,
  number
> = {
  awake: 0.97,
  active: 0.9,
  unresolved: 0.86,
  resurfaced: 0.74,
};
 
export const presenceDormantOpacity: Record<
  Exclude<ThreadSemanticPresence, "magnetic" | "dormant">,
  number
> = {
  awake: 0.58,
  active: 0.52,
  unresolved: 0.5,
  resurfaced: 0.44,
};
 
export function presenceOpacity(
  presence: ThreadSemanticPresence,
  underlying: Exclude<ThreadSemanticPresence, "magnetic" | "dormant">,
  gravityWeight = 0
): number {
  if (presence === "magnetic") return 1;
  const base =
    presence === "dormant"
      ? presenceDormantOpacity[underlying]
      : presenceRestOpacity[presence];
 
  if (presence === "dormant" || gravityWeight <= 0) return base;
 
  const pull = Math.min(0.05, gravityWeight * 0.07);
  return Math.min(1, base + pull);
}
 
// ─── Living field motion ──────────────────────────────────────────────────────
 
/**
 * Floating motion parameters for a thought in the living field.
 *
 * Amplitude is inversely proportional to gravity: heavy thoughts are cognitively
 * settled — they barely drift. Light thoughts are peripheral and less anchored —
 * slightly more restless.
 *
 * Period is proportional to gravity: heavy thoughts breathe slowly (deeper presence).
 * The 3.5–5.0s range keeps all thoughts in a meditative, breath-like register.
 *
 * Delay is a deterministic phase offset derived from the thread ID so thoughts
 * do not oscillate in synchrony — synchronized motion draws attention to the
 * mechanism rather than the thoughts themselves.
 */
export interface ThreadFloatMotion {
  /** Y-axis amplitude in pixels. Range: 0.8px (heavy) → 2.2px (light). */
  amplitude: number;
  /** Full cycle duration in seconds. Range: 3.5s (light) → 5.0s (heavy). */
  period: number;
  /** Phase offset delay in seconds — prevents synchronized oscillation. */
  delay: number;
}
 
export function deriveFloatMotion(
  gravityWeight: number,
  threadId: string
): ThreadFloatMotion {
  const w = Math.max(0, Math.min(1, gravityWeight));
 
  const amplitude = 2.2 - w * 1.4;       // 0.8–2.2px
  const period    = 3.5 + w * 1.5;       // 3.5–5.0s
 
  // Stable hash of thread ID — deterministic phase stagger across thoughts
  let hash = 0;
  for (let i = 0; i < threadId.length; i++) {
    hash = (hash * 31 + threadId.charCodeAt(i)) & 0xffff;
  }
  const delay = (hash / 0xffff) * period;
 
  return { amplitude, period, delay };
}
 
/**
 * Ambient gravity glow as a CSS box-shadow string.
 *
 * A thought's atmospheric halo reflects its cognitive weight in the field —
 * heavier thoughts exert more ambient presence. Color follows presence type
 * to stay consistent with the existing status color vocabulary.
 *
 * Intentionally calibrated below the selected glow (100px/0.11) and the
 * workspace ambient orbs (80px/0.06) so gravity glow never competes with
 * intentional emphasis or the workspace atmosphere.
 *
 * Returns null below the 0.12 gravity threshold — near-weightless thoughts
 * have no established field presence and should not glow.
 */
export function deriveGravityGlow(
  gravityWeight: number,
  presence: ThreadSemanticPresence
): string | null {
  if (presence === "dormant" || presence === "magnetic") return null;
  if (gravityWeight < 0.12) return null;
 
  // Normalize above threshold
  const intensity = (gravityWeight - 0.12) / 0.88;
 
  const outerSpread = Math.round(12 + intensity * 48);   // 12–60px
  const innerSpread = Math.round(4  + intensity * 20);   // 4–24px
  const outerOpacity = (intensity * 0.07).toFixed(4);    // 0–0.07
  const innerOpacity = (intensity * 0.045).toFixed(4);   // 0–0.045
 
  // Color by cognitive status — matches existing accent semantics
  const [ro, go, bo] =
    presence === "unresolved" ? [201, 176, 138]   // warm
    : presence === "resurfaced" ? [114, 168, 164] // calm
    : [139, 159, 216];                            // primary
 
  return [
    `0 0 ${outerSpread}px rgb(${ro} ${go} ${bo} / ${outerOpacity})`,
    `0 0 ${innerSpread}px rgb(114 168 164 / ${innerOpacity})`,
  ].join(", ");
}