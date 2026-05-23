"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { primaryNav, utilityNav } from "@/config/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { NavItemButton } from "./nav-item-button";
import { SidebarWorkspaceFooter } from "./sidebar-workspace-footer";
import { useContinuitySession, useWorkspace } from "@/providers/workspace-provider";

interface WorkspaceSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  isDesktop: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  panelHeight?: string;
}

export function WorkspaceSidebar({
  collapsed,
  mobileOpen,
  isDesktop,
  onToggle,
  onNavigate,
  panelHeight,
}: WorkspaceSidebarProps) {
  const { activeNav, setActiveNav } = useWorkspace();
  const { continuitySession } = useContinuitySession();
  const showLabels = isDesktop && !collapsed;
  const width = isDesktop
    ? collapsed
      ? design.layout.sidebarCollapsed
      : design.layout.sidebarExpanded
    : design.layout.sidebarExpanded;

  return (
    <motion.aside
      layout={isDesktop}
      initial={false}
      animate={
        isDesktop
          ? { width }
          : {
              x: mobileOpen ? 0 : -width,
              width,
            }
      }
      transition={{ duration: design.motion.spatial, ease: design.motion.enter }}
      className={cn(
        "z-50 flex shrink-0 flex-col border-r border-border-subtle glass-surface",
        isDesktop &&
          "sticky top-[var(--height-topbar)] overflow-y-auto overflow-x-hidden",
        !isDesktop &&
          "fixed inset-y-0 left-0 top-[var(--height-topbar)] overflow-hidden shadow-elevated"
      )}
      style={
        !isDesktop
          ? { zIndex: design.zIndex.sidebarMobile, width }
          : panelHeight
            ? { width, maxHeight: panelHeight, height: panelHeight }
            : { width }
      }
    >
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-accent-primary/20 via-border-subtle/80 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-8 left-3 w-px continuity-spine opacity-30"
        aria-hidden
      />

      <div
        className={cn(
          "relative flex items-center border-b border-border-subtle/50",
          collapsed && isDesktop ? "justify-center px-2 py-3" : "justify-between px-3 py-3"
        )}
      >
        <motion.div layout className="flex min-w-0 items-center gap-3 overflow-hidden">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-accent-primary-muted ring-1 ring-border-subtle">
            <span className="text-[15px] font-semibold tracking-tight text-accent-primary">
              C
            </span>
            <motion.span
              className="absolute -bottom-px -right-px h-2 w-2 rounded-full bg-accent-calm ring-2 ring-bg-glass"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          {showLabels && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: design.motion.normal, ease: design.motion.calm }}
            >
              <p className="truncate text-[var(--text-sm)] font-medium tracking-tight text-text-primary">
                Cognora
              </p>
              <p className="truncate text-[var(--text-xs)] text-text-muted">
                Continuity workspace
              </p>
            </motion.div>
          )}
        </motion.div>

        {isDesktop && (
          <IconButton
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(collapsed && "mx-auto")}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </IconButton>
        )}
      </div>

      {showLabels && (
        <div className="relative mx-3 mt-4 flex items-center gap-2 rounded-[var(--radius-md)] bg-bg-overlay/30 px-2.5 py-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-continuity-pulse opacity-40" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-accent-calm" />
          </span>
          <span className="text-[10px] text-text-muted">
            {continuitySession.threadCount} threads in continuity
          </span>
        </div>
      )}

      <nav className="relative flex flex-1 flex-col gap-1 px-2 py-5">
        <p className={cn("type-label mb-2 px-2.5", !showLabels && "sr-only")}>
          Navigate
        </p>
        <ul className="space-y-0.5" role="list">
          {primaryNav.map((item) => (
            <li key={item.id}>
              <NavItemButton
                item={item}
                collapsed={!showLabels}
                active={activeNav === item.id}
                onSelect={() => {
                  setActiveNav(item.id);
                  onNavigate();
                }}
              />
            </li>
          ))}
        </ul>

        <div className="cognitive-divider my-4 mx-1 opacity-70" />

        <ul className="mt-auto space-y-0.5" role="list">
          {utilityNav.map((item) => (
            <li key={item.id}>
              <NavItemButton
                item={item}
                collapsed={!showLabels}
                active={activeNav === item.id}
                onSelect={() => {
                  setActiveNav(item.id);
                  onNavigate();
                }}
              />
            </li>
          ))}
        </ul>
      </nav>

      <SidebarWorkspaceFooter collapsed={!showLabels} />
    </motion.aside>
  );
}
