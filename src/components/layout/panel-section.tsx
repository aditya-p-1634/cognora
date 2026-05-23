import { cn } from "@/lib/cn";

export function PanelSection({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      {label && (
        <h3 className="text-[var(--text-xs)] font-medium uppercase tracking-widest text-text-muted">
          {label}
        </h3>
      )}
      {children}
    </section>
  );
}
