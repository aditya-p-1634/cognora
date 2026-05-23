"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import {
  presenceOpacity,
  resolveThreadPresence,
  type ThreadSemanticPresence,
} from "@/lib/motion/feed-presence";
import { MomentumIndicator } from "./momentum-indicator";
import { ThreadStatusLabel } from "./thread-status-label";
import type { ThoughtThread } from "@/types/workspace";

interface ThoughtThreadRowProps {
  thread: ThoughtThread;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  prominence?: "primary" | "default";
  isLast?: boolean;
}

function underlyingPresence(
  thread: ThoughtThread
): Exclude<ThreadSemanticPresence, "magnetic" | "dormant"> {
  switch (thread.status) {
    case "focus":
      return "awake";
    case "active":
      return "active";
    case "unresolved":
      return "unresolved";
    case "resurfaced":
      return "resurfaced";
    default:
      return "active";
  }
}

export function ThoughtThreadRow({
  thread,
  selected,
  dimmed,
  onSelect,
  prominence = "default",
  isLast = false,
}: ThoughtThreadRowProps) {
  const isPrimary = prominence === "primary";
  const presence = resolveThreadPresence(thread, { selected, dimmed });
  const underlying = underlyingPresence(thread);
  const targetOpacity = presenceOpacity(presence, underlying);

  return (
    <li className={cn("relative", !isLast && "pb-1")}>
      <motion.button
        type="button"
        onClick={onSelect}
        layout="position"
        initial={false}
        aria-selected={selected}
        aria-current={selected ? "true" : undefined}
        whileHover={selected ? { y: -1 } : { x: 4 }}
        transition={{ duration: design.motion.fast, ease: design.motion.calm }}
        animate={{
          opacity: targetOpacity,
          y: selected ? -2 : 0,
        }}
        className={cn(
          "group relative w-full py-4 pl-6 pr-2 text-left",
          "transition-[opacity,transform] duration-[var(--duration-normal)]",
          isPrimary && "py-5",
          selected && "z-[1] thread-selected"
        )}
      >
        {selected && (
          <motion.span
            layoutId="continuity-spine-halo"
            className="pointer-events-none absolute left-0 top-[1.1rem] z-[0] h-5 w-5 -translate-x-1/2 rounded-full bg-accent-primary/12 blur-md continuity-spine-node-glow"
            aria-hidden
            transition={{ duration: design.motion.spatial, ease: design.motion.calm }}
          />
        )}

        <motion.span
          layoutId={selected ? "continuity-spine-node" : undefined}
          className={cn(
            "absolute left-0 top-[1.35rem] z-10 h-2 w-2 -translate-x-1/2 rounded-full",
            selected
              ? "bg-accent-primary continuity-spine-node-glow ring-[5px] ring-accent-primary/25"
              : presence === "dormant"
                ? "bg-border-default/80"
                : presence === "resurfaced"
                  ? "bg-accent-calm/55"
                  : presence === "unresolved"
                    ? "bg-accent-warm/45"
                    : "bg-border-strong transition-all duration-[var(--duration-normal)] group-hover:bg-accent-primary/60 group-hover:ring-2 group-hover:ring-accent-primary/10"
          )}
          aria-hidden
          animate={
            selected
              ? { scale: [1, 1.14, 1], opacity: [0.92, 1, 0.92] }
              : {
                  scale: presence === "resurfaced" ? 0.92 : 1,
                  opacity: dimmed ? 0.65 : presence === "resurfaced" ? 0.8 : 1,
                }
          }
          transition={
            selected
              ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: design.motion.normal }
          }
        />

        {selected && (
          <motion.span
            layoutId="feed-selection"
            className="absolute inset-y-0 left-0 w-[2px] rounded-full bg-gradient-to-b from-accent-primary via-accent-calm/95 to-transparent"
            transition={{ duration: design.motion.spatial, ease: design.motion.calm }}
          />
        )}

        <motion.div
          className={cn(
            "relative rounded-[var(--radius-lg)] px-4 py-3 transition-[background,box-shadow] duration-[var(--duration-normal)]",
            selected && "thread-active-emphasis feed-selection-glow",
            !selected &&
              presence === "unresolved" &&
              "thread-semantic-unresolved thread-flow-hover",
            !selected && presence !== "unresolved" && "group-hover:thread-flow-hover",
            !selected && presence === "resurfaced" && "opacity-[0.98]"
          )}
          layout
          transition={{ duration: design.motion.normal, ease: design.motion.calm }}
        >
          <div className="flex items-start justify-between gap-5">
            <div
              className={cn(
                "min-w-0 flex-1 space-y-2.5",
                isPrimary && "space-y-3"
              )}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <ThreadStatusLabel status={thread.status} />
                {thread.projectLabel && (
                  <span
                    className={cn(
                      "text-[var(--text-xs)] transition-colors duration-[var(--duration-fast)]",
                      selected ? "text-text-tertiary" : "text-text-muted/90"
                    )}
                  >
                    {thread.projectLabel}
                  </span>
                )}
                {thread.momentum && (
                  <MomentumIndicator momentum={thread.momentum} />
                )}
              </div>

              <h3
                className={cn(
                  "font-medium tracking-[var(--tracking-tight)] transition-colors duration-[var(--duration-normal)]",
                  isPrimary
                    ? "text-[var(--text-xl)] font-semibold leading-[var(--leading-snug)]"
                    : "text-[var(--text-lg)] leading-[var(--leading-tight)]",
                  selected
                    ? "text-text-primary font-semibold"
                    : presence === "awake"
                      ? "text-text-primary/95"
                      : presence === "resurfaced"
                        ? "text-text-secondary/85"
                        : presence === "unresolved"
                          ? "text-text-secondary group-hover:text-text-primary"
                          : "text-text-secondary group-hover:text-text-primary"
                )}
              >
                {thread.title}
              </h3>

              <p
                className={cn(
                  "line-clamp-2 max-w-prose leading-[var(--leading-relaxed)] transition-colors duration-[var(--duration-normal)]",
                  selected
                    ? "text-[var(--text-sm)] text-text-secondary"
                    : presence === "dormant"
                      ? "text-[var(--text-sm)] text-text-muted/90"
                      : presence === "resurfaced"
                        ? "text-[var(--text-sm)] text-text-muted"
                        : isPrimary
                          ? "text-[var(--text-sm)] text-text-tertiary"
                          : "text-[var(--text-sm)] text-text-tertiary/90"
                )}
              >
                {thread.excerpt}
              </p>
            </div>

            <time
              className={cn(
                "shrink-0 pt-0.5 font-mono text-[10px] tabular-nums transition-colors duration-[var(--duration-fast)]",
                selected ? "text-text-tertiary" : "text-text-muted"
              )}
            >
              {thread.lastTouched}
            </time>
          </div>
        </motion.div>
      </motion.button>
    </li>
  );
}
