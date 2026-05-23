import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Brain,
  Clock,
  Sparkles,
  Search,
  Settings,
} from "lucide-react";

export type NavItemId =
  | "dashboard"
  | "projects"
  | "thoughts"
  | "timeline"
  | "reflections"
  | "search"
  | "settings";

export interface NavItem {
  id: NavItemId;
  label: string;
  icon: LucideIcon;
  href: string;
  section?: "primary" | "utility";
}

export const primaryNav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/workspace", section: "primary" },
  { id: "projects", label: "Projects", icon: FolderKanban, href: "/workspace", section: "primary" },
  { id: "thoughts", label: "Thoughts", icon: Brain, href: "/workspace", section: "primary" },
  { id: "timeline", label: "Timeline", icon: Clock, href: "/workspace", section: "primary" },
  { id: "reflections", label: "Reflections", icon: Sparkles, href: "/workspace", section: "primary" },
];

export const utilityNav: NavItem[] = [
  { id: "search", label: "Search", icon: Search, href: "/workspace", section: "utility" },
  { id: "settings", label: "Settings", icon: Settings, href: "/workspace", section: "utility" },
];

export const allNavItems = [...primaryNav, ...utilityNav];
