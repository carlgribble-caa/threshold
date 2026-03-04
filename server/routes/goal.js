import { Router } from 'express';
import { loadGoal, saveGoal, deleteGoal } from '../services/storage.js';

export const goalRouter = Router();

// GET / — returns current goal or null
goalRouter.get('/', async (req, res) => {
  try {
    const goal = await loadGoal();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load goal' });
  }
});

// PUT / — create or update goal
goalRouter.put('/', async (req, res) => {
  const { text, outputFormat } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Goal text is required' });
  }
  try {
    const existing = await loadGoal();
    const goal = {
      text: text.trim(),
      outputFormat: outputFormat || 'other',
      created: existing?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    await saveGoal(goal);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save goal' });
  }
});

// DELETE / — clear goal
goalRouter.delete('/', async (req, res) => {
  try {
    await deleteGoal();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear goal' });
  }
});
