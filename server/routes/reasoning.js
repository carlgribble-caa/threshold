import { Router } from 'express';
import { executeReasoning, OPERATIONS_FOR_TYPE } from '../services/reasoner.js';
import { extractObjects } from '../services/extractor.js';
import { loadObjects, loadGraph } from '../services/storage.js';

export const reasoningRouter = Router();

// Get available operations for an object type
reasoningRouter.get('/operations/:type', (req, res) => {
  const ops = OPERATIONS_FOR_TYPE[req.params.type] || ['challenge', 'bridge'];
  res.json({ operations: ops });
});

// Execute a reasoning operation
reasoningRouter.post('/execute', async (req, res) => {
  const { operation, targetId } = req.body;

  if (!operation || !targetId) {
    return res.status(400).json({ error: 'operation and targetId required' });
  }

  try {
    const [objects, graph] = await Promise.all([
      loadObjects().catch(() => []),
      loadGraph().catch(() => ({ edges: [] })),
    ]);

    const target = objects.find((o) => o.id === targetId);
    if (!target) {
      return res.status(404).json({ error: 'Target object not found' });
    }

    const crystallized = objects.filter((o) => o.status === 'crystallized');
    const rawResponse = await executeReasoning(operation, target, crystallized, graph.edges || []);

    // Parse the response using the same extractor as dialogue
    const extracted = extractObjects(rawResponse);

    res.json({
      operation,
      targetId,
      objects: extracted.objects,
      connections: extracted.connections,
    });
  } catch (err) {
    console.error('Reasoning error:', err);
    res.status(500).json({ error: 'Failed to execute reasoning operation' });
  }
});
