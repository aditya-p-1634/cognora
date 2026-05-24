"use client";

import { motion } from "framer-motion";
import { design } from "@/config/design";
import { useContinuityIntelligence } from "@/providers/workspace-provider";
import { ContextLatentGraph } from "./context-latent-graph";

import { contextPanelContent } from "@/lib/motion/context-transitions";

export function ContextEmpty() {
  const { latentEchoes, latentGraph } = useContinuityIntelligence();

  return (
    <motion.div
      {...contextPanelContent}
      className="absolute inset-x-0 top-0 flex min-h-[320px] flex-col px-2 py-6"
    >
      <div className="pointer-events-none absolute inset-0 context-atmosphere opacity-60" aria-hidden />

      <div className="relative mb-6 text-center">
        <motion.p
          className="type-label semantic-shimmer text-accent-primary/60"
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: design.motion.calm }}
        >
          Latent context
        </motion.p>
        <p className="mt-3 text-[var(--text-sm)] font-medium text-text-tertiary">
          Intelligently waiting
        </p>
        <p className="mx-auto mt-2 max-w-[15rem] text-[var(--text-xs)] leading-relaxed text-text-muted">
          Relationships and continuations surface when you connect to a thread.
        </p>
      </div>

      <ContextLatentGraph graph={latentGraph} />

      <ul className="relative mt-8 space-y-2" role="list" aria-label="Semantic echoes">
        {latentEchoes.map((hint, i) => (
          <motion.li
            key={`${hint}-${i}`}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.4 + i * 0.12,
              duration: design.motion.normal,
              ease: design.motion.enter,
            }}
            className="continuity-drift flex items-center gap-2"
            style={{ animationDelay: `${i * 1.2}s` }}
          >
            <span className="h-px w-3 bg-gradient-to-r from-accent-primary/50 to-transparent" />
            <span className="text-[var(--text-xs)] text-text-muted/90">{hint}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
