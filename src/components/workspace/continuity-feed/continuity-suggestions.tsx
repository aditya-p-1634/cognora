"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { design } from "@/config/design";
import type { ContinuitySuggestion } from "@/types/workspace";

export function ContinuitySuggestions({
  suggestions,
}: {
  suggestions: ContinuitySuggestion[];
}) {
  return (
    <section className="relative pt-4">
      <div
        className="pointer-events-none absolute -inset-x-4 inset-y-0 whispers-ambient opacity-80"
        aria-hidden
      />

      <div className="relative mb-5 flex items-center gap-2.5 pl-1">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-accent-warm/80 shadow-[0_0_10px_var(--color-whisper-glow)]"
          aria-hidden
          animate={{ opacity: [0.55, 0.95, 0.55] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <h2 className="type-label text-text-muted/95">Continuity whispers</h2>
      </div>

      <ul className="relative space-y-5" role="list">
        {suggestions.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.12 + i * 0.1,
              duration: design.motion.normal + 0.04,
              ease: design.motion.enter,
            }}
            className="group relative pl-7"
          >
            <span
              className="absolute left-0 top-[0.85rem] h-px w-5 whisper-line"
              aria-hidden
            />
            <motion.span
              className="absolute left-0 top-2 h-1 w-1 rounded-full bg-accent-warm/50"
              aria-hidden
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{
                duration: 5 + i * 0.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            />
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <p className="whisper-message max-w-prose text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-text-tertiary/95 transition-colors duration-[var(--duration-normal)] group-hover:text-text-secondary">
                {s.message}
              </p>
              {s.actionLabel && (
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-1 py-0.5 text-[var(--text-xs)] font-medium text-accent-warm/85 transition-all duration-[var(--duration-fast)] group-hover:text-accent-warm"
                >
                  {s.actionLabel}
                  <ArrowRight className="h-3 w-3 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
