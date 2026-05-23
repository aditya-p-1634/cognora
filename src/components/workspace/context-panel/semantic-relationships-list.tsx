"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { contextItemReveal } from "@/lib/motion/context-transitions";
import type { SemanticRelationship } from "@/types/workspace";

const kindLabels: Record<SemanticRelationship["kind"], string> = {
  extends: "extends",
  relates: "relates",
  continues: "continues",
  contrasts: "contrasts",
  informs: "informs",
};

interface SemanticRelationshipsListProps {
  relationships: SemanticRelationship[];
  baseDelay?: number;
}

export function SemanticRelationshipsList({
  relationships,
  baseDelay = 0,
}: SemanticRelationshipsListProps) {
  return (
    <ul className="space-y-2" role="list">
      {relationships.map((edge, i) => (
        <motion.li
          key={edge.id}
          {...contextItemReveal(i, baseDelay)}
        >
          <div
            className={cn(
              "rounded-[var(--radius-lg)] border border-border-subtle/60",
              "bg-bg-overlay/30 px-3 py-2.5 transition-colors duration-[var(--duration-fast)]",
              "hover:border-border-default/80 hover:bg-bg-overlay/45"
            )}
          >
            <motion.div
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.26 }}
            >
              <span className="text-[var(--text-sm)] text-text-secondary">
                {edge.source}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent-primary/80">
                <ArrowRight className="h-3 w-3 shrink-0 opacity-60" aria-hidden />
                {kindLabels[edge.kind]}
              </span>
              <span className="text-[var(--text-sm)] text-text-primary/90">
                {edge.target}
              </span>
            </motion.div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
