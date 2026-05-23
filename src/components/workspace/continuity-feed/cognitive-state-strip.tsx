"use client";

import { motion } from "framer-motion";
import { design } from "@/config/design";
import { useContinuitySession } from "@/providers/workspace-provider";

export function CognitiveStateStrip() {
  const { continuitySession } = useContinuitySession();
  const continuity = continuitySession.continuityDepth;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: design.motion.normal, ease: design.motion.enter, delay: 0.04 }}
      className="relative mb-9 border-b border-border-subtle/50 pb-8"
    >
      <motion.div
        className="absolute bottom-0 left-0 h-px w-2/3 max-w-md bg-gradient-to-r from-accent-primary/60 via-accent-calm/40 to-transparent"
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: design.motion.spatial, ease: design.motion.enter, delay: 0.15 }}
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <motion.span
              className="relative flex h-2 w-2"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-continuity-pulse semantic-shimmer" />
              <span className="relative h-2 w-2 rounded-full bg-accent-calm" />
            </motion.span>
            <p className="type-label">Session restored</p>
          </div>
          <p className="text-[var(--text-xl)] font-semibold tracking-[var(--tracking-tight)] text-text-primary">
            {continuitySession.label}
          </p>
          <p className="text-[var(--text-sm)] text-text-tertiary">
            {continuitySession.threadCount} threads in flow · {continuitySession.startedAt}
          </p>
        </div>

        <div className="shrink-0 sm:w-44">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[var(--text-xs)] text-text-muted">Continuity depth</span>
            <span className="font-mono text-[var(--text-sm)] tabular-nums text-text-secondary">
              {continuity}%
            </span>
          </div>
          <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-bg-overlay/80">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-calm/70 via-accent-primary/80 to-accent-primary/40"
              initial={{ width: 0 }}
              animate={{ width: `${continuity}%` }}
              transition={{ duration: design.motion.spatial, ease: design.motion.enter, delay: 0.25 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
