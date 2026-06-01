"use client";
 
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  contextItemReveal,
  contextSectionReveal,
} from "@/lib/motion/context-transitions";
import type { RelatedThought, InfluenceField } from "@/lib/relationships";
import type { SemanticRelationship, ThoughtContext, ThoughtThread } from "@/types/workspace";
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
interface FieldDynamicsProps {
  thread: ThoughtThread;
  context: ThoughtContext;
  relatedThoughts: RelatedThought[];
  influenceField: InfluenceField;
  allThreads: ThoughtThread[];
  onSelectThread: (id: string) => void;
  baseDelay?: number;
}
 
// ─── Field Anchors ────────────────────────────────────────────────────────────
 
interface AnchorEntry {
  threadId: string;
  title: string;
  isSelectedThread: boolean;
}
 
function deriveAnchorEntries(
  fieldAnchorIds: string[],
  selectedThreadId: string,
  allThreads: ThoughtThread[]
): AnchorEntry[] {
  const threadById = new Map(allThreads.map((t) => [t.id, t]));
 
  return fieldAnchorIds
    .slice(0, 2)
    .flatMap((id) => {
      const t = threadById.get(id);
      if (!t) return [];
      return [{ threadId: id, title: t.title, isSelectedThread: id === selectedThreadId }];
    });
}
 
function FieldAnchorsSection({
  thread,
  influenceField,
  allThreads,
  onSelectThread,
  baseDelay,
}: {
  thread: ThoughtThread;
  influenceField: InfluenceField;
  allThreads: ThoughtThread[];
  onSelectThread: (id: string) => void;
  baseDelay: number;
}) {
  const { fieldAnchorIds } = influenceField;
  if (fieldAnchorIds.length === 0) return null;
 
  const selectedIsAnchor = fieldAnchorIds.includes(thread.id);
  const anchors = deriveAnchorEntries(fieldAnchorIds, thread.id, allThreads);
  if (anchors.length === 0) return null;
 
  return (
    <motion.section {...contextSectionReveal(baseDelay)} className="space-y-4">
      <div className="space-y-1">
        <h3 className="type-label">Field anchors</h3>
        <p className="text-[var(--text-xs)] leading-relaxed text-text-muted/85">
          {selectedIsAnchor
            ? "This thought draws the field toward it"
            : "Thoughts the field is currently organized around"}
        </p>
      </div>
 
      <ul className="space-y-1" role="list" aria-label="Field anchors">
        {anchors.map((anchor, i) => (
          <motion.li key={anchor.threadId} {...contextItemReveal(i, baseDelay + 0.02)}>
            {anchor.isSelectedThread ? (
              // The selected thought itself is an anchor — express outward, no nav needed
              <div className="flex items-start gap-3 px-3 py-2">
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-primary/70 ring-[3px] ring-accent-primary/16"
                  aria-hidden
                />
                <p className="text-[var(--text-sm)] leading-snug text-text-secondary">
                  {anchor.title}
                  <span className="ml-2 text-[var(--text-xs)] text-text-muted/70">
                    — this thought
                  </span>
                </p>
              </div>
            ) : (
              // Different anchor — navigable
              <button
                type="button"
                onClick={() => onSelectThread(anchor.threadId)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-[var(--radius-lg)]",
                  "px-3 py-2 text-left transition-colors duration-[var(--duration-fast)]",
                  "hover:bg-white/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full transition-transform duration-[var(--duration-fast)]",
                    "bg-accent-primary/55 ring-[2px] ring-accent-primary/12",
                    "group-hover:scale-110"
                  )}
                  aria-hidden
                />
                <p className="text-[var(--text-sm)] leading-snug text-text-secondary transition-colors group-hover:text-text-primary">
                  {anchor.title}
                </p>
              </button>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
 
// ─── Unresolved Pull ──────────────────────────────────────────────────────────
 
type PullKind = "continuation" | "adjacent-unresolved" | "tension";
 
interface PullEntry {
  id: string;
  kind: PullKind;
  label: string;
  threadId?: string; // present for adjacent-unresolved — enables navigation
}
 
function deriveUnresolvedPull(
  context: ThoughtContext,
  relatedThoughts: RelatedThought[]
): PullEntry[] {
  const entries: PullEntry[] = [];
  const seen = new Set<string>();
 
  // Source 1: context.unresolvedContinuations
  // First 2 only — the full list is already shown in "Unresolved continuations" below.
  // Expressed as: what this thought is still reaching toward.
  for (const continuation of context.unresolvedContinuations.slice(0, 2)) {
    const key = `cont:${continuation}`;
    if (!seen.has(key)) {
      seen.add(key);
      entries.push({ id: key, kind: "continuation", label: continuation });
    }
  }
 
  // Source 2: related thoughts where status === "unresolved"
  // These are adjacent thoughts still open — the field hasn't resolved around them.
  for (const rt of relatedThoughts) {
    if (rt.status !== "unresolved") continue;
    const key = `adj:${rt.threadId}`;
    if (!seen.has(key)) {
      seen.add(key);
      entries.push({
        id: key,
        kind: "adjacent-unresolved",
        label: rt.title,
        threadId: rt.threadId,
      });
    }
  }
 
  // Source 3: context.semanticRelationships where kind === "contrasts"
  // A contrasts relationship is a declared tension — two thoughts in the same
  // field holding different angles. Not resolved, not abandoned: still live.
  for (const rel of context.semanticRelationships) {
    if (rel.kind !== "contrasts") continue;
    const key = `contrast:${rel.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      // Express the tension in the cognitive register: source ↔ target as a condition
      entries.push({
        id: key,
        kind: "tension",
        label: `Tension between ${rel.source} and ${rel.target}`,
      });
    }
  }
 
  return entries;
}
 
// Quiet visual marker per pull kind
const pullKindDot: Record<PullKind, string> = {
  continuation:
    "bg-accent-warm/55",
  "adjacent-unresolved":
    "bg-accent-warm/40",
  tension:
    "bg-accent-calm/45",
};
 
// Prefix phrase — expresses the cognitive condition, not a task
const pullKindPrefix: Record<PullKind, string> = {
  continuation: "Still reaching toward",
  "adjacent-unresolved": "Adjacent open loop",
  tension: "",
};
 
function UnresolvedPullSection({
  context,
  relatedThoughts,
  onSelectThread,
  baseDelay,
}: {
  context: ThoughtContext;
  relatedThoughts: RelatedThought[];
  onSelectThread: (id: string) => void;
  baseDelay: number;
}) {
  const entries = deriveUnresolvedPull(context, relatedThoughts);
  if (entries.length === 0) return null;
 
  return (
    <motion.section {...contextSectionReveal(baseDelay)} className="space-y-4">
      <div className="space-y-1">
        <h3 className="type-label">Unresolved pull</h3>
        <p className="text-[var(--text-xs)] leading-relaxed text-text-muted/85">
          What this thought is still reaching toward
        </p>
      </div>
 
      <ul className="space-y-1" role="list" aria-label="Unresolved pull">
        {entries.map((entry, i) => (
          <motion.li key={entry.id} {...contextItemReveal(i, baseDelay + 0.02)}>
            {entry.kind === "adjacent-unresolved" && entry.threadId ? (
              // Navigable — clicking goes to the unresolved adjacent thought
              <button
                type="button"
                onClick={() => onSelectThread(entry.threadId!)}
                className={cn(
                  "group flex w-full items-start gap-3 rounded-[var(--radius-lg)]",
                  "px-3 py-2 text-left transition-colors duration-[var(--duration-fast)]",
                  "hover:bg-white/[0.03]"
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-transform duration-[var(--duration-fast)]",
                    pullKindDot[entry.kind],
                    "group-hover:scale-110"
                  )}
                  aria-hidden
                />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[var(--text-xs)] text-text-muted/75">
                    {pullKindPrefix[entry.kind]}
                  </p>
                  <p className="text-[var(--text-sm)] leading-snug text-text-secondary transition-colors group-hover:text-text-primary">
                    {entry.label}
                  </p>
                </div>
              </button>
            ) : (
              // Non-navigable — a condition, not a link
              <div className="flex items-start gap-3 px-3 py-2">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    pullKindDot[entry.kind]
                  )}
                  aria-hidden
                />
                <div className="min-w-0 space-y-0.5">
                  {pullKindPrefix[entry.kind] && (
                    <p className="text-[var(--text-xs)] text-text-muted/75">
                      {pullKindPrefix[entry.kind]}
                    </p>
                  )}
                  <p className="text-[var(--text-sm)] leading-snug text-text-tertiary">
                    {entry.label}
                  </p>
                </div>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
 
// ─── Field Dynamics (composed) ────────────────────────────────────────────────
 
export function FieldDynamics({
  thread,
  context,
  relatedThoughts,
  influenceField,
  allThreads,
  onSelectThread,
  baseDelay = 0,
}: FieldDynamicsProps) {
  const hasAnchors = influenceField.fieldAnchorIds.length > 0;
 
  const unresolvedPull = deriveUnresolvedPull(context, relatedThoughts);
  const hasUnresolvedPull = unresolvedPull.length > 0;
 
  // Don't render the section at all if neither subsection has content
  if (!hasAnchors && !hasUnresolvedPull) return null;
 
  return (
    <>
      <div className="cognitive-divider opacity-40" />
 
      <motion.div {...contextSectionReveal(baseDelay)} className="space-y-6">
        <div className="space-y-1">
          <h3 className="type-label tracking-[var(--tracking-wider)] text-text-muted/70">
            Field dynamics
          </h3>
        </div>
 
        <div className="space-y-6">
          <FieldAnchorsSection
            thread={thread}
            influenceField={influenceField}
            allThreads={allThreads}
            onSelectThread={onSelectThread}
            baseDelay={baseDelay + 0.02}
          />
 
          <UnresolvedPullSection
            context={context}
            relatedThoughts={relatedThoughts}
            onSelectThread={onSelectThread}
            baseDelay={baseDelay + (hasAnchors ? 0.06 : 0.02)}
          />
        </div>
      </motion.div>
    </>
  );
}