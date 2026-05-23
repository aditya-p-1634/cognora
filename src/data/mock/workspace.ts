import type {
  ActiveSession,
  ContinuitySuggestion,
  ThoughtContext,
  ThoughtThread,
} from "@/types/workspace";

export const mockThreads: ThoughtThread[] = [
  {
    id: "t1",
    title: "Distributed cognition as interface metaphor",
    excerpt:
      "Exploring how continuity layers map to mental state restoration rather than task lists…",
    status: "active",
    lastTouched: "12m ago",
    momentum: "high",
    projectLabel: "Cognora thesis",
  },
  {
    id: "t2",
    title: "Unresolved: semantic graph for thought resurfacing",
    excerpt:
      "Need to define lightweight edges between concepts without forcing taxonomy…",
    status: "unresolved",
    lastTouched: "2h ago",
    momentum: "medium",
    projectLabel: "Architecture",
  },
  {
    id: "t3",
    title: "Session bridge — picking up yesterday's focus",
    excerpt:
      "Workspace shell and panel primitives felt right; next is motion vocabulary…",
    status: "resurfaced",
    lastTouched: "Yesterday",
    momentum: "low",
  },
  {
    id: "t4",
    title: "Current focus: continuity feed density",
    excerpt:
      "Calm hierarchy over cards; breathable sections; context without clutter…",
    status: "focus",
    lastTouched: "Now",
    momentum: "high",
  },
];

export const mockSuggestions: ContinuitySuggestion[] = [
  {
    id: "s1",
    message: "Three threads share themes around spatial UI — consider merging context.",
    actionLabel: "Review themes",
  },
  {
    id: "s2",
    message: "Your active session has been idle 18m. Resume or archive?",
    actionLabel: "Resume session",
  },
];

export const mockSession: ActiveSession = {
  id: "sess-1",
  label: "Workspace foundation",
  startedAt: "47m ago",
  threadCount: 4,
};

/** Semantic echoes shown while context layer is latent (no thread selected). */
export const mockLatentHints = [
  "spatial UI ↔ mental state",
  "continuity layer",
  "resurfacing signals",
  "session bridge",
] as const;

const contextMap: Record<string, ThoughtContext> = {
  t1: {
    threadId: "t1",
    summary:
      "A design thesis thread connecting interface metaphors to cognitive restoration — how spatial continuity mirrors distributed cognition.",
    relatedConcepts: [
      { id: "c1", label: "Continuity layer", affinity: "strong" },
      { id: "c2", label: "Mental state restoration", affinity: "strong" },
      { id: "c3", label: "Distributed cognition", affinity: "moderate" },
      { id: "c4", label: "Interface metaphor", affinity: "moderate" },
      { id: "c5", label: "Task-list anti-pattern", affinity: "latent" },
    ],
    semanticRelationships: [
      {
        id: "sr1",
        source: "Continuity layer",
        target: "Mental state restoration",
        kind: "extends",
      },
      {
        id: "sr2",
        source: "Distributed cognition",
        target: "Interface metaphor",
        kind: "informs",
      },
      {
        id: "sr3",
        source: "Continuity layer",
        target: "Spatial UI",
        kind: "relates",
      },
    ],
    recurringThemes: ["spatial UI", "mental state", "calm hierarchy"],
    unresolvedContinuations: [
      "Define motion vocabulary for state-preserving transitions",
      "Map feed items to semantic resurfacing signals",
      "Articulate thesis argument for continuity-as-metaphor",
    ],
    connectedSessions: [
      {
        id: "sess-1",
        label: "Workspace foundation",
        relativeTime: "47m ago",
        threadCount: 4,
      },
      {
        id: "sess-0",
        label: "Thesis drafting",
        relativeTime: "3d ago",
        threadCount: 6,
      },
    ],
  },
  t2: {
    threadId: "t2",
    summary:
      "Technical exploration of lightweight semantic relationships — edges without forced taxonomy for thought resurfacing.",
    relatedConcepts: [
      { id: "c6", label: "Knowledge graph", affinity: "strong" },
      { id: "c7", label: "Resurfacing signals", affinity: "strong" },
      { id: "c8", label: "Context panel", affinity: "moderate" },
      { id: "c9", label: "Edge taxonomy", affinity: "latent" },
    ],
    semanticRelationships: [
      {
        id: "sr4",
        source: "Knowledge graph",
        target: "Resurfacing signals",
        kind: "informs",
      },
      {
        id: "sr5",
        source: "Context panel",
        target: "Knowledge graph",
        kind: "extends",
      },
      {
        id: "sr6",
        source: "Edge taxonomy",
        target: "Knowledge graph",
        kind: "contrasts",
      },
    ],
    recurringThemes: ["edges without taxonomy", "resurfacing", "latent context"],
    unresolvedContinuations: [
      "Prototype relation types in context panel",
      "Define affinity levels for concept strength",
      "Validate graph density at scale",
    ],
    connectedSessions: [
      {
        id: "sess-1",
        label: "Workspace foundation",
        relativeTime: "47m ago",
        threadCount: 4,
      },
      {
        id: "sess-arch",
        label: "Architecture deep-dive",
        relativeTime: "Yesterday",
        threadCount: 3,
      },
    ],
  },
  t3: {
    threadId: "t3",
    summary:
      "Bridge from prior session into today's implementation focus — restoring shell primitives and motion direction.",
    relatedConcepts: [
      { id: "c10", label: "Panel primitives", affinity: "strong" },
      { id: "c11", label: "Layout shell", affinity: "strong" },
      { id: "c12", label: "Motion vocabulary", affinity: "moderate" },
      { id: "c13", label: "Session persistence", affinity: "latent" },
    ],
    semanticRelationships: [
      {
        id: "sr7",
        source: "Panel primitives",
        target: "Layout shell",
        kind: "continues",
      },
      {
        id: "sr8",
        source: "Motion vocabulary",
        target: "Session persistence",
        kind: "relates",
      },
      {
        id: "sr9",
        source: "Layout shell",
        target: "Continuity feed",
        kind: "informs",
      },
    ],
    recurringThemes: ["layout shell", "motion", "session bridge"],
    unresolvedContinuations: [
      "Document spatial transition patterns",
      "Wire session bridge to local persistence",
      "Resume motion vocabulary from prior notes",
    ],
    connectedSessions: [
      {
        id: "sess-prev",
        label: "Yesterday's session",
        relativeTime: "Yesterday",
        threadCount: 5,
      },
      {
        id: "sess-1",
        label: "Workspace foundation",
        relativeTime: "47m ago",
        threadCount: 4,
      },
    ],
  },
  t4: {
    threadId: "t4",
    summary:
      "Active focus on feed information architecture and visual calm — hierarchy that breathes without dashboard density.",
    relatedConcepts: [
      { id: "c14", label: "Continuity feed", affinity: "strong" },
      { id: "c15", label: "Visual hierarchy", affinity: "strong" },
      { id: "c16", label: "Anti-dashboard", affinity: "moderate" },
      { id: "c17", label: "Thread selection", affinity: "moderate" },
    ],
    semanticRelationships: [
      {
        id: "sr10",
        source: "Continuity feed",
        target: "Visual hierarchy",
        kind: "extends",
      },
      {
        id: "sr11",
        source: "Thread selection",
        target: "Context panel",
        kind: "informs",
      },
      {
        id: "sr12",
        source: "Anti-dashboard",
        target: "Visual hierarchy",
        kind: "relates",
      },
    ],
    recurringThemes: ["breathable sections", "anti-dashboard", "contextual awakening"],
    unresolvedContinuations: [
      "Validate hierarchy with real thought density",
      "Tune selection emphasis without breaking calm",
      "Cross-fade context sections on thread change",
    ],
    connectedSessions: [
      {
        id: "sess-1",
        label: "Workspace foundation",
        relativeTime: "47m ago",
        threadCount: 4,
      },
    ],
  },
};

export function getThreadById(threadId: string): ThoughtThread | null {
  return mockThreads.find((t) => t.id === threadId) ?? null;
}

export function getContextForThread(threadId: string): ThoughtContext | null {
  return contextMap[threadId] ?? null;
}

export function getAllThreadContexts(): ThoughtContext[] {
  return Object.values(contextMap);
}
