"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { ScrollRegion } from "@/components/layout/scroll-region";
import { IconButton } from "@/components/ui/icon-button";
import { useThreadSelection } from "@/providers/workspace-provider";
import { contextHeaderTransition } from "@/lib/motion/context-transitions";
import { ContextActiveView } from "./context-active-view";
import { ContextEmpty } from "./context-empty";

interface ContextPanelProps {
  isDesktop: boolean;
  panelHeight?: string;
}

export function ContextPanel({ isDesktop, panelHeight }: ContextPanelProps) {
  const {
    selectedThread,
    context,
    selectThread,
    hasThreadSelection,
    isContextAwakening,
  } = useThreadSelection();

  const isOpen = Boolean(selectedThread && context);
  const isLatent = !isOpen;

  const panelContent = (
    <div className="relative min-h-[200px]">
      <AnimatePresence mode="sync" initial={false}>
        {selectedThread && context ? (
          <ContextActiveView
            key={context.threadId}
            thread={selectedThread}
            context={context}
          />
        ) : (
          <ContextEmpty key="latent" />
        )}
      </AnimatePresence>
    </div>
  );

  const panelChrome = (
    <>
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-[var(--duration-spatial)]",
          isLatent ? "context-atmosphere opacity-50" : "context-atmosphere opacity-25",
          isContextAwakening && "opacity-70"
        )}
        aria-hidden
        animate={
          isContextAwakening
            ? { opacity: [0.35, 0.55, 0.35] }
            : { opacity: isLatent ? 0.5 : 0.25 }
        }
        transition={{
          duration: isContextAwakening ? 2.8 : design.motion.normal,
          ease: design.motion.calm,
        }}
      />
      <div className="relative border-b border-border-subtle/50 px-5 py-4">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={isLatent ? "latent-header" : context?.threadId ?? "active-header"}
            {...contextHeaderTransition}
          >
            <p className="type-label">
              {isLatent ? "Latent intelligence" : "Active context"}
            </p>
            <p className="mt-1 text-[var(--text-xs)] text-text-muted">
              {isLatent
                ? "Semantic depth awaits connection"
                : hasThreadSelection
                  ? "Context awakening around selected thought"
                  : "Thread-linked relationships"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <ScrollRegion className="relative min-h-0 flex-1 px-5 py-6">
        {panelContent}
      </ScrollRegion>
    </>
  );

  if (!isDesktop) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close context"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: design.motion.normal }}
              className="fixed inset-0 bg-black/45 backdrop-blur-[1px] lg:hidden"
              style={{ zIndex: design.zIndex.backdrop }}
              onClick={() => selectThread(null)}
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0.92 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.92 }}
              transition={{ duration: design.motion.spatial, ease: design.motion.enter }}
              className={cn(
                "fixed inset-y-0 right-0 top-[var(--height-topbar)] flex w-full max-w-md flex-col",
                "border-l border-border-subtle glass-surface shadow-elevated lg:hidden"
              )}
              style={{ zIndex: design.zIndex.contextMobile }}
            >
              <div className="relative flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <p className="type-label">Context</p>
                <IconButton aria-label="Close panel" onClick={() => selectThread(null)}>
                  <X className="h-4 w-4" />
                </IconButton>
              </div>
              <ScrollRegion className="relative flex-1 px-5 py-6">{panelContent}</ScrollRegion>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <motion.aside
      layout
      className={cn(
        "sticky top-[var(--height-topbar)] hidden shrink-0 flex flex-col overflow-hidden border-l border-border-subtle/60 lg:flex",
        "w-[min(24rem,30vw)] bg-bg-raised/10",
        hasThreadSelection && "context-panel-active"
      )}
      style={
        panelHeight
          ? { height: panelHeight, maxHeight: panelHeight }
          : undefined
      }
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b to-transparent",
          hasThreadSelection
            ? "from-accent-primary/45 via-accent-calm/25"
            : "from-accent-primary/25"
        )}
        aria-hidden
        animate={{ opacity: hasThreadSelection ? 1 : 0.55 }}
        transition={{ duration: design.motion.spatial, ease: design.motion.calm }}
      />
      {panelChrome}
    </motion.aside>
  );
}
