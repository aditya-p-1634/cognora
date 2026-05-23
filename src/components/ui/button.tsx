import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-all duration-[var(--duration-fast)] ease-[var(--ease-calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:
          "bg-bg-overlay text-text-primary hover:bg-bg-panel border border-border-subtle shadow-soft",
        ghost:
          "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
        subtle:
          "bg-accent-primary-muted text-accent-primary hover:bg-accent-primary/20",
        capture:
          "bg-accent-primary/85 text-bg-base hover:bg-accent-primary border border-accent-primary/20 shadow-soft",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3 text-[var(--text-sm)]",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
