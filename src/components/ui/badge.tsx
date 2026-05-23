import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[var(--text-xs)] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-bg-overlay text-text-tertiary",
        accent: "bg-accent-primary-muted text-accent-primary",
        warm: "bg-accent-warm-muted text-accent-warm",
        calm: "bg-accent-calm-muted text-accent-calm",
        focus: "bg-accent-primary-muted text-accent-primary ring-1 ring-accent-primary/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
