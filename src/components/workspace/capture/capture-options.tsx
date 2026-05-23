"use client";

import type { ReactNode } from "react";
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

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="type-label text-text-muted">{children}</p>;
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
    <motion.div className="space-y-7" {...captureOverlayMotion.whisper}>
      <div className="space-y-2.5">
        <SectionLabel>Continuation</SectionLabel>
        <input
          type="text"
          value={draft.continuationMarker}
          onChange={(e) => onUpdate({ continuationMarker: e.target.value })}
          placeholder="A thread, session, or line of thought this extends…"
          className={cn(
            "capture-whisper-field w-full bg-transparent py-2.5",
            "text-[var(--text-sm)] leading-relaxed text-text-secondary",
            "placeholder:text-text-muted"
          )}
          aria-label="Continuation marker"
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Semantic echoes</SectionLabel>
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
                  className="rounded-full bg-accent-primary-muted/25 px-2.5 py-0.5 text-[11px] text-accent-primary/80 transition-colors duration-[var(--duration-fast)] hover:bg-accent-primary-muted/40"
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
            "placeholder:text-text-muted"
          )}
          aria-label="Semantic echo"
        />
      </div>

      <div className="space-y-3">
        <SectionLabel>Emotional tone</SectionLabel>
        <div
          className="capture-tone-field flex flex-wrap gap-x-3 gap-y-2"
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
                  "capture-tone-option rounded-full px-2.5 py-1 text-[11px] text-text-tertiary",
                  selected && "bg-accent-calm-muted/35"
                )}
                aria-pressed={selected}
              >
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 py-0.5">
        <input
          type="checkbox"
          checked={draft.markUnresolved}
          onChange={(e) => onUpdate({ markUnresolved: e.target.checked })}
          className="sr-only"
        />
        <span
          className={cn(
            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border transition-all duration-[var(--duration-normal)]",
            draft.markUnresolved
              ? "border-accent-warm/40 bg-accent-warm-muted/45"
              : "border-border-default/80 bg-bg-overlay/30"
          )}
          aria-hidden
        >
          {draft.markUnresolved && (
            <span className="h-1.5 w-1.5 rounded-full bg-accent-warm/75" />
          )}
        </span>
        <span className="text-[var(--text-xs)] text-text-muted">
          Leave gently unfinished
        </span>
      </label>
    </motion.div>
  );
}
