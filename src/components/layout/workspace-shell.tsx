"use client";
 
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { useSidebar } from "@/hooks/use-sidebar";
import { WorkspaceSidebar } from "@/components/workspace/sidebar/workspace-sidebar";
import { WorkspaceTopbar } from "@/components/workspace/topbar/workspace-topbar";
import { ContinuityFeed } from "@/components/workspace/continuity-feed/continuity-feed";
import { ContextPanel } from "@/components/workspace/context-panel/context-panel";
import { CaptureOverlay } from "@/components/workspace/capture";
import { useCapture, useThreadSelection } from "@/providers/workspace-provider";
 
/** Below topbar — used for sticky side panels with independent scroll. */
const workspacePanelHeight = "calc(100dvh - var(--height-topbar))";
 
export function WorkspaceShell() {
  const sidebar = useSidebar();
  const { isCaptureOpen } = useCapture();
  const { hasThreadSelection } = useThreadSelection();
 
  return (
    <div className="workspace-ambient relative flex min-h-dvh w-full flex-col">
      <div
        className={cn(
          "pointer-events-none fixed inset-0 z-[20] transition-opacity duration-[var(--duration-linger)] ease-[var(--ease-calm)]",
          isCaptureOpen ? "opacity-100" : "opacity-0"
        )}
        aria-hidden={true}
      >
        <div className="absolute inset-0 bg-bg-base/16" />
      </div>
 
      {/* ── Ambient field layer ─────────────────────────────────────────────
          Three stacked orbs at different depths and scales.
          All are pointer-events-none, GPU-composited (transform + opacity only),
          and never overlap interactive content in z-order.
 
          Orb 1 — accent, upper field.
          Represents the primary cognitive zone. Drifts slowly with a 17s/21s
          period on y/x to prevent periodic sync. Brightens subtly when a
          thread is selected — the cognitive field grows slightly more present
          when something is anchored.
 
          Orb 2 — calm, right field.
          Represents the contextual/relational zone. Drifts independently at
          13s/18s — enough separation from orb 1 that they never align.
          Moves in the opposite quadrant (positive y, negative x) for organic
          asymmetry.
 
          Orb 3 — deep field floor (new).
          Very large, very faint, anchored at the bottom. Does not move — it
          is the floor of the cognitive space, not the weather above it.
          Uses --color-ambient-field (4% opacity) so it is subperceptual at
          rest but adds depth when orbs 1 and 2 drift away from center.
      ────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden={true}>
        {/* Orb 1 — accent, upper cognitive field */}
        <motion.div
          className="absolute left-[20%] top-0 h-[480px] w-[min(720px,70vw)] -translate-x-1/4 rounded-full bg-accent-primary-muted blur-[100px]"
          initial={{ opacity: 0.5 }}
          animate={{
            y: [0, -8, 0],
            x: [0, 4, 0],
            opacity: hasThreadSelection ? 0.62 : 0.5,
          }}
          transition={{
            y: {
              duration: 17,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            },
            x: {
              duration: 21,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            },
            opacity: {
              duration: design.motion.spatial * 2.2,
              ease: design.motion.calm,
            },
          }}
        />
 
        {/* Orb 2 — calm, right relational field */}
        <motion.div
          className="absolute right-[10%] top-1/3 h-[320px] w-[400px] rounded-full bg-accent-calm-muted blur-[90px] opacity-40"
          animate={{
            y: [0, 6, 0],
            x: [0, -5, 0],
          }}
          transition={{
            y: {
              duration: 13,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            },
            x: {
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "loop",
            },
          }}
        />
 
        {/* Orb 3 — deep cognitive field floor */}
        <div
          className="absolute bottom-0 left-1/2 h-[500px] w-[min(900px,100vw)] -translate-x-1/2 rounded-full blur-[140px]"
          style={{ background: "var(--color-ambient-field)" }}
        />
      </div>
 
      <WorkspaceTopbar
        onMenuToggle={sidebar.toggle}
        showMenuButton={!sidebar.isDesktop}
      />
 
      <div className="relative flex w-full flex-1 items-start">
        <AnimatePresence>
          {sidebar.mobileOpen && !sidebar.isDesktop && (
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: design.motion.fast }}
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] lg:hidden"
              style={{ zIndex: design.zIndex.backdrop }}
              onClick={sidebar.closeMobile}
            />
          )}
        </AnimatePresence>
 
        <WorkspaceSidebar
          collapsed={sidebar.collapsed}
          mobileOpen={sidebar.mobileOpen}
          isDesktop={sidebar.isDesktop}
          onToggle={sidebar.toggle}
          onNavigate={sidebar.closeMobile}
          panelHeight={workspacePanelHeight}
        />
 
        <motion.main
          layout
          className="relative flex min-w-0 flex-1 items-start"
          transition={{ duration: design.motion.spatial, ease: design.motion.calm }}
        >
          <div
            className={cn(
              "feed-surface relative min-w-0 flex-1",
              "border-r border-border-subtle/50"
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-0 h-32 bg-gradient-to-b from-bg-feed to-transparent"
              aria-hidden={true}
            />
            <div
              className="pointer-events-none absolute left-1/2 top-1/4 z-0 h-[280px] w-[min(640px,90%)] -translate-x-1/2 rounded-full bg-accent-primary-muted/30 blur-[80px]"
              aria-hidden={true}
            />
            <div className="relative z-[1]">
              <ContinuityFeed />
            </div>
          </div>
 
          <ContextPanel
            isDesktop={sidebar.isDesktop}
            panelHeight={workspacePanelHeight}
          />
        </motion.main>
      </div>
 
      <CaptureOverlay />
    </div>
  );
}