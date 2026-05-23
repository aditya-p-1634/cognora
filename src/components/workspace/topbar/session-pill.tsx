"use client";

import { motion } from "framer-motion";
import type { ActiveSession } from "@/types/workspace";

export function SessionPill({ session }: { session: ActiveSession }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-raised/50 px-3.5 py-2 shadow-soft">
      <span className="relative flex h-2.5 w-2.5">
        <motion.span
          className="absolute inline-flex h-full w-full rounded-full bg-continuity-pulse"
          animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="relative h-2.5 w-2.5 rounded-full bg-accent-calm" />
      </span>
      <div className="min-w-0">
        <p className="text-[var(--text-xs)] text-text-muted">Active session</p>
        <p className="truncate text-[var(--text-sm)] font-medium text-text-secondary">
          {session.label}
        </p>
      </div>
      <span className="shrink-0 font-mono text-[10px] text-text-muted">{session.startedAt}</span>
    </div>
  );
}
