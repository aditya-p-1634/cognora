"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { design } from "@/config/design";
import type { LatentGraphSnapshot } from "@/lib/intelligence";

const VIEW_WIDTH = 280;
const VIEW_HEIGHT = 140;

interface LayoutNode {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
}

function layoutGraph(snapshot: LatentGraphSnapshot): {
  nodes: LayoutNode[];
  edges: { source: string; target: string }[];
} {
  const { nodes, edges } = snapshot;
  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const cx = VIEW_WIDTH / 2;
  const cy = VIEW_HEIGHT / 2;
  const radius = Math.min(VIEW_WIDTH, VIEW_HEIGHT) * 0.34;

  const laidOut = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      cx: cx + Math.cos(angle) * radius,
      cy: cy + Math.sin(angle) * radius,
      r: i === 0 ? 5 : 3,
    };
  });

  return { nodes: laidOut, edges };
}

interface ContextLatentGraphProps {
  graph: LatentGraphSnapshot;
}

export function ContextLatentGraph({ graph }: ContextLatentGraphProps) {
  const { nodes, edges } = useMemo(() => layoutGraph(graph), [graph]);
  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  if (nodes.length === 0) {
    return (
      <div
        className="mx-auto flex h-[140px] max-w-[280px] items-center justify-center text-center"
        aria-hidden
      >
        <p className="max-w-[12rem] text-[var(--text-xs)] leading-relaxed text-text-muted/80">
          Semantic relationships will gather as threads connect.
        </p>
      </div>
    );
  }

  return (
    <motion.svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className="mx-auto h-[140px] w-full max-w-[280px] text-accent-primary/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: design.motion.spatial, ease: design.motion.enter }}
      aria-hidden
    >
      <defs>
        <linearGradient id="edge-fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.45" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {edges.map((edge, i) => {
        const na = nodeMap[edge.source];
        const nb = nodeMap[edge.target];
        if (!na || !nb) return null;
        return (
          <motion.line
            key={`${edge.source}-${edge.target}`}
            x1={na.cx}
            y1={na.cy}
            x2={nb.cx}
            y2={nb.cy}
            stroke="url(#edge-fade)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            transition={{
              duration: design.motion.spatial,
              delay: 0.1 + i * 0.08,
              ease: design.motion.calm,
            }}
          />
        );
      })}

      {nodes.map((node, i) => (
        <motion.g key={node.id}>
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r={node.r * 3}
            fill="currentColor"
            className="semantic-shimmer text-accent-primary-muted"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + i * 0.06, duration: design.motion.normal }}
          />
          <circle
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            fill="currentColor"
            className="text-accent-primary/70"
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}
