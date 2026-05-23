import { mockThreads } from "@/data/mock/workspace";
import type { ThoughtThread } from "@/types/workspace";

/** Merges user-captured threads with mock fixtures; captured ids override mock. */
export function mergeFeedThreads(capturedThreads: ThoughtThread[]): ThoughtThread[] {
  const capturedIds = new Set(capturedThreads.map((t) => t.id));
  const base = mockThreads.filter((t) => !capturedIds.has(t.id));
  return [...capturedThreads, ...base];
}
