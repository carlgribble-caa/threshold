// Metrics — graph analysis using graphology + graphology-metrics

import Graph from 'graphology';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const degreeModule = require('graphology-metrics/centrality/degree');
const betweennessModule = require('graphology-metrics/centrality/betweenness');
const densityModule = require('graphology-metrics/graph/density');

const degreeCentrality = degreeModule.degreeCentrality || degreeModule;
const betweennessCentrality = betweennessModule.betweennessCentrality || betweennessModule;
const density = densityModule.density || densityModule;

// Keywords for reasoning coverage heuristics
const CHALLENGE_KEYWORDS = ['challenge', 'contradict', 'counter', 'refute', 'dispute', 'oppose', 'question', 'undermine'];
const SUPPORT_KEYWORDS = ['support', 'ground', 'evidence', 'prove', 'justif', 'confirm', 'substantiate', 'back'];
const RESOLVE_KEYWORDS = ['resolve', 'synthesize', 'reconcile', 'bridge', 'integrate', 'harmonize', 'unite'];

function labelContains(label, keywords) {
  const l = (label || '').toLowerCase();
  return keywords.some(k => l.includes(k));
}

// Find connected components via BFS
function findComponents(graph) {
  const visited = new Set();
  const components = [];

  graph.forEachNode((node) => {
    if (visited.has(node)) return;
    const component = [];
    const queue = [node];
    visited.add(node);
    while (queue.length > 0) {
      const current = queue.shift();
      component.push(current);
      graph.forEachNeighbor(current, (neighbor) => {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      });
    }
    components.push(component);
  });

  return components;
}

// Clustering coefficient per node (undirected treatment)
function clusteringCoefficient(graph, node) {
  const neighbors = graph.neighbors(node);
  const k = neighbors.length;
  if (k < 2) return 0;

  let edgesAmongNeighbors = 0;
  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      if (graph.hasEdge(neighbors[i], neighbors[j]) || graph.hasEdge(neighbors[j], neighbors[i])) {
        edgesAmongNeighbors++;
      }
    }
  }
  return (2 * edgesAmongNeighbors) / (k * (k - 1));
}

export function computeMetrics(objects, edges) {
  const crystallized = objects.filter(o => o.status === 'crystallized');
  if (crystallized.length === 0) {
    return { nodes: {}, graph: { density: 0, connectedComponents: 0, isolatedNodes: [], nodeCount: 0, edgeCount: 0, mostConnected: [], bridgeObjects: [], unchallengedClaims: [], unsupportedClaims: [], unresolvedTensions: [] } };
  }

  // Build undirected graph for structural metrics
  const graph = new Graph({ type: 'undirected', multi: false });
  const nodeMap = {};

  for (const obj of crystallized) {
    graph.addNode(obj.id, { label: obj.label, type: obj.type });
    nodeMap[obj.id] = obj;
  }

  const confirmedEdges = edges.filter(e => e.status === 'confirmed');
  for (const edge of confirmedEdges) {
    if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
      try {
        graph.addEdge(edge.source, edge.target, { label: edge.label });
      } catch {
        // Skip duplicate edges
      }
    }
  }

  // Structural metrics
  let degCentrality = {};
  let betCentrality = {};
  let graphDensity = 0;

  if (graph.order > 1) {
    degCentrality = degreeCentrality(graph);
    betCentrality = betweennessCentrality(graph, { normalized: true });
    graphDensity = density(graph);
  }

  const components = findComponents(graph);
  const isolatedNodeIds = [];
  graph.forEachNode((node) => {
    if (graph.degree(node) === 0) isolatedNodeIds.push(node);
  });

  // Betweenness threshold for "bridge" designation — top 20% or > 0.05
  const betValues = Object.values(betCentrality).filter(v => v > 0).sort((a, b) => b - a);
  const bridgeThreshold = betValues.length > 0 ? Math.max(betValues[Math.floor(betValues.length * 0.2)] || 0, 0.05) : 0.05;

  // Build directed graph for reasoning coverage (edge direction matters)
  const dirGraph = new Graph({ type: 'directed', multi: false });
  for (const obj of crystallized) {
    dirGraph.addNode(obj.id, { label: obj.label, type: obj.type });
  }
  for (const edge of confirmedEdges) {
    if (dirGraph.hasNode(edge.source) && dirGraph.hasNode(edge.target)) {
      try {
        dirGraph.addEdge(edge.source, edge.target, { label: edge.label });
      } catch {
        // Skip duplicates
      }
    }
  }

  // Per-node metrics
  const nodeMetrics = {};
  for (const obj of crystallized) {
    const id = obj.id;
    const deg = degCentrality[id] || 0;
    const bet = betCentrality[id] || 0;
    const cc = clusteringCoefficient(graph, id);
    const isolated = graph.degree(id) === 0;
    const isBridge = bet >= bridgeThreshold && !isolated;

    // Reasoning coverage
    let isUnchallengedClaim = false;
    let isUnsupportedClaim = false;
    let isUnresolvedTension = false;

    if (obj.type === 'claim') {
      // Check incoming edges for challenge keywords
      const hasChallenge = dirGraph.inEdges(id).some(e => labelContains(dirGraph.getEdgeAttribute(e, 'label'), CHALLENGE_KEYWORDS));
      isUnchallengedClaim = !hasChallenge;

      // Check for evidence support
      const hasSupport = dirGraph.inEdges(id).some(e => {
        const sourceType = dirGraph.getNodeAttribute(dirGraph.source(e), 'type');
        return sourceType === 'evidence' || labelContains(dirGraph.getEdgeAttribute(e, 'label'), SUPPORT_KEYWORDS);
      });
      isUnsupportedClaim = !hasSupport;
    }

    if (obj.type === 'tension') {
      const hasResolution = dirGraph.inEdges(id).some(e => labelContains(dirGraph.getEdgeAttribute(e, 'label'), RESOLVE_KEYWORDS));
      // Also check outgoing edges (resolution might go either direction)
      const hasOutResolution = dirGraph.outEdges(id).some(e => labelContains(dirGraph.getEdgeAttribute(e, 'label'), RESOLVE_KEYWORDS));
      isUnresolvedTension = !hasResolution && !hasOutResolution;
    }

    nodeMetrics[id] = {
      degreeCentrality: deg,
      betweennessCentrality: bet,
      clusteringCoefficient: cc,
      isIsolated: isolated,
      isBridge,
      isUnchallengedClaim,
      isUnsupportedClaim,
      isUnresolvedTension,
    };
  }

  // Display lists
  const mostConnected = crystallized
    .map(o => ({ id: o.id, label: o.label, degree: graph.degree(o.id) }))
    .filter(o => o.degree > 0)
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 5);

  const bridgeObjects = crystallized
    .map(o => ({ id: o.id, label: o.label, betweenness: betCentrality[o.id] || 0 }))
    .filter(o => o.betweenness >= bridgeThreshold)
    .sort((a, b) => b.betweenness - a.betweenness)
    .slice(0, 3);

  const unchallengedClaims = crystallized.filter(o => nodeMetrics[o.id]?.isUnchallengedClaim).map(o => ({ id: o.id, label: o.label }));
  const unsupportedClaims = crystallized.filter(o => nodeMetrics[o.id]?.isUnsupportedClaim).map(o => ({ id: o.id, label: o.label }));
  const unresolvedTensions = crystallized.filter(o => nodeMetrics[o.id]?.isUnresolvedTension).map(o => ({ id: o.id, label: o.label }));

  return {
    nodes: nodeMetrics,
    graph: {
      density: graphDensity,
      connectedComponents: components.length,
      isolatedNodes: isolatedNodeIds,
      nodeCount: graph.order,
      edgeCount: graph.size,
      mostConnected,
      bridgeObjects,
      unchallengedClaims,
      unsupportedClaims,
      unresolvedTensions,
    },
  };
}
