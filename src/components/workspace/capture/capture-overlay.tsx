"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { captureOverlayMotion } from "@/lib/motion/capture-transitions";
import { useCapture } from "@/providers/workspace-provider";
import { CaptureThoughtInput } from "./capture-thought-input";
import { CaptureOptions } from "./capture-options";

/** Viewport-safe max height — tuned for 1366×768 at 100% zoom. */
const CAPTURE_PANEL_MAX_HEIGHT = "min(90dvh, calc(100dvh - 1.5rem))";

export function CaptureOverlay() {
  const {
    isCaptureOpen,
    captureDraft,
    closeCapture,
    updateCaptureDraft,
    preserveThought,
  } = useCapture();

  const [tagInput, setTagInput] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag) return;
    if (captureDraft.semanticTags.includes(tag)) {
      setTagInput("");
      return;
    }
    updateCaptureDraft({
      semanticTags: [...captureDraft.semanticTags, tag],
    });
    setTagInput("");
  }, [tagInput, captureDraft.semanticTags, updateCaptureDraft]);

  const removeTag = useCallback(
    (tag: string) => {
      updateCaptureDraft({
        semanticTags: captureDraft.semanticTags.filter((t) => t !== tag),
      });
    },
    [captureDraft.semanticTags, updateCaptureDraft]
  );

  useEffect(() => {
    if (!isCaptureOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeCapture();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        preserveThought();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isCaptureOpen, closeCapture, preserveThought]);

  useEffect(() => {
    if (!isCaptureOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isCaptureOpen]);

  useEffect(() => {
    if (!isCaptureOpen) {
      setTagInput("");
      setOptionsOpen(false);
    }
  }, [isCaptureOpen]);

  const canPreserve = captureDraft.thought.trim().length > 0;
  const hasOptionalHints =
    captureDraft.continuationMarker.trim().length > 0 ||
    captureDraft.semanticTags.length > 0 ||
    captureDraft.emotionalTone !== null ||
    captureDraft.markUnresolved;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isCaptureOpen && (
        <motion.div
          className={cn(
            "fixed inset-0 flex items-center justify-center",
            "px-4 py-4 sm:px-6",
            "pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          )}
          style={{ zIndex: design.zIndex.captureOverlay }}
          role="presentation"
          {...captureOverlayMotion.shell}
        >
          <motion.button
            type="button"
            aria-label="Dismiss capture"
            className="capture-overlay-backdrop absolute inset-0"
            onClick={closeCapture}
            {...captureOverlayMotion.backdrop}
          />
          <div
            className="capture-overlay-backdrop-deep pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="capture-fog-edge pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div
            className="capture-fog-lift pointer-events-none absolute inset-0"
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="capture-heading"
            className={cn(
              "capture-focus-region relative z-[1] flex w-full max-w-[40rem] min-h-0 flex-col",
              "rounded-[var(--radius-2xl)] overflow-hidden"
            )}
            style={{ maxHeight: CAPTURE_PANEL_MAX_HEIGHT }}
            onClick={(e) => e.stopPropagation()}
            {...captureOverlayMotion.focus}
          >
            <div
              className={cn(
                "capture-scroll-region min-h-0 flex-1 overflow-y-auto overscroll-contain",
                "px-6 py-6 sm:px-8 sm:py-7"
              )}
            >
              <motion.header
                className="mb-6 sm:mb-7"
                {...captureOverlayMotion.header}
              >
                <p className="type-label text-accent-primary/75">
                  Cognitive capture
                </p>
                <h2
                  id="capture-heading"
                  className="mt-2 text-balance text-[var(--text-xl)] font-medium tracking-[var(--tracking-tight)] text-text-primary"
                >
                  Preserve before it fades
                </h2>
                <p className="mt-2 max-w-md type-prose text-text-tertiary">
                  The workspace remains beneath — this is a quiet space to hold a
                  thought before it slips away.
                </p>
              </motion.header>

              <CaptureThoughtInput
                value={captureDraft.thought}
                onChange={(thought) => updateCaptureDraft({ thought })}
              />

              <div
                className={cn(
                  "capture-optional-region mt-6 rounded-[var(--radius-xl)]",
                  "ring-1 ring-border-subtle/70"
                )}
              >
                <button
                  type="button"
                  onClick={() => setOptionsOpen((o) => !o)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4",
                    "transition-colors duration-[var(--duration-fast)]",
                    "hover:bg-white/[0.02]"
                  )}
                  aria-expanded={optionsOpen}
                >
                  <div>
                    <p className="type-label">Optional threads</p>
                    <p className="mt-1.5 text-[var(--text-xs)] leading-relaxed text-text-muted">
                      {optionsOpen
                        ? "Continuation, echoes, tone — none required"
                        : "Continuation · semantic echoes · tone · open loop"}
                    </p>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-text-muted transition-transform duration-[var(--duration-normal)]",
                      optionsOpen && "rotate-180"
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {optionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: {
                          height: {
                            duration: design.motion.spatial,
                            ease: design.motion.calm,
                          },
                          opacity: {
                            duration: design.motion.normal,
                            ease: design.motion.calm,
                          },
                        },
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                        transition: {
                          height: {
                            duration: design.motion.normal,
                            ease: design.motion.calm,
                          },
                          opacity: {
                            duration: design.motion.fast,
                            ease: design.motion.calm,
                          },
                        },
                      }}
                      className="overflow-hidden border-t border-border-subtle/60"
                    >
                      <div className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                        <CaptureOptions
                          draft={captureDraft}
                          onUpdate={updateCaptureDraft}
                          tagInput={tagInput}
                          onTagInputChange={setTagInput}
                          onAddTag={addTag}
                          onRemoveTag={removeTag}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!optionsOpen && hasOptionalHints && (
                  <p className="border-t border-border-subtle/50 px-5 py-2.5 text-[10px] text-accent-calm/80">
                    Optional details added
                  </p>
                )}
              </div>
            </div>

            <motion.footer
              className={cn(
                "capture-footer-anchor shrink-0",
                "border-t border-border-subtle/60",
                "px-6 py-4 sm:px-8 sm:py-5"
              )}
              {...captureOverlayMotion.actions}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] text-text-muted">
                  <kbd className="font-mono">Esc</kbd> to return ·{" "}
                  <kbd className="font-mono">⌘↵</kbd> to preserve
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={closeCapture}
                    className="rounded-[var(--radius-lg)] px-4 py-2 text-[var(--text-sm)] text-text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-white/[0.04] hover:text-text-primary"
                  >
                    Release
                  </button>
                  <button
                    type="button"
                    onClick={preserveThought}
                    disabled={!canPreserve}
                    className={cn(
                      "rounded-[var(--radius-lg)] px-5 py-2 text-[var(--text-sm)] font-medium transition-all duration-[var(--duration-normal)]",
                      canPreserve
                        ? "border border-accent-primary/30 bg-accent-primary-muted/45 text-accent-primary hover:border-accent-primary/45 hover:bg-accent-primary-muted/65"
                        : "cursor-not-allowed border border-border-subtle/60 bg-bg-overlay/30 text-text-muted"
                    )}
                  >
                    Preserve thought
                  </button>
                </div>
              </div>
            </motion.footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
