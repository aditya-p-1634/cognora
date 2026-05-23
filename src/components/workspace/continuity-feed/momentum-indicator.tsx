import { cn } from "@/lib/cn";

const levels = { high: 3, medium: 2, low: 1 } as const;

export function MomentumIndicator({
  momentum = "medium",
}: {
  momentum?: keyof typeof levels;
}) {
  const active = levels[momentum];

  return (
    <div
      className="flex items-end gap-[3px]"
      title={`Momentum: ${momentum}`}
      aria-label={`Momentum ${momentum}`}
    >
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-colors",
            i === 1 && "h-2",
            i === 2 && "h-2.5",
            i === 3 && "h-3",
            i <= active ? "bg-accent-primary/70" : "bg-border-strong/60"
          )}
        />
      ))}
    </div>
  );
}
