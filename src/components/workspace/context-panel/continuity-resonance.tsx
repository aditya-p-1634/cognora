"use client";

import { motion } from "framer-motion";
import { contextItemReveal, contextSectionReveal } from "@/lib/motion/context-transitions";

interface ContinuityResonanceProps {
  sharedResonance: string[];
  continuityEchoes: string[];
  baseDelay?: number;
}

export function ContinuityResonance({
  sharedResonance,
  continuityEchoes,
  baseDelay = 0,
}: ContinuityResonanceProps) {
  const hasThemes = sharedResonance.length > 0;
  const hasEchoes = continuityEchoes.length > 0;

  if (!hasThemes && !hasEchoes) return null;

  return (
    <motion.section {...contextSectionReveal(baseDelay)} className="space-y-4">
      <h3 className="type-label">Continuity resonance</h3>

      {hasThemes && (
        <ul className="flex flex-wrap gap-2" role="list" aria-label="Shared resonance">
          {sharedResonance.map((theme, i) => (
            <motion.li
              key={theme}
              {...contextItemReveal(i, baseDelay + 0.02)}
              className="rounded-[var(--radius-md)] border border-border-subtle/40 bg-bg-overlay/30 px-2.5 py-1 text-[var(--text-xs)] text-text-tertiary"
            >
              {theme}
            </motion.li>
          ))}
        </ul>
      )}

      {hasEchoes && (
        <ul className="space-y-2" role="list" aria-label="Semantic overlap">
          {continuityEchoes.map((echo, i) => (
            <motion.li
              key={echo}
              {...contextItemReveal(i, baseDelay + 0.06)}
              className="continuity-drift flex items-center gap-2"
              style={{ animationDelay: `${i * 0.8}s` }}
            >
              <span className="h-px w-3 bg-gradient-to-r from-accent-calm/50 to-transparent" />
              <span className="text-[var(--text-xs)] leading-relaxed text-text-muted/90">
                {echo}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}
