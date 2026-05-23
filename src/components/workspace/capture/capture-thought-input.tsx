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
    const timer = window.setTimeout(() => ref.current?.focus(), 200);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  return (
    <motion.div {...captureOverlayMotion.thinking}>
      <label
        htmlFor="capture-thought"
        className="type-label mb-3 block text-text-muted"
      >
        Your thought
      </label>
      <div className="capture-thinking-hold transition-[background,box-shadow] duration-[var(--duration-normal)]">
        <textarea
          id="capture-thought"
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Let it settle here, before it slips away…"
          rows={3}
          className={cn(
            "capture-thinking-field w-full resize-none bg-transparent",
            "min-h-[clamp(5rem,15dvh,9rem)] max-h-[clamp(6.5rem,22dvh,10.5rem)] overflow-y-auto",
            "px-5 py-4 sm:px-6 sm:py-5",
            "text-[clamp(1.1875rem,2.4vw,1.5rem)] font-medium",
            "leading-[1.7] tracking-[var(--tracking-tight)]",
            "text-text-primary",
            "overscroll-contain"
          )}
          aria-label="Thought to preserve"
        />
      </div>
    </motion.div>
  );
}
