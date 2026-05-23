"use client";

import { motion } from "framer-motion";
import { contextItemReveal } from "@/lib/motion/context-transitions";

interface ThemeTagsProps {
  themes: string[];
  baseDelay?: number;
}

export function ThemeTags({ themes, baseDelay = 0 }: ThemeTagsProps) {
  return (
    <motion.div
      className="flex flex-wrap gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: baseDelay, duration: 0.26 }}
    >
      {themes.map((theme, i) => (
        <motion.span
          key={theme}
          {...contextItemReveal(i, baseDelay)}
          className="rounded-full border border-border-subtle/80 bg-accent-primary-muted/40 px-3 py-1 text-[var(--text-xs)] text-accent-primary/90"
        >
          {theme}
        </motion.span>
      ))}
    </motion.div>
  );
}
