"use client";

import { motion } from "framer-motion";
import {
  contextPanelContent,
  contextSectionReveal,
} from "@/lib/motion/context-transitions";
import type { ThoughtContext, ThoughtThread } from "@/types/workspace";
import { ContextThreadHeader } from "./context-thread-header";
import { RelatedConceptsList } from "./related-concepts-list";
import { SemanticRelationshipsList } from "./semantic-relationships-list";
import { ThemeTags } from "./theme-tags";
import { ContinuationList } from "./continuation-list";
import { ConnectedSessionsList } from "./connected-sessions-list";

interface ContextActiveViewProps {
  thread: ThoughtThread;
  context: ThoughtContext;
}

export function ContextActiveView({ thread, context }: ContextActiveViewProps) {
  return (
    <motion.div
      {...contextPanelContent}
      className="absolute inset-x-0 top-0 space-y-8"
    >
      <ContextThreadHeader thread={thread} summary={context.summary} />

      <div className="cognitive-divider opacity-60" />

      <motion.section {...contextSectionReveal(0.04)} className="space-y-4">
        <h3 className="type-label">Related concepts</h3>
        <RelatedConceptsList concepts={context.relatedConcepts} baseDelay={0.06} />
      </motion.section>

      <motion.section {...contextSectionReveal(0.08)} className="space-y-4">
        <h3 className="type-label">Semantic relationships</h3>
        <SemanticRelationshipsList
          relationships={context.semanticRelationships}
          baseDelay={0.1}
        />
      </motion.section>

      <motion.section {...contextSectionReveal(0.12)} className="space-y-4">
        <h3 className="type-label">Recurring themes</h3>
        <ThemeTags themes={context.recurringThemes} baseDelay={0.14} />
      </motion.section>

      <motion.section {...contextSectionReveal(0.16)} className="space-y-4">
        <h3 className="type-label">Unresolved continuations</h3>
        <ContinuationList
          items={context.unresolvedContinuations}
          baseDelay={0.18}
        />
      </motion.section>

      <motion.section {...contextSectionReveal(0.2)} className="space-y-4">
        <h3 className="type-label">Connected sessions</h3>
        <ConnectedSessionsList
          sessions={context.connectedSessions}
          baseDelay={0.22}
        />
      </motion.section>
    </motion.div>
  );
}
