import { Router } from 'express';
import { getCurrentSuggestion, generateSuggestion, clearSuggestion } from '../services/suggest.js';

export const suggestionRouter = Router();

// GET / — returns current suggestion or null
suggestionRouter.get('/', (req, res) => {
  res.json(getCurrentSuggestion());
});

// POST / — generate new suggestion (blocks until done)
suggestionRouter.post('/', async (req, res) => {
  try {
    const suggestion = await generateSuggestion();
    res.json(suggestion);
  } catch (err) {
    console.error('Suggestion error:', err);
    res.status(500).json({ error: 'Failed to generate suggestion' });
  }
});

// POST /auto — fire-and-forget background generation
suggestionRouter.post('/auto', (req, res) => {
  generateSuggestion().catch(err => {
    console.error('Auto-suggest error:', err);
  });
  res.json({ ok: true, status: 'generating' });
});

// DELETE / — dismiss current suggestion
suggestionRouter.delete('/', (req, res) => {
  clearSuggestion();
  res.json({ ok: true });
});
