"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { captureOverlayMotion } from "@/lib/motion/capture-transitions";

interface CaptureThoughtInputProps {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export function CaptureThoughtInput({
  value,
  onChange,
  autoFocus = true,
}: CaptureThoughtInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => ref.current?.focus(), 160);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  return (
    <motion.div {...captureOverlayMotion.thinking}>
      <label className="type-label mb-3 block text-text-muted">
        Your thought
      </label>
      <div
        className={cn(
          "capture-thinking-surface rounded-[var(--radius-xl)]",
          "ring-1 ring-border-subtle/80",
          "transition-[background,box-shadow] duration-[var(--duration-normal)]"
        )}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Let it settle here, before it slips away…"
          rows={3}
          className={cn(
            "capture-thinking-field w-full resize-none bg-transparent",
            "min-h-[clamp(4.75rem,14dvh,8.5rem)] max-h-[clamp(6.5rem,22dvh,10.5rem)] overflow-y-auto",
            "px-5 py-4 sm:px-6 sm:py-5",
            "text-[clamp(1.125rem,2.2vw,1.4375rem)] font-medium",
            "leading-[1.62] tracking-[var(--tracking-tight)]",
            "text-text-primary",
            "overscroll-contain"
          )}
          aria-label="Thought to preserve"
        />
      </div>
    </motion.div>
  );
}
