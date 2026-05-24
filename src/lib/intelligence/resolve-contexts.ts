import { getContextForThread } from "@/data/mock/workspace";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";

/** Merges persisted capture contexts with mock fixtures for intelligence analysis. */
export function resolveIntelligenceContexts(
  threads: ThoughtThread[],
  captureContextMap: Record<string, ThoughtContext>
): Record<string, ThoughtContext> {
  const map: Record<string, ThoughtContext> = { ...captureContextMap };

  for (const thread of threads) {
    if (map[thread.id]) continue;
    const context = getContextForThread(thread.id);
    if (context) map[thread.id] = context;
  }

  return map;
}
