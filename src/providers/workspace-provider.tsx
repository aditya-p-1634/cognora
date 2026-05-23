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
import {
  buildCapturedThread,
  buildContextFromCapture,
} from "@/lib/capture/build-captured-thread";
import { contextAwakeningDurationMs } from "@/lib/motion/context-transitions";
import {
  EMPTY_CAPTURE_DRAFT,
  type CaptureDraft,
} from "@/types/capture";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  getContextForThread,
  getThreadById,
  mockThreads,
} from "@/data/mock/workspace";

interface WorkspaceState {
  activeNav: NavItemId;
  selectedThreadId: string | null;
  selectedThread: ThoughtThread | null;
  context: ThoughtContext | null;
  hasThreadSelection: boolean;
  isContextAwakening: boolean;
  isCaptureOpen: boolean;
  captureDraft: CaptureDraft;
  capturedThreads: ThoughtThread[];
  recentlyCapturedId: string | null;
}

interface WorkspaceActions {
  setActiveNav: (id: NavItemId) => void;
  selectThread: (id: string | null) => void;
  toggleThread: (id: string) => void;
  openCapture: () => void;
  closeCapture: () => void;
  updateCaptureDraft: (patch: Partial<CaptureDraft>) => void;
  preserveThought: () => void;
}

type WorkspaceContextValue = WorkspaceState & WorkspaceActions;

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const CAPTURE_EMERGENCE_MS = 2400;

function resolveThread(
  threadId: string,
  capturedThreads: ThoughtThread[]
): ThoughtThread | null {
  return (
    capturedThreads.find((t) => t.id === threadId) ??
    getThreadById(threadId)
  );
}

function resolveContext(
  threadId: string,
  captureContextMap: Record<string, ThoughtContext>
): ThoughtContext | null {
  return captureContextMap[threadId] ?? getContextForThread(threadId);
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavItemId>("dashboard");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isContextAwakening, setIsContextAwakening] = useState(false);

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [captureDraft, setCaptureDraft] = useState<CaptureDraft>(EMPTY_CAPTURE_DRAFT);
  const [capturedThreads, setCapturedThreads] = useState<ThoughtThread[]>([]);
  const [captureContextMap, setCaptureContextMap] = useState<
    Record<string, ThoughtContext>
  >({});
  const [recentlyCapturedId, setRecentlyCapturedId] = useState<string | null>(
    null
  );

  const selectedThread = useMemo(
    () =>
      selectedThreadId
        ? resolveThread(selectedThreadId, capturedThreads)
        : null,
    [selectedThreadId, capturedThreads]
  );

  const context = useMemo(
    () =>
      selectedThreadId
        ? resolveContext(selectedThreadId, captureContextMap)
        : null,
    [selectedThreadId, captureContextMap]
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

  useEffect(() => {
    if (!recentlyCapturedId) return;
    const timer = window.setTimeout(
      () => setRecentlyCapturedId(null),
      CAPTURE_EMERGENCE_MS
    );
    return () => window.clearTimeout(timer);
  }, [recentlyCapturedId]);

  const selectThread = useCallback((id: string | null) => {
    setSelectedThreadId(id);
  }, []);

  const toggleThread = useCallback((id: string) => {
    setSelectedThreadId((prev) => (prev === id ? null : id));
  }, []);

  const openCapture = useCallback(() => {
    setCaptureDraft(EMPTY_CAPTURE_DRAFT);
    setIsCaptureOpen(true);
  }, []);

  const closeCapture = useCallback(() => {
    setIsCaptureOpen(false);
    setCaptureDraft(EMPTY_CAPTURE_DRAFT);
  }, []);

  const updateCaptureDraft = useCallback((patch: Partial<CaptureDraft>) => {
    setCaptureDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const preserveThought = useCallback(() => {
    const thought = captureDraft.thought.trim();
    if (!thought) return;

    const id = `cap-${Date.now()}`;
    const { thread } = buildCapturedThread(captureDraft, id);
    const contextEntry = buildContextFromCapture(thread, captureDraft);

    setCapturedThreads((prev) => [thread, ...prev]);
    setCaptureContextMap((prev) => ({ ...prev, [id]: contextEntry }));
    setRecentlyCapturedId(id);
    setIsCaptureOpen(false);
    setCaptureDraft(EMPTY_CAPTURE_DRAFT);
  }, [captureDraft]);

  const value = useMemo(
    () => ({
      activeNav,
      selectedThreadId,
      selectedThread,
      context,
      hasThreadSelection,
      isContextAwakening,
      isCaptureOpen,
      captureDraft,
      capturedThreads,
      recentlyCapturedId,
      setActiveNav,
      selectThread,
      toggleThread,
      openCapture,
      closeCapture,
      updateCaptureDraft,
      preserveThought,
    }),
    [
      activeNav,
      selectedThreadId,
      selectedThread,
      context,
      hasThreadSelection,
      isContextAwakening,
      isCaptureOpen,
      captureDraft,
      capturedThreads,
      recentlyCapturedId,
      selectThread,
      toggleThread,
      openCapture,
      closeCapture,
      updateCaptureDraft,
      preserveThought,
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

export function useCapture() {
  const {
    isCaptureOpen,
    captureDraft,
    capturedThreads,
    recentlyCapturedId,
    openCapture,
    closeCapture,
    updateCaptureDraft,
    preserveThought,
  } = useWorkspace();

  return {
    isCaptureOpen,
    captureDraft,
    capturedThreads,
    recentlyCapturedId,
    openCapture,
    closeCapture,
    updateCaptureDraft,
    preserveThought,
  };
}

/** Merges user-captured threads with mock fixtures for feed grouping. */
export function useFeedThreads() {
  const { capturedThreads } = useCapture();

  return useMemo(() => {
    const capturedIds = new Set(capturedThreads.map((t) => t.id));
    const base = mockThreads.filter((t) => !capturedIds.has(t.id));
    return [...capturedThreads, ...base];
  }, [capturedThreads]);
}
