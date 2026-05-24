import type { ThoughtContext } from "@/types/workspace";
import type { LatentGraphSnapshot } from "@/lib/intelligence/types";

const MAX_NODES = 5;

export function deriveLatentGraph(
  contextByThreadId: Record<string, ThoughtContext>
): LatentGraphSnapshot {
  const conceptScores = new Map<string, number>();

  for (const context of Object.values(contextByThreadId)) {
    for (const concept of context.relatedConcepts) {
      const label = concept.label.trim();
      if (!label) continue;
      const weight = concept.affinity === "strong" ? 3 : concept.affinity === "moderate" ? 2 : 1;
      conceptScores.set(label, (conceptScores.get(label) ?? 0) + weight);
    }
  }

  const nodes = [...conceptScores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_NODES)
    .map(([label], i) => ({
      id: `lg-${i}`,
      label,
    }));

  if (nodes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const labelToId = new Map(nodes.map((node) => [node.label.toLowerCase(), node.id]));
  const edgeKeys = new Set<string>();
  const edges: LatentGraphSnapshot["edges"] = [];

  const link = (sourceLabel: string, targetLabel: string) => {
    const source = labelToId.get(sourceLabel.toLowerCase());
    const target = labelToId.get(targetLabel.toLowerCase());
    if (!source || !target || source === target) return;

    const key = [source, target].sort().join("|");
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target });
  };

  for (const context of Object.values(contextByThreadId)) {
    for (const relation of context.semanticRelationships) {
      link(relation.source, relation.target);
    }
  }

  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({ source: nodes[i].id, target: nodes[i + 1].id });
    }
  }

  return { nodes, edges };
}
