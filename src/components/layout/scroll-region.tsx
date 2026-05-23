import { cn } from "@/lib/cn";

export interface ScrollRegionProps {
  children: React.ReactNode;
  className?: string;
  /**
   * When true, region is a bounded flex child with its own vertical scroll.
   * Use for context panel / mobile drawers — not the main continuity feed.
   */
  scrollable?: boolean;
}

export function ScrollRegion({
  children,
  className,
  scrollable = true,
}: ScrollRegionProps) {
  return (
    <div
      className={cn(
        scrollable && [
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
          "[scrollbar-width:thin]",
          "[scrollbar-color:var(--color-border-strong)_transparent]",
        ],
        className
      )}
    >
      {children}
    </div>
  );
}
