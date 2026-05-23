"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { NavItemId } from "@/config/navigation";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  getContextForThread,
  getThreadById,
} from "@/data/mock/workspace";
import { contextAwakeningDurationMs } from "@/lib/motion/context-transitions";

interface WorkspaceState {
  activeNav: NavItemId;
  selectedThreadId: string | null;
  selectedThread: ThoughtThread | null;
  context: ThoughtContext | null;
  hasThreadSelection: boolean;
  isContextAwakening: boolean;
}

interface WorkspaceActions {
  setActiveNav: (id: NavItemId) => void;
  selectThread: (id: string | null) => void;
  toggleThread: (id: string) => void;
}

type WorkspaceContextValue = WorkspaceState & WorkspaceActions;

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavItemId>("dashboard");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isContextAwakening, setIsContextAwakening] = useState(false);

  const selectedThread = useMemo(
    () => (selectedThreadId ? getThreadById(selectedThreadId) : null),
    [selectedThreadId]
  );

  const context = useMemo(
    () => (selectedThreadId ? getContextForThread(selectedThreadId) : null),
    [selectedThreadId]
  );

  const hasThreadSelection = selectedThreadId !== null;

  useEffect(() => {
    if (!selectedThreadId) {
      setIsContextAwakening(false);
      return;
    }

    setIsContextAwakening(true);
    const timer = window.setTimeout(
      () => setIsContextAwakening(false),
      contextAwakeningDurationMs
    );
    return () => window.clearTimeout(timer);
  }, [selectedThreadId]);

  const selectThread = useCallback((id: string | null) => {
    setSelectedThreadId(id);
  }, []);

  const toggleThread = useCallback((id: string) => {
    setSelectedThreadId((prev) => (prev === id ? null : id));
  }, []);

  const value = useMemo(
    () => ({
      activeNav,
      selectedThreadId,
      selectedThread,
      context,
      hasThreadSelection,
      isContextAwakening,
      setActiveNav,
      selectThread,
      toggleThread,
    }),
    [
      activeNav,
      selectedThreadId,
      selectedThread,
      context,
      hasThreadSelection,
      isContextAwakening,
      selectThread,
      toggleThread,
    ]
  );

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function useThreadSelection() {
  const {
    selectedThreadId,
    selectedThread,
    context,
    hasThreadSelection,
    isContextAwakening,
    selectThread,
    toggleThread,
  } = useWorkspace();

  return {
    selectedThreadId,
    selectedThread,
    context,
    hasThreadSelection,
    isContextAwakening,
    selectThread,
    toggleThread,
    isSelected: (threadId: string) => selectedThreadId === threadId,
  };
}
