// Metrics — graph analysis using graphology
// Phase 3/4 stub

import Graph from 'graphology';

export function computeMetrics(objects, edges) {
  const graph = new Graph();

  // Build graph from objects and edges
  for (const obj of objects) {
    if (obj.status !== 'archived') {
      graph.addNode(obj.id, obj);
    }
  }

  for (const edge of edges) {
    if (graph.hasNode(edge.from) && graph.hasNode(edge.to)) {
      graph.addEdge(edge.from, edge.to, { label: edge.label });
    }
  }

  return {
    nodeCount: graph.order,
    edgeCount: graph.size,
    // TODO: Add centrality, community detection, etc.
  };
}
