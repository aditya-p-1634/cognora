"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import type { NavItem } from "@/config/navigation";

interface NavItemButtonProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onSelect: () => void;
}

export function NavItemButton({ item, collapsed, active, onSelect }: NavItemButtonProps) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full items-center rounded-[var(--radius-lg)] transition-colors duration-[var(--duration-fast)]",
        collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-2.5 py-2",
        active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          className="absolute inset-0 rounded-[var(--radius-lg)] bg-white/[0.05] ring-1 ring-inset ring-border-default"
          transition={{ duration: design.motion.normal, ease: design.motion.calm }}
        />
      )}

      <span
        className={cn(
          "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)]",
          active
            ? "bg-accent-primary-muted text-accent-primary"
            : "text-text-tertiary group-hover:bg-white/[0.03] group-hover:text-text-secondary"
        )}
      >
        <Icon className="h-[17px] w-[17px] stroke-[1.65]" />
      </span>

      {!collapsed && (
        <span className="relative truncate text-[var(--text-sm)] font-medium tracking-[var(--tracking-normal)]">
          {item.label}
        </span>
      )}
    </button>
  );
}
