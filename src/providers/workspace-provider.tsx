"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  computeContinuityIntelligence,
  resolveIntelligenceContexts,
  type ContinuityIntelligence,
} from "@/lib/intelligence";
import {
  computeGravityField,
  reinforceSelection,
  touchSessionForThreads,
  type ContinuityGravityField,
} from "@/lib/gravity";
import {
  computeSemanticIntegrityField,
  type SemanticIntegrityField,
} from "@/lib/integrity";
import type { GravityLedger } from "@/types/gravity";
import {
  computeThreadRelationships,
  type ThreadRelationshipSnapshot,
} from "@/lib/relationships";
import {
  createPersistedThought,
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
  continuityIntelligence: ContinuityIntelligence;
  threadRelationships: ThreadRelationshipSnapshot | null;
  memoryGravity: ContinuityGravityField;
  semanticIntegrity: SemanticIntegrityField;
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
  selectedThreadId: string | null,
  gravityLedger: GravityLedger
) {
  return {
    thoughts,
    sessionStartedAt,
    sessionLabel,
    activeNav,
    selectedThreadId,
    gravityLedger,
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
  const [gravityLedger, setGravityLedger] = useState<GravityLedger>({});

  const {
    isHydrated: isContinuityHydrated,
    hydrate,
    completeHydration,
    scheduleSave,
    persistNow,
  } = useWorkspacePersistence();
  const persistAfterHydrationRef = useRef(false);

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

  const intelligenceContexts = useMemo(
    () => resolveIntelligenceContexts(feedThreads, captureContextMap),
    [feedThreads, captureContextMap]
  );

  const rawMemoryGravity = useMemo(
    () =>
      computeGravityField({
        threads: feedThreads,
        contextByThreadId: intelligenceContexts,
        ledger: gravityLedger,
      }),
    [feedThreads, intelligenceContexts, gravityLedger]
  );

  const semanticIntegrity = useMemo(
    () =>
      computeSemanticIntegrityField({
        threads: feedThreads,
        contextByThreadId: intelligenceContexts,
        gravityField: rawMemoryGravity,
        ledger: gravityLedger,
      }),
    [feedThreads, intelligenceContexts, rawMemoryGravity, gravityLedger]
  );

  const memoryGravity = useMemo(
    (): ContinuityGravityField => ({
      ...rawMemoryGravity,
      weights: semanticIntegrity.effectiveGravity,
      resurfacingOrder: semanticIntegrity.resurfacingOrder,
    }),
    [rawMemoryGravity, semanticIntegrity]
  );

  const continuityIntelligence = useMemo(
    () =>
      computeContinuityIntelligence({
        threads: feedThreads,
        contextByThreadId: intelligenceContexts,
        selectedThreadId,
        sessionStartedAt,
        lastSavedAt,
        capturedCount: persistedThoughts.length,
        gravityWeights: memoryGravity.weights,
        resurfacingOrder: memoryGravity.resurfacingOrder,
        cognitionSignals: semanticIntegrity.signals,
      }),
    [
      feedThreads,
      intelligenceContexts,
      selectedThreadId,
      sessionStartedAt,
      lastSavedAt,
      persistedThoughts.length,
      memoryGravity.weights,
      memoryGravity.resurfacingOrder,
      semanticIntegrity.signals,
    ]
  );

  const threadRelationships = useMemo(() => {
    if (!selectedThreadId) return null;
    return computeThreadRelationships(
      {
        focusThreadId: selectedThreadId,
        threads: feedThreads,
        contextByThreadId: intelligenceContexts,
      },
      {
        gravityWeights: memoryGravity.weights,
        cognitionSignals: semanticIntegrity.signals,
      }
    );
  }, [
    selectedThreadId,
    feedThreads,
    intelligenceContexts,
    memoryGravity.weights,
    semanticIntegrity.signals,
  ]);

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
        selectedThreadId,
        gravityLedger
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
      gravityLedger,
      persistNow,
      scheduleSave,
    ]
  );

  useEffect(() => {
    const snapshot = hydrate();
    if (snapshot) {
      const thoughts = snapshot.thoughts;
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
      const mergedThreads = mergeFeedThreads(
        thoughtsToFeedDerivatives(thoughts).capturedThreads
      );
      const ledger = touchSessionForThreads(
        snapshot.gravityLedger ?? {},
        mergedThreads.map((t) => t.id),
        new Map(mergedThreads.map((t) => [t.id, t])),
        Date.now()
      );
      setGravityLedger(ledger);

      persistNow(
        buildPersistencePayload(
          thoughts,
          snapshot.sessionStartedAt,
          snapshot.sessionLabel,
          snapshot.activeNav,
          resolvePersistedSelection(
            snapshot.selectedThreadId,
            thoughtsToFeedDerivatives(thoughts).capturedThreads
          ),
          ledger
        )
      );
    }
    persistAfterHydrationRef.current = true;
    completeHydration();
  }, [hydrate, completeHydration, persistNow]);

  useEffect(() => {
    if (!isContinuityHydrated || !persistAfterHydrationRef.current) return;
    syncPersistence(persistedThoughts);
  }, [
    isContinuityHydrated,
    persistedThoughts,
    activeNav,
    selectedThreadId,
    sessionStartedAt,
    sessionLabel,
    gravityLedger,
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

  const selectThread = useCallback(
    (id: string | null) => {
      setSelectedThreadId(id);
      if (!id) return;

      const thread =
        capturedThreads.find((t) => t.id === id) ?? getThreadById(id);
      setGravityLedger((prev) =>
        reinforceSelection(prev, id, thread, Date.now())
      );
    },
    [capturedThreads]
  );

  const toggleThread = useCallback(
    (id: string) => {
      setSelectedThreadId((prev) => {
        const next = prev === id ? null : id;
        if (next) {
          const thread =
            capturedThreads.find((t) => t.id === next) ?? getThreadById(next);
          setGravityLedger((ledger) =>
            reinforceSelection(ledger, next, thread, Date.now())
          );
        }
        return next;
      });
    },
    [capturedThreads]
  );

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

    setGravityLedger((prev) =>
      reinforceSelection(prev, id, record.thread, Date.now())
    );

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
      continuityIntelligence,
      threadRelationships,
      memoryGravity,
      semanticIntegrity,
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
      continuityIntelligence,
      threadRelationships,
      memoryGravity,
      semanticIntegrity,
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

export function useContinuityIntelligence() {
  const { continuityIntelligence } = useWorkspace();
  return continuityIntelligence;
}

export function useThreadRelationships() {
  const { threadRelationships } = useWorkspace();
  return threadRelationships;
}

export function useMemoryGravity() {
  const { memoryGravity } = useWorkspace();
  return memoryGravity;
}

export function useThreadGravityWeight(threadId: string): number {
  const { memoryGravity } = useWorkspace();
  return memoryGravity.weights.get(threadId) ?? 0;
}

export function useSemanticIntegrity() {
  const { semanticIntegrity } = useWorkspace();
  return semanticIntegrity;
}
