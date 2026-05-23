import { cn } from "@/lib/cn";
import { ThreadStatusLabel } from "../continuity-feed/thread-status-label";
import type { ThoughtThread } from "@/types/workspace";

export function ContextThreadHeader({
  thread,
  summary,
}: {
  thread: ThoughtThread;
  summary: string;
}) {
  return (
    <header className="space-y-4">
      <ThreadStatusLabel status={thread.status} />
      <h2 className="text-[var(--text-xl)] font-medium leading-[var(--leading-snug)] tracking-[var(--tracking-tight)] text-text-primary">
        {thread.title}
      </h2>
      <p className="type-prose text-text-secondary">{summary}</p>
      {thread.projectLabel && (
        <p
          className={cn(
            "inline-flex rounded-[var(--radius-md)] border border-border-subtle",
            "bg-bg-overlay/50 px-2.5 py-1 text-[var(--text-xs)] text-text-tertiary"
          )}
        >
          {thread.projectLabel}
        </p>
      )}
    </header>
  );
}
