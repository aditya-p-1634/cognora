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
