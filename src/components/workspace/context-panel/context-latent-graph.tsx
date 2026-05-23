"use client";

import { motion } from "framer-motion";
import { design } from "@/config/design";

const nodes = [
  { id: "n1", cx: 80, cy: 48, r: 4 },
  { id: "n2", cx: 140, cy: 72, r: 3 },
  { id: "n3", cx: 200, cy: 40, r: 5 },
  { id: "n4", cx: 160, cy: 110, r: 3 },
  { id: "n5", cx: 100, cy: 100, r: 3 },
];

const edges: [string, string][] = [
  ["n1", "n2"],
  ["n2", "n3"],
  ["n2", "n4"],
  ["n1", "n5"],
  ["n5", "n4"],
  ["n3", "n4"],
];

const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

export function ContextLatentGraph() {
  return (
    <motion.svg
      viewBox="0 0 280 140"
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

      {edges.map(([a, b], i) => {
        const na = nodeMap[a];
        const nb = nodeMap[b];
        if (!na || !nb) return null;
        return (
          <motion.line
            key={`${a}-${b}`}
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
