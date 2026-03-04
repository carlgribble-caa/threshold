import { Router } from 'express';
import { getModel, setModel, getAvailableModels } from '../services/model-config.js';

export const settingsRouter = Router();

settingsRouter.get('/', (req, res) => {
  res.json({
    model: getModel(),
    availableModels: getAvailableModels(),
  });
});

settingsRouter.put('/model', (req, res) => {
  try {
    const { model } = req.body;
    if (!model) return res.status(400).json({ error: 'model is required' });
    const updated = setModel(model);
    res.json({ model: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
