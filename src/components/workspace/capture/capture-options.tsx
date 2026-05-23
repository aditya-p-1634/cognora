"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { captureOverlayMotion } from "@/lib/motion/capture-transitions";
import {
  EMOTIONAL_TONE_OPTIONS,
  type CaptureDraft,
  type EmotionalTone,
} from "@/types/capture";

interface CaptureOptionsProps {
  draft: CaptureDraft;
  onUpdate: (patch: Partial<CaptureDraft>) => void;
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export function CaptureOptions({
  draft,
  onUpdate,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: CaptureOptionsProps) {
  return (
    <motion.div
      className="space-y-7 pt-1"
      {...captureOverlayMotion.whisper}
    >
      <div className="space-y-2.5">
        <p className="type-label">Continuation</p>
        <input
          type="text"
          value={draft.continuationMarker}
          onChange={(e) => onUpdate({ continuationMarker: e.target.value })}
          placeholder="Thread, session, or line of thought this extends…"
          className={cn(
            "capture-whisper-field w-full bg-transparent py-2.5",
            "text-[var(--text-sm)] leading-relaxed text-text-secondary",
            "placeholder:text-text-muted",
            "transition-[border-color] duration-[var(--duration-normal)]"
          )}
          aria-label="Continuation marker"
        />
      </div>

      <div className="cognitive-divider opacity-60" aria-hidden />

      <div className="space-y-3">
        <p className="type-label">Semantic echoes</p>
        <AnimatePresence mode="popLayout">
          {draft.semanticTags.length > 0 && (
            <motion.div
              layout
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {draft.semanticTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="rounded-full border border-border-subtle/70 bg-accent-primary-muted/30 px-2.5 py-0.5 text-[11px] text-accent-primary/85 transition-colors duration-[var(--duration-fast)] hover:bg-accent-primary-muted/50"
                  aria-label={`Remove echo ${tag}`}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTag();
            }
          }}
          onBlur={onAddTag}
          placeholder="Add a concept echo — press Enter"
          className={cn(
            "capture-whisper-field w-full bg-transparent py-2.5",
            "text-[var(--text-sm)] text-text-secondary",
            "placeholder:text-text-muted",
            "transition-[border-color] duration-[var(--duration-normal)]"
          )}
          aria-label="Semantic echo"
        />
      </div>

      <div className="cognitive-divider opacity-60" aria-hidden />

      <div className="space-y-3">
        <p className="type-label">Emotional tone</p>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Emotional tone"
        >
          {EMOTIONAL_TONE_OPTIONS.map((tone) => {
            const selected = draft.emotionalTone === tone.id;
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() =>
                  onUpdate({
                    emotionalTone: selected ? null : (tone.id as EmotionalTone),
                  })
                }
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] transition-all duration-[var(--duration-normal)]",
                  selected
                    ? "bg-accent-calm-muted text-accent-calm ring-1 ring-accent-calm/20"
                    : "text-text-tertiary ring-1 ring-transparent hover:bg-white/[0.03] hover:text-text-secondary"
                )}
                aria-pressed={selected}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="cognitive-divider opacity-60" aria-hidden />

      <label className="flex cursor-pointer items-start gap-3 py-0.5">
        <input
          type="checkbox"
          checked={draft.markUnresolved}
          onChange={(e) => onUpdate({ markUnresolved: e.target.checked })}
          className="sr-only"
        />
        <span
          className={cn(
            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border transition-all duration-[var(--duration-normal)]",
            draft.markUnresolved
              ? "border-accent-warm/40 bg-accent-warm-muted/50"
              : "border-border-default bg-bg-overlay/40"
          )}
          aria-hidden
        >
          {draft.markUnresolved && (
            <span className="h-1.5 w-1.5 rounded-sm bg-accent-warm/80" />
          )}
        </span>
        <span>
          <span className="type-label block normal-case tracking-normal text-text-tertiary">
            Open loop
          </span>
          <span className="mt-1 block text-[var(--text-xs)] leading-relaxed text-text-muted">
            Leave gently unfinished in continuity
          </span>
        </span>
      </label>
    </motion.div>
  );
}
