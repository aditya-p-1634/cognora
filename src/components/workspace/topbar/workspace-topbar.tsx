"use client";

import { Menu, Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { design } from "@/config/design";
import { mockSession } from "@/data/mock/workspace";
import { SessionPill } from "./session-pill";

interface WorkspaceTopbarProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function WorkspaceTopbar({ onMenuToggle, showMenuButton }: WorkspaceTopbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: design.motion.normal, ease: design.motion.enter }}
      className="sticky top-0 z-30 flex h-[var(--height-topbar)] shrink-0 items-center gap-3 border-b border-border-subtle px-4 sm:gap-4 sm:px-5 glass-surface"
      style={{ zIndex: design.zIndex.topbar }}
    >
      {showMenuButton && (
        <IconButton onClick={onMenuToggle} aria-label="Open navigation" className="lg:hidden">
          <Menu className="h-4 w-4" />
        </IconButton>
      )}

      <div className="relative flex min-w-0 flex-1 items-center sm:max-w-md lg:max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-text-muted" strokeWidth={1.75} />
        <Input
          placeholder="Search thoughts, sessions, concepts…"
          className="h-10 rounded-[var(--radius-lg)] border-border-subtle/80 bg-bg-raised/60 pl-10 text-[var(--text-sm)] shadow-none placeholder:text-text-muted/90 focus-visible:bg-bg-overlay/80"
          aria-label="Global semantic search"
        />
        <kbd className="pointer-events-none absolute right-3 hidden rounded border border-border-subtle bg-bg-overlay/60 px-1.5 py-0.5 font-mono text-[10px] text-text-muted sm:inline">
          ⌘K
        </kbd>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <SessionPill session={mockSession} />
        <div className="h-6 w-px bg-border-default" aria-hidden />
        <div className="text-right">
          <p className="type-label leading-none">Status</p>
          <p className="mt-1 text-[var(--text-xs)] text-text-tertiary">Synced · Calm</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
        <Button
          variant="capture"
          size="sm"
          className="h-9 gap-1.5 rounded-[var(--radius-lg)] px-3.5 shadow-soft"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Capture</span>
        </Button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-overlay/80 text-[var(--text-xs)] font-medium text-text-secondary ring-1 ring-border-default transition-all duration-[var(--duration-fast)] hover:ring-border-strong hover:text-text-primary"
          aria-label="Profile and settings"
        >
          A
        </button>
      </div>
    </motion.header>
  );
}
