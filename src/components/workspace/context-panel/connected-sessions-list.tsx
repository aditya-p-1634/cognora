"use client";

import { motion } from "framer-motion";
import { contextItemReveal } from "@/lib/motion/context-transitions";
import type { ConnectedSession } from "@/types/workspace";

interface ConnectedSessionsListProps {
  sessions: ConnectedSession[];
  baseDelay?: number;
}

export function ConnectedSessionsList({
  sessions,
  baseDelay = 0,
}: ConnectedSessionsListProps) {
  return (
    <ul className="space-y-2" role="list">
      {sessions.map((session, i) => (
        <motion.li
          key={session.id}
          {...contextItemReveal(i, baseDelay)}
        >
          <button
            type="button"
            className="group flex w-full items-start justify-between gap-3 rounded-[var(--radius-lg)] border border-border-subtle/50 bg-bg-overlay/25 px-3 py-2.5 text-left transition-colors duration-[var(--duration-fast)] hover:border-border-default/70 hover:bg-bg-overlay/40"
          >
            <motion.span
              className="relative mt-1.5 flex h-2 w-2 shrink-0"
              aria-hidden
              initial={false}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent-calm/80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-calm" />
            </motion.span>
            <span className="min-w-0 flex-1">
              <span className="block text-[var(--text-sm)] text-text-secondary transition-colors group-hover:text-text-primary">
                {session.label}
              </span>
              <span className="mt-0.5 block font-mono text-[10px] text-text-muted">
                {session.threadCount} threads · {session.relativeTime}
              </span>
            </span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
