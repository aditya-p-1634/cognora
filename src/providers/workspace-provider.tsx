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
import { mockSession } from "@/data/mock/workspace";
import { useWorkspacePersistence } from "@/hooks/use-workspace-persistence";
import { contextAwakeningDurationMs } from "@/lib/motion/context-transitions";
import {
  computeContinuityDepth,
  formatContinuityRelativeTime,
  mergeFeedThreads,
} from "@/lib/continuity";
import {
  createPersistedThought,
  hydrateThoughtsForDisplay,
  thoughtsToFeedDerivatives,
  upsertThought,
} from "@/lib/persistence";
import {
  EMPTY_CAPTURE_DRAFT,
  type CaptureDraft,
} from "@/types/capture";
import type { PersistedCognitiveThought } from "@/types/persistence";
import type { ActiveSession, ThoughtContext, ThoughtThread } from "@/types/workspace";
import {
  getContextForThread,
  getThreadById,
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
  continuitySession: ActiveSession & { continuityDepth: number };
  hasPersistedContinuity: boolean;
  isContinuityHydrated: boolean;
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

function resolvePersistedSelection(
  selectedThreadId: string | null,
  capturedThreads: ThoughtThread[]
): string | null {
  if (!selectedThreadId) return null;
  const threads = mergeFeedThreads(capturedThreads);
  return threads.some((t) => t.id === selectedThreadId) ? selectedThreadId : null;
}

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

function buildPersistencePayload(
  thoughts: PersistedCognitiveThought[],
  sessionStartedAt: string,
  sessionLabel: string,
  activeNav: NavItemId,
  selectedThreadId: string | null
) {
  return {
    thoughts,
    sessionStartedAt,
    sessionLabel,
    activeNav,
    selectedThreadId,
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeNav, setActiveNav] = useState<NavItemId>("dashboard");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isContextAwakening, setIsContextAwakening] = useState(false);

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [captureDraft, setCaptureDraft] = useState<CaptureDraft>(EMPTY_CAPTURE_DRAFT);
  const [persistedThoughts, setPersistedThoughts] = useState<PersistedCognitiveThought[]>(
    []
  );
  const [recentlyCapturedId, setRecentlyCapturedId] = useState<string | null>(null);

  const [sessionLabel, setSessionLabel] = useState(mockSession.label);
  const [sessionStartedAt, setSessionStartedAt] = useState(() =>
    new Date().toISOString()
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hasPersistedContinuity, setHasPersistedContinuity] = useState(false);

  const { isHydrated: isContinuityHydrated, hydrate, completeHydration, scheduleSave, persistNow } =
    useWorkspacePersistence();

  const { capturedThreads, captureContextMap } = useMemo(
    () => thoughtsToFeedDerivatives(persistedThoughts),
    [persistedThoughts]
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

  const feedThreads = useMemo(
    () => mergeFeedThreads(capturedThreads),
    [capturedThreads]
  );

  const continuitySession = useMemo((): ActiveSession & { continuityDepth: number } => {
    const continuityDepth = computeContinuityDepth({
      threadCount: feedThreads.length,
      capturedCount: persistedThoughts.length,
      hasSelection: hasThreadSelection,
      sessionStartedAt,
      lastSavedAt,
    });

    return {
      id: mockSession.id,
      label: sessionLabel,
      startedAt: formatContinuityRelativeTime(sessionStartedAt),
      threadCount: feedThreads.length,
      continuityDepth,
    };
  }, [
    feedThreads.length,
    persistedThoughts.length,
    hasThreadSelection,
    sessionStartedAt,
    lastSavedAt,
    sessionLabel,
  ]);

  const syncPersistence = useCallback(
    (
      thoughts: PersistedCognitiveThought[],
      options?: { immediate?: boolean }
    ) => {
      const payload = buildPersistencePayload(
        thoughts,
        sessionStartedAt,
        sessionLabel,
        activeNav,
        selectedThreadId
      );

      if (options?.immediate) {
        persistNow(payload);
        setLastSavedAt(new Date().toISOString());
        return;
      }

      scheduleSave(payload);
    },
    [
      sessionStartedAt,
      sessionLabel,
      activeNav,
      selectedThreadId,
      persistNow,
      scheduleSave,
    ]
  );

  useEffect(() => {
    const snapshot = hydrate();
    if (snapshot) {
      const thoughts = hydrateThoughtsForDisplay(snapshot.thoughts);
      setPersistedThoughts(thoughts);
      setActiveNav(snapshot.activeNav);
      setSelectedThreadId(
        resolvePersistedSelection(
          snapshot.selectedThreadId,
          thoughtsToFeedDerivatives(thoughts).capturedThreads
        )
      );
      setSessionLabel(snapshot.sessionLabel);
      setSessionStartedAt(snapshot.sessionStartedAt);
      setLastSavedAt(snapshot.savedAt);
      setHasPersistedContinuity(thoughts.length > 0);
    }
    completeHydration();
  }, [hydrate, completeHydration]);

  useEffect(() => {
    if (!isContinuityHydrated) return;
    syncPersistence(persistedThoughts);
  }, [
    isContinuityHydrated,
    persistedThoughts,
    activeNav,
    selectedThreadId,
    sessionStartedAt,
    sessionLabel,
    syncPersistence,
  ]);

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
    const record = createPersistedThought(captureDraft, id);
    const nextThoughts = upsertThought(persistedThoughts, record);

    setPersistedThoughts(nextThoughts);
    setRecentlyCapturedId(id);
    setIsCaptureOpen(false);
    setCaptureDraft(EMPTY_CAPTURE_DRAFT);
    setHasPersistedContinuity(true);

    syncPersistence(nextThoughts, { immediate: true });
  }, [captureDraft, persistedThoughts, syncPersistence]);

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
      continuitySession,
      hasPersistedContinuity,
      isContinuityHydrated,
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
      continuitySession,
      hasPersistedContinuity,
      isContinuityHydrated,
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

  return useMemo(() => mergeFeedThreads(capturedThreads), [capturedThreads]);
}

export function useContinuitySession() {
  const { continuitySession, hasPersistedContinuity, isContinuityHydrated } =
    useWorkspace();

  return { continuitySession, hasPersistedContinuity, isContinuityHydrated };
}
