import type { ContinuitySuggestion, ThoughtThread } from "@/types/workspace";
import type { ThemeCluster } from "@/lib/intelligence/types";

const MAX_SUGGESTIONS = 3;

function formatThemeList(themes: string[]): string {
  if (themes.length === 1) return themes[0];
  if (themes.length === 2) return `${themes[0]} and ${themes[1]}`;
  return `${themes[0]}, ${themes[1]}, and others`;
}

function sessionIdleMinutes(sessionStartedAt: string, now = Date.now()): number {
  const started = new Date(sessionStartedAt).getTime();
  if (Number.isNaN(started)) return 0;
  return Math.max(0, Math.floor((now - started) / (60 * 1000)));
}

export function deriveContinuitySuggestions(input: {
  threads: ThoughtThread[];
  themeClusters: ThemeCluster[];
  selectedThreadId: string | null;
  sessionStartedAt: string;
  capturedCount: number;
}): ContinuitySuggestion[] {
  const { threads, themeClusters, selectedThreadId, sessionStartedAt, capturedCount } =
    input;

  const suggestions: ContinuitySuggestion[] = [];

  const unresolved = threads.filter((t) => t.status === "unresolved");
  const resurfaced = threads.filter((t) => t.status === "resurfaced");
  const focus = threads.find((t) => t.status === "focus");

  if (themeClusters.length > 0) {
    const top = themeClusters.slice(0, 2);
    const themes = top.map((c) => c.theme);
    const threadIds = [...new Set(top.flatMap((c) => c.threadIds))];

    suggestions.push({
      id: "intel-shared-themes",
      message: `${threadIds.length} threads share themes around ${formatThemeList(themes)} — context may deepen when connected.`,
      actionLabel: "Review themes",
      action: { type: "select-thread", threadId: threadIds[0] },
    });
  }

  if (unresolved.length > 0) {
    const target = unresolved[0];
    suggestions.push({
      id: "intel-unresolved-loop",
      message:
        unresolved.length === 1
          ? `An open loop is waiting — "${target.title}" may benefit from reconnection.`
          : `${unresolved.length} unresolved threads are holding continuity — one may deserve focus now.`,
      actionLabel: "Reconnect thread",
      action: { type: "select-thread", threadId: target.id },
    });
  }

  if (resurfaced.length > 0 && suggestions.length < MAX_SUGGESTIONS) {
    const target = resurfaced[0];
    suggestions.push({
      id: "intel-resurfaced",
      message: `"${target.title}" resurfaced from prior thinking — momentum may return with a gentle revisit.`,
      actionLabel: "Open thread",
      action: { type: "select-thread", threadId: target.id },
    });
  }

  const idleMinutes = sessionIdleMinutes(sessionStartedAt);
  if (idleMinutes >= 18 && !selectedThreadId && focus && suggestions.length < MAX_SUGGESTIONS) {
    suggestions.push({
      id: "intel-idle-session",
      message: `Your session has been quiet ${idleMinutes}m — "${focus.title}" is still in focus if you want to resume.`,
      actionLabel: "Resume focus",
      action: { type: "select-thread", threadId: focus.id },
    });
  }

  if (
    !selectedThreadId &&
    threads.length > 0 &&
    suggestions.length < MAX_SUGGESTIONS
  ) {
    const anchor = focus ?? threads[0];
    suggestions.push({
      id: "intel-latent-context",
      message:
        "Context is latent — selecting a thread will awaken relationships and continuations in the panel.",
      actionLabel: "Connect context",
      action: { type: "select-thread", threadId: anchor.id },
    });
  }

  if (capturedCount > 0 && suggestions.length < MAX_SUGGESTIONS) {
    suggestions.push({
      id: "intel-captured-memory",
      message:
        capturedCount === 1
          ? "A preserved thought is held in continuity — it will deepen as you connect surrounding threads."
          : `${capturedCount} preserved thoughts are weaving into your continuity field.`,
      actionLabel: capturedCount === 1 ? "View capture" : undefined,
      action:
        capturedCount === 1
          ? {
              type: "select-thread",
              threadId: threads.find((t) => t.id.startsWith("cap-"))?.id ?? threads[0].id,
            }
          : undefined,
    });
  }

  return suggestions.slice(0, MAX_SUGGESTIONS);
}
