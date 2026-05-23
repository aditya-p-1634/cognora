# Cognora — UI Philosophy

> **Purpose:** Encode the experiential intent behind the current UI so future work stays visually and emotionally consistent. This describes **implemented direction**, not aspirational redesign.

## North star

Cognora is a **continuity layer**, not a productivity dashboard. The interface should feel like **resuming a saved cognitive state** — threads reconnect, context surfaces without clutter, and the user is never forced into a “fresh start” metaphor.

Copy and structure reinforce this: e.g. feed hero *“Resuming your saved state”*, session strip *“Session restored”*, context header *“Latent intelligence”* vs *“Active context”*.

## Continuity-oriented UX

| Principle | How it appears today |
|-----------|----------------------|
| **State restoration over task lists** | Feed grouped by cognitive status (`Now in focus`, `Active threads`, `Unresolved`, `Resurfaced`), not by project or due date |
| **Thread as unit of thought** | Rows are narrative (title + excerpt + status), not compact checklist items |
| **Context on demand** | Right panel stays **latent** until a thread is selected; empty state explains waiting, not absence |
| **Gentle guidance** | `Continuity whispers` suggestions at feed bottom — observational tone, optional actions |
| **Anti-dashboard** | No dense widget grid; single-column feed with max width (`--width-feed`: ~52rem), generous vertical rhythm (`space-y-11` between sections) |
| **Session continuity** | `CognitiveStateStrip` shows restored session label, thread count, and “continuity depth” meter (mock 72%) |

**Interaction contract:** Selecting a thread updates feed highlight **and** populates the context panel. Deselecting (mobile close) returns to latent context.

## Emotional design goals

- **Calm** — Low visual noise, muted borders, soft shadows, no harsh whites.
- **Trustworthy presence** — Subtle pulses and shimmer on “live” indicators (session dot, continuity pulse), not alarming notifications.
- **Orientation without urgency** — Status labels (`Active`, `Unresolved`, `Resurfaced`, `In focus`) use color accent, not red/error semantics.
- **Warmth in guidance** — Suggestions and warm accent (`accent-warm`) for whispers; primary/calm accents for structure and focus.
- **Depth without intimidation** — Latent context graph and semantic echoes hint at intelligence; copy stays human (“Intelligently waiting”).

Avoid: gamification, streak counters, inbox-zero pressure, or card-heavy SaaS dashboards.

## Typography philosophy

**Fonts:** Geist Sans (UI), Geist Mono (timestamps, counts, shortcuts).

**Scale** (from `tokens.css`): Base `0.9375rem`; display `1.875rem`; stepped xs → 2xl. Slightly negative letter-spacing on body and titles for a refined, editorial feel.

**Semantic utilities** (`globals.css`):

| Class | Use |
|-------|-----|
| `type-display` | Feed hero headline — medium weight, tight leading |
| `type-label` | Section headers, panel labels — uppercase, wider tracking, muted |
| `type-prose` | Secondary explanatory copy (tertiary color, relaxed leading) |

**Hierarchy rules in practice:**

- Section labels: `type-label` + small status dot.
- Thread titles: `text-lg` / `text-xl` by prominence; primary focus thread is larger and semibold.
- Metadata: `text-xs`, often `font-mono` for time and counts.
- Line length: excerpts `max-w-prose`, hero subcopy `max-w-xl`, feed container centered with `max-width: var(--width-feed)`.

Prefer **readable density** over compact tables. Use `text-balance` on hero headlines.

## Motion philosophy

Motion supports **spatial continuity** and **calm attention**, not delight for its own sake.

**Easing & duration** (shared across CSS and Framer):

- **Calm:** `cubic-bezier(0.22, 1, 0.36, 1)` — default spatial shifts
- **Enter:** `cubic-bezier(0.16, 1, 0.3, 1)` — content appearing
- **Fast:** 140ms — hover nudges, micro feedback
- **Normal:** 260ms — opacity, panel content
- **Spatial:** 360ms — sidebar width, drawers, layout

**Patterns in use:**

- Staggered feed section entrance (`staggerChildren: 0.06`)
- `layout` / `layoutId="feed-selection"` on thread selection for connected motion
- Thread row `whileHover={{ x: 4 }}` — subtle forward drift along continuity spine
- Mobile drawers slide from edge with backdrop fade
- Ambient loops: hero label opacity breathe (~4.5s), `semantic-shimmer` / `continuity-drift` for latent echoes
- Progress bars animate width on mount (continuity depth)

**Avoid:** Bouncy springs, large scale transforms, fast flashing, or motion that blocks reading.

When adding motion, reuse `design.motion` from `src/config/design.ts` — do not introduce one-off durations.

## Spatial design principles

**Breathing room**

- Feed padding: `clamp` on x/y (`--spacing-feed-x`, `--spacing-feed-y`)
- Section spacing: `space-y-11` in feed; panel internal `space-y-8`
- Panel padding token: `--spacing-panel`, section: `--spacing-section`, extra: `--spacing-breath`

**Continuity spine**

- Vertical gradient line along feed thread list (`continuity-spine`)
- Echoed faintly in sidebar
- Thread nodes sit on spine with selection glow dot

**Surfaces**

| Surface | Treatment |
|---------|-----------|
| Workspace base | `workspace-ambient` — layered radial gradients |
| Feed | `feed-surface` — vertical gradient, top fade, soft accent blob |
| Panels / topbar | `glass-surface` — blur + semi-transparent bg |
| Cards | Avoid heavy cards; rows use hover wash (`thread-flow-hover`) |

**Width discipline**

- Feed content capped (~52rem) and centered
- Context panel fixed readable width on desktop
- Sidebar collapses to icon rail without losing nav affordance

**Dividers**

- `cognitive-divider` — horizontal gradient fade, not solid rules everywhere

## Cognitive atmosphere principles

**Latent vs active**

- **Latent:** Context panel shows graph placeholder, semantic echoes, shimmer copy — intelligence “waiting” for thread connection
- **Active:** Thread summary, related concepts, themes, unresolved continuations — structured but still calm

**Ambient layer**

- Blurred accent orbs in shell background (primary + calm)
- `context-atmosphere` on empty/latent panel
- Selection glow (`feed-selection-glow`, continuity pulse on active dot)

**Color semantics** (dark palette)

- **Primary accent** (`#8b9fd8`) — focus, selection, spine
- **Calm** (`#72a8a4`) — resurfaced, session health, secondary progress
- **Warm** (`#c9b08a`) — whispers, unresolved-adjacent warmth

Background stack: `bg-base` → `bg-feed` → `bg-panel` / `bg-glass` for elevation.

**Status language**

| Status | Meaning in UI |
|--------|----------------|
| `focus` | Current cognitive anchor — largest row treatment |
| `active` | In-flow work |
| `unresolved` | Open loop — warm accent label |
| `resurfaced` | Brought forward from past — calm accent; subdued section |

**Momentum** (high / medium / low) — lightweight indicator on threads; not a scoreboard.

## Accessibility & craft notes

- Decorative layers use `aria-hidden`; interactive controls have labels
- Lists use semantic `role="list"` where appropriate
- Focus rings use `--color-focus-ring`
- Dark scheme is default; no light theme yet

## Consistency checklist for new UI

1. Does it feel like **resuming state**, not starting a task list?
2. Are we using **tokens** and `type-*` utilities instead of one-off sizes?
3. Is motion **calm** and tied to `design.motion`?
4. Does density leave **vertical breath** between ideas?
5. Does context stay **latent until connected** to a thought object?
