"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { contextItemReveal } from "@/lib/motion/context-transitions";
import type { RelatedConcept } from "@/types/workspace";

const affinityStyles: Record<RelatedConcept["affinity"], string> = {
  strong: "bg-accent-primary shadow-[0_0_6px_var(--color-continuity-pulse)]",
  moderate: "bg-accent-primary/70",
  latent: "bg-accent-primary/35",
};

interface RelatedConceptsListProps {
  concepts: RelatedConcept[];
  baseDelay?: number;
}

export function RelatedConceptsList({
  concepts,
  baseDelay = 0,
}: RelatedConceptsListProps) {
  return (
    <ul className="space-y-1" role="list">
      {concepts.map((concept, i) => (
        <motion.li
          key={concept.id}
          {...contextItemReveal(i, baseDelay)}
        >
          <button
            type="button"
            className={cn(
              "group flex w-full items-center gap-3 rounded-[var(--radius-lg)]",
              "px-3 py-2.5 text-left transition-colors duration-[var(--duration-fast)]",
              "hover:bg-white/[0.03]"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-[var(--duration-fast)]",
                affinityStyles[concept.affinity],
                "group-hover:scale-110"
              )}
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-[var(--text-sm)] text-text-secondary transition-colors group-hover:text-text-primary">
              {concept.label}
            </span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-text-muted/70">
              {concept.affinity}
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
