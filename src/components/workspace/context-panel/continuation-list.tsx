"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { contextItemReveal } from "@/lib/motion/context-transitions";

interface ContinuationListProps {
  items: string[];
  baseDelay?: number;
}

export function ContinuationList({ items, baseDelay = 0 }: ContinuationListProps) {
  return (
    <ul className="space-y-2" role="list">
      {items.map((item, i) => (
        <motion.li key={item} {...contextItemReveal(i, baseDelay)}>
          <button
            type="button"
            className="group flex w-full items-start gap-2 rounded-[var(--radius-lg)] py-2 text-left transition-colors hover:bg-white/[0.03]"
          >
            <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-text-muted transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5 group-hover:text-accent-warm/90" />
            <span className="text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-text-tertiary transition-colors duration-[var(--duration-fast)] group-hover:text-text-secondary">
              {item}
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
