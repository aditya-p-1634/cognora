import { cn } from "@/lib/cn";

export function FeedSection({
  label,
  count,
  subdued,
  children,
}: {
  label: string;
  count?: number;
  subdued?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative transition-opacity duration-[var(--duration-spatial)]",
        subdued && "opacity-[0.78]"
      )}
    >
      <div className="mb-4 flex items-baseline gap-3 pl-1">
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            subdued ? "bg-text-muted/50" : "bg-accent-primary/80 shadow-[0_0_8px_var(--color-continuity-pulse)]"
          )}
          aria-hidden
        />
        <h2
          className={cn(
            "type-label",
            subdued ? "text-text-muted/80" : "text-text-muted"
          )}
        >
          {label}
        </h2>
        {count !== undefined && (
          <span className="ml-auto font-mono text-[10px] tabular-nums text-text-muted/70">
            {count}
          </span>
        )}
      </div>
      <ul className="flex flex-col" role="list">
        {children}
      </ul>
    </section>
  );
}
