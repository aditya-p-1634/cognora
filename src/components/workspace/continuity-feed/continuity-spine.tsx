"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";

interface ContinuitySpineProps {
  hasThreadSelection: boolean;
  selectedThreadId: string | null;
}

export function ContinuitySpine({
  hasThreadSelection,
  selectedThreadId,
}: ContinuitySpineProps) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-[7px] w-px" aria-hidden>
      <motion.div
        className={cn(
          "absolute inset-0 w-px continuity-spine",
          hasThreadSelection && "continuity-spine-emphasis"
        )}
        animate={{
          opacity: hasThreadSelection ? 1 : 0.68,
        }}
        transition={{ duration: design.motion.spatial, ease: design.motion.calm }}
      />

      {hasThreadSelection && (
        <motion.div
          key={`spine-wave-${selectedThreadId}`}
          className="absolute inset-x-0 top-0 h-full w-px continuity-spine-propagation"
          initial={{ opacity: 0.55, scaleY: 0.12 }}
          animate={{ opacity: 0, scaleY: 1 }}
          transition={{
            duration: design.motion.spatial * 1.4,
            ease: design.motion.calm,
          }}
          style={{ transformOrigin: "top center" }}
        />
      )}

      <motion.div
        className="absolute inset-x-[-2px] top-2 bottom-16 w-[5px] continuity-spine-aura"
        animate={{
          opacity: hasThreadSelection ? [0.35, 0.55, 0.35] : 0.2,
        }}
        transition={
          hasThreadSelection
            ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: design.motion.spatial, ease: design.motion.calm }
        }
      />
    </div>
  );
}
