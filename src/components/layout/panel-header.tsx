import { cn } from "@/lib/cn";

export interface PanelHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ title, description, action, className }: PanelHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex items-start justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h2 className="text-[var(--text-lg)] font-medium tracking-[var(--tracking-tight)] text-text-primary">
          {title}
        </h2>
        {description && (
          <p className="text-[var(--text-sm)] leading-relaxed text-text-tertiary">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
