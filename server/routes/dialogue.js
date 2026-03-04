import { Router } from 'express';
import { sendToClaude } from '../services/claude.js';
import { extractObjects } from '../services/extractor.js';

export const dialogueRouter = Router();

dialogueRouter.post('/', async (req, res) => {
  const { text, sessionId } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  try {
    const claudeResponse = await sendToClaude(text, sessionId);

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
