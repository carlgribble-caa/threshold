import { Router } from 'express';
import { loadObjects } from '../services/storage.js';
import { loadGraph } from '../services/storage.js';
import { computeMetrics } from '../services/metrics.js';

export const metricsRouter = Router();

metricsRouter.get('/', async (req, res) => {
  try {
    const objects = await loadObjects();
    const graph = await loadGraph();
    const metrics = computeMetrics(objects, graph.edges || []);
    res.json(metrics);
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ error: 'Failed to compute metrics' });
  }
});
