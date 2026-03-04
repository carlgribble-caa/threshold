import { Router } from 'express';
import { loadGraph, saveGraph } from '../services/storage.js';

export const graphRouter = Router();

// Get full graph (nodes + edges)
graphRouter.get('/', async (req, res) => {
  try {
    const graph = await loadGraph();
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load graph' });
  }
});

// Confirm a proposed edge
graphRouter.post('/edges/confirm', async (req, res) => {
  const { fromId, toId, label } = req.body;

  try {
    const graph = await loadGraph();
    const edge = graph.edges.find((e) => e.from === fromId && e.to === toId);
    if (edge) {
      edge.status = 'confirmed';
    }
    await saveGraph(graph);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to confirm edge' });
  }
});

// Reject a proposed edge
graphRouter.post('/edges/reject', async (req, res) => {
  const { fromId, toId } = req.body;

  try {
    const graph = await loadGraph();
    graph.edges = graph.edges.filter((e) => !(e.from === fromId && e.to === toId));
    await saveGraph(graph);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject edge' });
  }
});
