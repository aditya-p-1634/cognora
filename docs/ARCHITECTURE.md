# Cognora — Architecture

> **Purpose:** Give AI-assisted sessions a stable map of the frontend system. Document what exists; do not treat this file as a redesign spec.

## Product scope (current)

Cognora is a **cognitive continuity platform** — a continuity layer for human cognition. The implemented surface is a **single workspace** (`/workspace`) with mock data. There is no API layer, persistence, or auth yet.

## Stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 15 (App Router, Turbopack in dev) |
| UI | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) |
| Motion | Framer Motion 12 |
| Icons | Lucide React |
| Utilities | `clsx` + `tailwind-merge` (`cn`), `class-variance-authority` (buttons) |

**Path alias:** `@/*` → `src/*` (see `tsconfig.json`).

## Routing

| Route | Behavior |
|-------|----------|
| `/` | Server redirect → `/workspace` |
| `/workspace` | Main app: `WorkspaceProvider` + `WorkspaceShell` |

Root layout (`src/app/layout.tsx`) loads Geist Sans / Geist Mono, applies `globals.css`, and sets metadata (`title: Cognora`, `description: A continuity layer for human cognition.`).

## Frontend architecture

### Server vs client boundary

- **Server components:** `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/workspace/page.tsx` (thin composition only).
- **Client components:** Anything with interactivity, Framer Motion, hooks, or context — marked `"use client"`. The workspace tree is almost entirely client-rendered below the page shell.

### Composition model

```
/workspace (page)
└── WorkspaceProvider          ← workspace selection state
    └── WorkspaceShell         ← spatial layout + responsive chrome
        ├── WorkspaceTopbar
        ├── WorkspaceSidebar
        └── <main>
            ├── ContinuityFeed   ← primary scroll surface
            └── ContextPanel     ← thread-linked context (desktop sticky / mobile drawer)
```

`useSidebar()` is **local to `WorkspaceShell`** — collapse, mobile drawer, and breakpoint behavior are intentionally **not** in `WorkspaceProvider`.

### Layout system

Three-region **workspace shell** with a full-width topbar:

1. **Topbar** — sticky, glass surface, global search UI, session pill, capture CTA (UI only).
2. **Sidebar** — collapsible on desktop (`lg+`); fixed overlay drawer on mobile. Widths from `design.layout` (256px expanded / 72px collapsed).
3. **Main** — flex row: **continuity feed** (flex-1, document scroll) + **context panel** (384px max / `min(24rem, 30vw)` on desktop).

**Height contract:** Side panels and context use `calc(100dvh - var(--height-topbar))` via `workspacePanelHeight` in `workspace-shell.tsx` so sticky panels scroll independently of the feed.

**Layout primitives** (`src/components/layout/`):

| Component | Role |
|-----------|------|
| `WorkspaceShell` | Ambient background, topbar + sidebar + main orchestration |
| `Panel` | Motion-wrapped surface (`default` \| `glass` \| `inset`) |
| `PanelHeader` / `PanelSection` | Repeated panel chrome (available; feed uses custom sections) |
| `ScrollRegion` | Bounded `overflow-y-auto` for context panel / drawers — **not** the main feed |

**Z-index** — centralized in `src/config/design.ts` (`topbar`, `backdrop`, `contextMobile`, `sidebarMobile`).

### Design configuration (two layers)

1. **`src/styles/tokens.css`** — CSS custom properties via Tailwind v4 `@theme inline` (colors, spacing, typography, motion durations, layout widths).
2. **`src/config/design.ts`** — JS constants for Framer Motion (easing curves, durations) and layout numbers used in `animate` / `style` props.

Keep motion timing aligned: tokens use `--duration-*` and `--ease-*`; `design.motion` mirrors them for Framer.

### State philosophy

**Principle:** Minimal global state; derive everything possible from selection + mock lookups.

| Concern | Where | Notes |
|---------|--------|-------|
| Active nav item | `WorkspaceProvider` (`activeNav`) | Visual only — all nav `href`s point to `/workspace`; no route switching yet |
| Selected thought thread | `WorkspaceProvider` (`selectedThreadId`) | Drives feed selection UI + context panel |
| Derived thread + context | `useMemo` in provider | `selectedThread` from `mockThreads`; `context` from `getContextForThread()` |
| Sidebar collapse / mobile open | `useSidebar` hook | Responsive; resets on breakpoint change |
| Feed data | `src/data/mock/workspace.ts` | Static — not in React state |

**Access:** `useWorkspace()` — throws if used outside `WorkspaceProvider`.

**Persistent continuity (local):** `src/lib/persistence/` owns `localStorage` (`cognora.continuity.v1`, schema v2). Each `PersistedCognitiveThought` stores full capture payload plus feed/context projections. `useWorkspacePersistence` hydrates on mount; debounced save + immediate flush on capture + `pagehide` guard. `WorkspaceProvider` keeps `persistedThoughts` as source of truth; `src/lib/continuity/` supplies depth, merge, and session formatting.

**Continuity intelligence (client):** `src/lib/intelligence/` derives whispers, latent semantic echoes, and a lightweight latent graph from merged feed threads + contexts (mock + persisted). `computeContinuityIntelligence()` runs in `WorkspaceProvider`; UI reads via `useContinuityIntelligence()`.

**Not yet present:** URL-synced selection, server state, global stores (Zustand/Redux), React Query, or optimistic updates.

### Component organization

```
src/
├── app/                    # Next.js routes + globals.css
├── components/
│   ├── layout/             # Shell, panels, scroll regions
│   ├── ui/                 # Primitives (Button, Input, Badge, IconButton)
│   └── workspace/          # Feature UI by workspace region
│       ├── sidebar/
│       ├── topbar/
│       ├── continuity-feed/
│       └── context-panel/
├── config/                 # navigation.ts, design.ts
├── data/mock/              # workspace mock data + context map
├── hooks/                  # use-sidebar, use-media-query
├── lib/                    # cn(), continuity, persistence, intelligence
├── providers/              # workspace-provider.tsx
├── styles/                 # tokens.css
└── types/                  # workspace domain types
```

**Conventions for new work:**

- Add **region-specific** UI under `components/workspace/<region>/`.
- Add **cross-cutting primitives** under `components/ui/` or `components/layout/`.
- Add **domain types** to `src/types/workspace.ts` (or split file when it grows).
- Add **static fixtures** to `src/data/mock/` until a real data layer exists.
- Prefer **colocated** small components (e.g. `thought-thread-row.tsx` next to `continuity-feed.tsx`).

### Domain model (frontend types)

Defined in `src/types/workspace.ts`:

- `ThoughtThread` — `status`: `active` \| `unresolved` \| `resurfaced` \| `focus`; optional `momentum`, `projectLabel`
- `ThoughtContext` — summary, `relations`, `recurringThemes`, `unresolvedContinuations`
- `ContinuitySuggestion`, `ActiveSession`, `ContextRelation`

### Styling approach

- **Dark-first** (`color-scheme: dark` in `globals.css`).
- Semantic utility classes in `globals.css` (`type-display`, `type-label`, `panel-surface`, `glass-surface`, `workspace-ambient`, `continuity-spine`, etc.).
- Tailwind theme colors map to CSS variables (e.g. `bg-bg-base`, `text-text-primary`, `accent-primary`).
- Component styles: mostly Tailwind classes; motion via Framer + `design.motion`.

### Responsive behavior

- Breakpoint `lg` (1024px) from `hooks/use-media-query.ts` is the primary desktop threshold.
- Below `lg`: sidebar is off-canvas; context panel is a right drawer when a thread is selected.
- `WorkspaceShell` renders backdrop overlays for mobile sidebar and context drawer.

## Extension points (when building next)

1. **Data layer** — Replace `mockThreads` / `contextMap` with API or local persistence; keep provider shape if possible.
2. **Routing** — Wire `config/navigation.ts` `href`s to real routes; optionally sync `selectedThreadId` to search params.
3. **Search / Capture** — Topbar and suggestion actions are presentational; hook to commands or modals.
4. **New regions** — Follow existing shell slots; avoid nesting unrelated features inside feed components.

## Files AI sessions should read first

1. `src/components/layout/workspace-shell.tsx` — spatial structure
2. `src/providers/workspace-provider.tsx` — state contract
3. `src/styles/tokens.css` + `src/config/design.ts` — visual/motion system
4. `src/types/workspace.ts` + `src/data/mock/workspace.ts` — domain + fixtures
5. `src/components/workspace/continuity-feed/continuity-feed.tsx` — primary content IA
