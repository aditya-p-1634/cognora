"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";

type PanelVariant = "default" | "glass" | "inset";

const variantClasses: Record<PanelVariant, string> = {
  default: "panel-surface border border-border-subtle",
  glass: "glass-surface border border-border-subtle",
  inset: "bg-bg-raised/60 border border-border-subtle",
};

export interface PanelProps extends HTMLMotionProps<"div"> {
  variant?: PanelVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-[var(--spacing-panel)]",
  lg: "p-[var(--spacing-section)]",
};

export function Panel({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: PanelProps) {
  return (
    <motion.div
      initial={false}
      transition={{ duration: design.motion.normal, ease: design.motion.calm }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
