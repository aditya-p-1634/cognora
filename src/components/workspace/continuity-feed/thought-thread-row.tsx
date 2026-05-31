"use client";
 
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { captureThreadEmergence } from "@/lib/motion/capture-transitions";
import {
  deriveFloatMotion,
  deriveGravityGlow,
  presenceOpacity,
  presenceDormantOpacity,
  presenceRestOpacity,
  resolveThreadPresence,
  type ThreadSemanticPresence,
} from "@/lib/motion/feed-presence";
import { MomentumIndicator } from "./momentum-indicator";
import { ThreadStatusLabel } from "./thread-status-label";
import type { RelationshipAffinity } from "@/lib/relationships";
import type { ThoughtThread } from "@/types/workspace";
 
interface ThoughtThreadRowProps {
  thread: ThoughtThread;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
  prominence?: "primary" | "default";
  isLast?: boolean;
  isEmerging?: boolean;
  gravityWeight?: number;
  /** Whether this thought is semantically related to the currently selected thought. */
  isRelated?: boolean;
  /** Affinity level from the relationship engine — null when not related. */
  relationAffinity?: RelationshipAffinity | null;
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
 
/** Affinity → CSS class for left-edge ambient lift on the content div. */
const affinityClass: Record<RelationshipAffinity, string> = {
  near: "thread-related-near",
  adjacent: "thread-related-adjacent",
  latent: "thread-related-latent",
};
 
/**
 * Related thoughts dim less than unrelated thoughts when a selection is active.
 *
 * Normal dimmed opacity:  presenceDormantOpacity[underlying] (~0.44–0.58)
 * Related dimmed opacity: midpoint between dormant and rest (~0.68–0.78)
 *
 * This keeps related thoughts perceptibly present in the field while still
 * deferring visually to the selected thought — they are acknowledged, not
 * highlighted.
 */
function relatedOpacity(
  underlying: Exclude<ThreadSemanticPresence, "magnetic" | "dormant">,
  affinity: RelationshipAffinity
): number {
  const dormant = presenceDormantOpacity[underlying];
  const rest = presenceRestOpacity[underlying];
  // near → 92% of the way toward rest; adjacent → 78%; latent → 62%
  const blend = affinity === "near" ? 0.92 : affinity === "adjacent" ? 0.78 : 0.62;
  return dormant + (rest - dormant) * blend;
}
 
export function ThoughtThreadRow({
  thread,
  selected,
  dimmed,
  onSelect,
  prominence = "default",
  isLast = false,
  isEmerging = false,
  gravityWeight = 0,
  isRelated = false,
  relationAffinity = null,
}: ThoughtThreadRowProps) {
  const isPrimary = prominence === "primary";
  const presence = resolveThreadPresence(thread, { selected, dimmed });
  const underlying = underlyingPresence(thread);
 
  // ── Opacity ──────────────────────────────────────────────────────────────
  //
  // Related thoughts override the standard dimmed opacity so they remain
  // more present in the field when another thought is selected. Non-related
  // dimmed thoughts recede normally.
  const targetOpacity =
    dimmed && isRelated && relationAffinity
      ? relatedOpacity(underlying, relationAffinity)
      : presenceOpacity(presence, underlying, gravityWeight);
 
  const gravityLinger = !selected && gravityWeight >= 0.42;
 
  // ── Living field float ───────────────────────────────────────────────────
  const float = deriveFloatMotion(gravityWeight, thread.id);
 
  const floatAnimate =
    isEmerging
      ? captureThreadEmergence.animate
      : selected
      ? { y: 0 }
      : { y: [0, -float.amplitude, 0] as number[] };
 
  const floatTransition =
    isEmerging
      ? captureThreadEmergence.transition
      : selected
      ? { duration: design.motion.spatial, ease: design.motion.calm }
      : {
          duration: float.period,
          repeat: Infinity,
          repeatType: "loop" as const,
          ease: "easeInOut" as const,
          delay: float.delay,
        };
 
  // ── Gravity glow ─────────────────────────────────────────────────────────
  const gravityGlow = !selected ? deriveGravityGlow(gravityWeight, presence) : null;
 
  // ── Resonance pulse ───────────────────────────────────────────────────────
  //
  // When this thought becomes related (isRelated transitions to true), the
  // spine node pulses once — a single slow scale up and back — then settles.
  // This is distinct from the selected node's continuous breathing animation.
  // The pulse acknowledges recognition: the field noticed a connection.
  //
  // Implementation: track the previous isRelated value; when it transitions
  // false → true, trigger a one-shot animate sequence via a key change on
  // the node span. The key forces Framer to re-run the animation from its
  // initial state, giving us the one-shot behavior without imperative control.
  const prevIsRelated = useRef(false);
  const pulseKey = useRef(0);
  if (isRelated && !prevIsRelated.current) {
    pulseKey.current += 1;
  }
  prevIsRelated.current = isRelated;
 
  // Pulse parameters by affinity — near gets a stronger, slightly faster pulse.
  // All are below the selected node pulse (scale 1.14, 2.8s continuous).
  const pulseScale =
    relationAffinity === "near" ? 1.13 : relationAffinity === "adjacent" ? 1.09 : 1.07;
  const pulseDuration =
    relationAffinity === "near" ? 1.4 : relationAffinity === "adjacent" ? 1.7 : 2.0;
 
  return (
    <motion.li
      className={cn("relative", !isLast && "pb-1")}
      {...(isEmerging ? { initial: captureThreadEmergence.initial } : { initial: false })}
      animate={floatAnimate}
      transition={floatTransition}
    >
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
 
        {/*
         * Spine node dot.
         *
         * Three animation states:
         * 1. Selected: continuous breathing pulse (2.8s, scale 1.14) — established behavior.
         * 2. Related (isRelated, not selected): one-shot resonance pulse triggered by
         *    pulseKey change. Pulses once to scale then returns to 1. The key change
         *    restarts the animation from initial without a continuous loop.
         * 3. Default: static at scale 1, dimmed opacity if needed.
         */}
<motion.span
  key="node"
  layoutId={selected ? "continuity-spine-node" : undefined}
  className={cn(
    "absolute left-0 top-[1.35rem] z-10 h-2 w-2 -translate-x-1/2 rounded-full",
    selected
      ? "bg-accent-primary continuity-spine-node-glow ring-[5px] ring-accent-primary/25"
      : isRelated && relationAffinity
        ? cn(
            relationAffinity === "near"
              ? "bg-accent-primary/70 ring-[3px] ring-accent-primary/18"
              : relationAffinity === "adjacent"
              ? "bg-accent-primary/50"
              : "bg-accent-primary/34",
          )
      : presence === "dormant"
        ? "bg-border-default/80"
        : presence === "resurfaced" || gravityLinger
          ? "bg-accent-calm/55"
          : presence === "unresolved"
            ? "bg-accent-warm/45"
            : gravityWeight >= 0.38
              ? "bg-accent-primary/40"
              : "bg-border-strong transition-all duration-[var(--duration-normal)] group-hover:bg-accent-primary/60 group-hover:ring-2 group-hover:ring-accent-primary/10"
  )}
  aria-hidden
  initial={isRelated && !selected ? { scale: 1, opacity: 1 } : false}
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
      : isRelated && !selected
      ? { duration: pulseDuration, ease: design.motion.calm }
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
            // Related ambient lift — applied when dimmed and related, not when selected.
            // The affinity class adds a left-edge luminous inset shadow.
            !selected && isRelated && relationAffinity && affinityClass[relationAffinity],
            !selected &&
              presence === "unresolved" &&
              "thread-semantic-unresolved thread-flow-hover",
            !selected && presence !== "unresolved" && "group-hover:thread-flow-hover",
            !selected && presence === "resurfaced" && "opacity-[0.98]"
          )}
          style={gravityGlow ? { boxShadow: gravityGlow } : undefined}
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
    </motion.li>
  );
}