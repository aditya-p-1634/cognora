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
| Persistence (local or remote) | None |
| Authentication | None |
| Real navigation routes | All nav items link to `/workspace`; switching nav id does not change view |
| Global search | Input + ⌘K hint only |
| Capture flow | Implemented — ambient overlay, draft state, mock thread insertion |
| Suggestion actions | Buttons present, no handlers |
| Light theme | Dark only |
| Tests | None in repo |
| README | Not present |

---

## Current workspace features (user-visible)

1. **Browse thought threads** grouped by cognitive status along a visual timeline spine.
2. **Select a thread** to highlight it in the feed and load structured context in the right panel.
3. **Collapse or expand sidebar** on desktop; open/close nav drawer on mobile.
4. **View session continuity cues** — restored session label, thread count, continuity depth (mock percentage).
5. **Read continuity whispers** — passive suggestions at the bottom of the feed.
6. **Experience latent context** when no thread is selected — graph + semantic echoes.

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

5. **Replace mock data layer** — API or local store for threads, context, sessions; keep `WorkspaceProvider` contract stable where possible.
6. **Semantic relations** — evolve `ContextRelation` / graph from decorative SVG to data-driven (per mock thread `t2`: “edges without taxonomy”).
7. **Resurfacing signals** — connect feed status transitions and whispers to real rules or user actions.
8. **Session bridge** — persist and restore session across visits (per mock thread `t3`).

### Longer term — platform

9. **Projects & timeline views** — nav entries exist but have no UI.
10. **Reflections flow** — nav placeholder.
11. **Real continuity depth metric** — replace hardcoded `72%` with computed signal.
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
