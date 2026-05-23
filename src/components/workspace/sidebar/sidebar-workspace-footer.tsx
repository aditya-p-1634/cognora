"use client";

import { motion } from "framer-motion";

export function SidebarWorkspaceFooter({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="relative border-t border-border-subtle/60 px-2 py-4 flex flex-col items-center gap-2">
        <motion.span
          className="h-2 w-2 rounded-full bg-accent-calm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          title="Continuity active"
        />
        <span className="h-6 w-px continuity-spine opacity-40" aria-hidden />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative border-t border-border-subtle/60 px-4 py-4"
    >
      <p className="type-label mb-1.5">Presence</p>
      <p className="text-[var(--text-sm)] font-medium text-text-secondary">
        Continuity held
      </p>
      <p className="mt-1 text-[var(--text-xs)] leading-relaxed text-text-muted">
        Session persists across navigation
      </p>
    </motion.div>
  );
}
