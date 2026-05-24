# Cognora — Current State

> **Purpose:** Snapshot of what is implemented today and what is planned next. Update this file when milestones land.

**Version:** `0.1.0` (package.json)  
**Last meaningful surface:** Workspace UI with mock cognitive data — no backend.

---

## Implemented

### Application shell

- [x] Next.js 15 App Router project with TypeScript and ESLint
- [x] Root layout with Geist fonts and global dark theme
- [x] `/` → `/workspace` redirect
- [x] Single workspace route composing provider + shell

### Workspace layout

- [x] Three-region shell: topbar, sidebar, main (feed + context)
- [x] Responsive sidebar: collapse on desktop, drawer + backdrop on mobile
- [x] Responsive context panel: sticky column on `lg+`, slide-over drawer on smaller viewports
- [x] Ambient background treatments and glass topbar
- [x] Independent scroll for context panel via `ScrollRegion`

### Continuity feed (center column)

- [x] Hero: “Cognitive continuity” / “Resuming your saved state”
- [x] `CognitiveStateStrip` — mock session label, thread count, continuity depth bar
- [x] Vertical **continuity spine** with threaded sections:
  - Now in focus
  - Active threads
  - Unresolved
  - Resurfaced (subdued)
- [x] `ThoughtThreadRow` — selection state, status label, momentum, project label, hover/selection motion
- [x] `ContinuitySuggestions` (“Continuity whispers”) with mock messages
- [x] Staggered section entrance animations

### Context panel (right column)

- [x] **Latent state** (`ContextEmpty`) — copy, `ContextLatentGraph` (decorative SVG), semantic echo list from `mockLatentHints`
- [x] **Active state** — thread header, summary, related relations, recurring themes, unresolved continuations
- [x] Animated crossfade between latent and active (`AnimatePresence`)
- [x] Mobile close via backdrop / X button → `selectThread(null)`

### Sidebar & topbar

- [x] Primary nav: Dashboard, Projects, Thoughts, Timeline, Reflections
- [x] Utility nav: Search, Settings
- [x] Nav highlights `activeNav` in provider (UI state only)
- [x] Session indicator in sidebar footer area (`SidebarWorkspaceFooter`)
- [x] Topbar: semantic search input (non-functional), session pill, status text, Capture button (opens cognitive capture overlay), profile placeholder

### Cognitive capture

- [x] Ambient capture overlay — blur backdrop, atmospheric panel, ESC / click-outside dismiss
- [x] `CaptureDraft` state — thought, continuation, semantic tags, emotional tone, unresolved toggle
- [x] Preserve flow — builds `ThoughtThread` + `ThoughtContext`, prepends to feed with emergence motion
- [x] `useCapture` hook — open/close, draft updates, captured thread list

### State & data

- [x] `WorkspaceProvider` — `activeNav`, `selectedThreadId`, derived `selectedThread` + `context`, capture state
- [x] `useSidebar` — breakpoint-aware collapse and mobile drawer
- [x] Mock data: 4 threads, 2 suggestions, 1 session, per-thread context map
- [x] Domain types in `src/types/workspace.ts`

### Memory gravity engine

- [x] `src/lib/gravity/` — continuity gravity scoring, temporal decay, continuity hubs, resurfacing order
- [x] `gravityLedger` — persisted selection/session reinforcement (optional on continuity snapshot)
- [x] Latent pull for unresolved thoughts; gravity-informed relationships, whispers, feed ordering
- [x] Subtle feed presence (opacity, spine tone) — no visible scores or gamification

### Semantic integrity layer

- [x] `src/lib/integrity/` — cognition signal scoring, relationship confidence, gravity modulation
- [x] Filters weak phrase-overlap adjacency; prefers thematic and unresolved coherence
- [x] Effective gravity + refined resurfacing order (no scores in UI)
- [x] Low-signal thoughts remain visible but exert weaker continuity pull

### Relationship intelligence engine

- [x] `src/lib/relationships/` — deterministic scoring, semantic profiles, related-thought detection
- [x] Shared semantic normalization (stopwords, token cleanup, recurring concept weights)
- [x] Latent continuity weights for unresolved / resurfaced threads (ambient, non-intrusive)
- [x] Context panel — adjacent cognition, continuity resonance, semantic overlap echoes
- [x] `useThreadRelationships()` — decoupled from UI rendering; max 3 related thoughts

### Continuity intelligence layer

- [x] `src/lib/intelligence/` — theme clustering, whisper derivation, latent echoes, data-driven latent graph
- [x] `computeContinuityIntelligence()` — analyzes merged threads + contexts (mock + captured)
- [x] `useContinuityIntelligence()` — whispers, latent echoes, graph snapshot for UI
- [x] Continuity whispers — state-derived messages with calm actions (select thread)
- [x] Latent context panel — semantic echoes and graph reflect live workspace signals (mock fallback when empty)

### Persistent cognitive continuity

- [x] `src/lib/persistence/` — typed localStorage adapter, validators, v1→v2 migration, `PersistedCognitiveThought` records
- [x] Full thought payload: text, timestamp, tone, unresolved flag, semantic tags, continuation metadata, thread + context projections
- [x] `useWorkspacePersistence` — hydrate on init, debounced save, **immediate flush on capture**, `pagehide` / `beforeunload` safety
- [x] Lenient snapshot normalization + empty-save guard (prevents refresh from wiping stored thoughts)
- [x] Continuity ordering (newest-first); calm rehydration (relative timestamps, no emergence on restore)
- [x] `computeContinuityDepth` + `continuitySession` across feed strip, topbar, sidebar

### Design system (foundation)

- [x] `tokens.css` — full dark palette, spacing, typography, motion tokens
- [x] `design.ts` — layout dimensions, motion curves, z-index scale
- [x] UI primitives: `Button` (incl. `capture` variant), `Input`, `IconButton`, `Badge`
- [x] Layout primitives: `Panel`, `PanelHeader`, `PanelSection`, `ScrollRegion`

---

## Not implemented (intentional gaps)

| Area | Status |
|------|--------|
| Backend / API | None |
| Persistence (local or remote) | Local continuity snapshot only (no API) |
| Authentication | None |
| Real navigation routes | All nav items link to `/workspace`; switching nav id does not change view |
| Global search | Input + ⌘K hint only |
| Capture flow | Implemented — ambient overlay, draft state, mock thread insertion |
| Suggestion actions | Wired for intelligence-derived whispers (thread selection) |
| Light theme | Dark only |
| Tests | None in repo |
| README | Not present |

---

## Current workspace features (user-visible)

1. **Browse thought threads** grouped by cognitive status along a visual timeline spine.
2. **Select a thread** to highlight it in the feed, load structured context, and surface adjacent cognition in the right panel.
3. **Collapse or expand sidebar** on desktop; open/close nav drawer on mobile.
4. **View session continuity cues** — restored session label, thread count, continuity depth (mock percentage).
5. **Read continuity whispers** — observational suggestions derived from themes, unresolved loops, and session signals.
6. **Experience latent context** when no thread is selected — graph + semantic echoes.
7. **Resume cognitive state across visits** — captured thoughts, thread selection, and session metadata restore from local storage.

---

## Current interaction systems

| System | Behavior |
|--------|----------|
| Thread selection | Click row → `selectThread(id)` → feed highlight + context populate |
| Thread deselect | Mobile: close context panel → `selectThread(null)` |
| Sidebar toggle | Desktop: collapse/expand width; Mobile: open/close drawer + backdrop |
| Nav selection | Updates `activeNav` only; no page or feed change |
| Feed scroll | Document-level (main column); not trapped in inner scroll |
| Context scroll | `ScrollRegion` inside panel when content overflows |
| Motion | Framer Motion for layout, entrance, selection `layoutId`, drawers |
| Continuity persistence | Debounced `localStorage` snapshot; hydrate on load |

---

## Current design direction (summary)

- **Dark-first cognitive calm** — ambient gradients, glass chrome, low-contrast borders
- **Continuity metaphor** — spine, pulses, session restoration copy
- **Information architecture** — status-based feed sections, not kanban or inbox
- **Context panel** — latent intelligence vs thread-linked active context
- **Typography** — editorial hierarchy via Geist + semantic `type-*` classes
- **Motion** — slow, eased transitions; staggered reveals; no bounce

---

## Next planned milestones

Derived from mock `unresolvedContinuations`, in-code comments, and architectural gaps. **Order is suggestive, not committed.**

### Near term — foundation completion

1. **Motion vocabulary documentation in code** — patterns exist (`design.motion`, `layoutId`); formalize shared variants/helpers if motion grows.
2. **Wire navigation** — distinct routes or views per `NavItemId`; stop using placeholder `href: "/workspace"` for all items.
3. **URL state for selection** — `?thread=` (or similar) so refresh and share preserve context.
4. **Command surfaces** — implement ⌘K search palette stub (Capture overlay shipped).

### Medium term — continuity core

5. **Replace mock data layer** — API or remote store for base threads/context; local snapshot already holds captures + workspace selection (extend as needed).
6. **Semantic relations** — [x] latent graph is data-driven from concepts/relationships; refine taxonomy and cross-thread edges when backend exists.
7. **Resurfacing signals** — [x] whispers surface resurfaced/unresolved threads; extend with explicit status transitions when rules grow.
8. **Session bridge** — [x] local persist/restore shipped; extend with cross-device sync when backend exists.

### Longer term — platform

9. **Projects & timeline views** — nav entries exist but have no UI.
10. **Reflections flow** — nav placeholder.
11. **Real continuity depth metric** — [x] `computeContinuityDepth`; refine weights when more signals exist.
12. **Auth & multi-user** — profile button placeholder in topbar.

---

## Maintenance notes for AI sessions

- **Before changing UI tone**, read `docs/UI_PHILOSOPHY.md`.
- **Before moving files or state**, read `docs/ARCHITECTURE.md`.
- **After shipping a milestone**, update the checklists in this file.
- **Do not** expand scope into dashboard patterns, bright light themes, or dense card grids without explicit product direction.

---

## Key dependency versions

See `package.json`. Notable: Next `^15.3`, React `^19.1`, Tailwind `^4.1`, Framer Motion `^12.15`.
