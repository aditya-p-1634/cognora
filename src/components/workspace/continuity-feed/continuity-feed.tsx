"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { design } from "@/config/design";
import { FeedHero } from "./feed-hero";
import { CognitiveStateStrip } from "./cognitive-state-strip";
import { FeedSection } from "./feed-section";
import { ThoughtThreadRow } from "./thought-thread-row";
import { ContinuitySuggestions } from "./continuity-suggestions";
import { ContinuitySpine } from "./continuity-spine";
import { sortThreadsByGravity } from "@/lib/gravity";
import {
  useCapture,
  useContinuityIntelligence,
  useFeedThreads,
  useMemoryGravity,
  useThreadSelection,
} from "@/providers/workspace-provider";

const sectionMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

function ThreadList({
  threads,
  selectedThreadId,
  hasThreadSelection,
  onSelect,
  primaryFirst,
  recentlyCapturedId,
  gravityWeights,
}: {
  threads: ReturnType<typeof useFeedThreads>;
  selectedThreadId: string | null;
  hasThreadSelection: boolean;
  onSelect: (id: string) => void;
  primaryFirst?: boolean;
  recentlyCapturedId: string | null;
  gravityWeights: Map<string, number>;
}) {
  return (
    <>
      {threads.map((thread, i) => {
        const selected = selectedThreadId === thread.id;
        const dimmed = hasThreadSelection && !selected;

        return (
          <ThoughtThreadRow
            key={thread.id}
            thread={thread}
            selected={selected}
            dimmed={dimmed}
            onSelect={() => onSelect(thread.id)}
            prominence={primaryFirst && i === 0 ? "primary" : "default"}
            isLast={i === threads.length - 1}
            isEmerging={recentlyCapturedId === thread.id}
            gravityWeight={gravityWeights.get(thread.id) ?? 0}
          />
        );
      })}
    </>
  );
}

export function ContinuityFeed() {
  const { selectedThreadId, hasThreadSelection, toggleThread } = useThreadSelection();
  const { recentlyCapturedId } = useCapture();
  const { suggestions } = useContinuityIntelligence();
  const { weights } = useMemoryGravity();
  const allThreads = useFeedThreads();

  const focus = allThreads.filter((t) => t.status === "focus");
  const active = sortThreadsByGravity(
    allThreads.filter((t) => t.status === "active"),
    weights
  );
  const unresolved = sortThreadsByGravity(
    allThreads.filter((t) => t.status === "unresolved"),
    weights
  );
  const resurfaced = sortThreadsByGravity(
    allThreads.filter((t) => t.status === "resurfaced"),
    weights
  );

  return (
    <div
      className={cn(
        "relative px-[var(--spacing-feed-x)] py-[var(--spacing-feed-y)]",
        hasThreadSelection && "feed-has-selection"
      )}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: "var(--width-feed)" }}
      >
        <FeedHero />
        <CognitiveStateStrip />

        <div className="relative pl-4 sm:pl-5">
          <ContinuitySpine
            hasThreadSelection={hasThreadSelection}
            selectedThreadId={selectedThreadId}
          />

          <motion.div
            className="space-y-11"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: { staggerChildren: 0.06, delayChildren: 0.08 },
              },
            }}
          >
            <motion.div
              variants={sectionMotion}
              transition={{ duration: design.motion.normal, ease: design.motion.enter }}
            >
              <FeedSection label="Now in focus" count={focus.length}>
                <ThreadList
                  threads={focus}
                  selectedThreadId={selectedThreadId}
                  hasThreadSelection={hasThreadSelection}
                  onSelect={toggleThread}
                  primaryFirst
                  recentlyCapturedId={recentlyCapturedId}
                  gravityWeights={weights}
                />
              </FeedSection>
            </motion.div>

            <motion.div
              variants={sectionMotion}
              transition={{ duration: design.motion.normal, ease: design.motion.enter }}
            >
              <FeedSection label="Active threads" count={active.length}>
                <ThreadList
                  threads={active}
                  selectedThreadId={selectedThreadId}
                  hasThreadSelection={hasThreadSelection}
                  onSelect={toggleThread}
                  recentlyCapturedId={recentlyCapturedId}
                  gravityWeights={weights}
                />
              </FeedSection>
            </motion.div>

            <motion.div
              variants={sectionMotion}
              transition={{ duration: design.motion.normal, ease: design.motion.enter }}
            >
              <FeedSection label="Unresolved" count={unresolved.length}>
                <ThreadList
                  threads={unresolved}
                  selectedThreadId={selectedThreadId}
                  hasThreadSelection={hasThreadSelection}
                  onSelect={toggleThread}
                  recentlyCapturedId={recentlyCapturedId}
                  gravityWeights={weights}
                />
              </FeedSection>
            </motion.div>

            <motion.div
              variants={sectionMotion}
              transition={{ duration: design.motion.normal, ease: design.motion.enter }}
            >
              <FeedSection label="Resurfaced" count={resurfaced.length} subdued>
                <ThreadList
                  threads={resurfaced}
                  selectedThreadId={selectedThreadId}
                  hasThreadSelection={hasThreadSelection}
                  onSelect={toggleThread}
                  recentlyCapturedId={recentlyCapturedId}
                  gravityWeights={weights}
                />
              </FeedSection>
            </motion.div>

            <motion.div
              variants={sectionMotion}
              transition={{ duration: design.motion.normal, ease: design.motion.enter }}
            >
              <ContinuitySuggestions suggestions={suggestions} />
            </motion.div>
          </motion.div>
        </div>

        <div className="h-12" aria-hidden />
      </div>
    </div>
  );
}
