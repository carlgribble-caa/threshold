import { Router } from 'express';
import { sendToClaude } from '../services/claude.js';
import { extractObjects } from '../services/extractor.js';
import { loadObjects } from '../services/storage.js';

export const dialogueRouter = Router();

dialogueRouter.post('/', async (req, res) => {
  const { text, sessionId } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    // Load existing crystallized objects for context
    const existingObjects = await loadObjects().catch(() => []);
    const crystallized = existingObjects.filter((o) => o.status === 'crystallized');

    const claudeResponse = await sendToClaude(text, sessionId, crystallized);

    // Extract objects from Claude's response
    const extracted = extractObjects(claudeResponse);

    res.json({
      response: extracted.dialogue,
      objects: extracted.objects,
      connections: extracted.connections,
      suggestions: extracted.suggestions,
    });
  } catch (err) {
    console.error('Dialogue error:', err);
    res.status(500).json({ error: 'Failed to process dialogue' });
  }
});
