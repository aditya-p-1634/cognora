import { cn } from "@/lib/cn";
import type { ThoughtThreadStatus } from "@/types/workspace";

const config: Record<
  ThoughtThreadStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "text-accent-primary" },
  unresolved: { label: "Unresolved", className: "text-accent-warm" },
  resurfaced: { label: "Resurfaced", className: "text-accent-calm" },
  focus: { label: "In focus", className: "text-accent-primary" },
};

export function ThreadStatusLabel({ status }: { status: ThoughtThreadStatus }) {
  const { label, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[var(--text-xs)] font-medium tracking-wide",
        className
      )}
    >
      <span className={cn("h-1 w-1 rounded-full bg-current opacity-80")} />
      {label}
    </span>
  );
}
