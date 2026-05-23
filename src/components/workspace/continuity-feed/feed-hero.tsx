"use client";

import { motion } from "framer-motion";
import { design } from "@/config/design";

export function FeedHero() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: design.motion.normal, ease: design.motion.enter }}
      className="mb-8"
    >
      <motion.p
        className="type-label mb-3"
        animate={{ opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: design.motion.calm }}
      >
        Cognitive continuity
      </motion.p>
      <h1 className="type-display text-balance text-text-primary">
        Resuming your saved state
      </h1>
      <motion.p
        className="mt-4 max-w-xl text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-text-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.12, duration: design.motion.normal }}
      >
        Context flows forward from your last session — threads reconnect, momentum
        returns without forcing a fresh start.
      </motion.p>
    </motion.header>
  );
}
