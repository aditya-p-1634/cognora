"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { contextItemReveal } from "@/lib/motion/context-transitions";
import { ThreadStatusLabel } from "../continuity-feed/thread-status-label";
import type { RelatedThought } from "@/lib/relationships";

const affinityDot: Record<RelatedThought["affinity"], string> = {
  near: "bg-accent-primary/90 shadow-[0_0_6px_var(--color-continuity-pulse)]",
  adjacent: "bg-accent-primary/55",
  latent: "bg-accent-primary/30",
};

interface RelatedCognitionListProps {
  thoughts: RelatedThought[];
  onSelect: (threadId: string) => void;
  baseDelay?: number;
}

export function RelatedCognitionList({
  thoughts,
  onSelect,
  baseDelay = 0,
}: RelatedCognitionListProps) {
  if (thoughts.length === 0) return null;

  return (
    <ul className="space-y-1" role="list" aria-label="Adjacent cognition">
      {thoughts.map((thought, i) => (
        <motion.li key={thought.threadId} {...contextItemReveal(i, baseDelay)}>
          <button
            type="button"
            onClick={() => onSelect(thought.threadId)}
            className={cn(
              "group flex w-full flex-col gap-2 rounded-[var(--radius-lg)]",
              "px-3 py-2.5 text-left transition-colors duration-[var(--duration-fast)]",
              "hover:bg-white/[0.03]"
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-[var(--duration-fast)]",
                  affinityDot[thought.affinity],
                  "group-hover:scale-110"
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-[var(--text-sm)] leading-snug text-text-secondary transition-colors group-hover:text-text-primary">
                  {thought.title}
                </p>
                <p className="text-[var(--text-xs)] leading-relaxed text-text-muted/90">
                  {thought.resonanceHint}
                </p>
              </div>
            </div>
            <div className="pl-6">
              <ThreadStatusLabel status={thought.status} />
            </div>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
