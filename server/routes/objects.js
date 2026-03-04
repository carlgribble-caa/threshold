import { Router } from 'express';
import { loadObjects, saveObject, deleteObject } from '../services/storage.js';

export const objectsRouter = Router();

// Get all objects
objectsRouter.get('/', async (req, res) => {
  try {
    const objects = await loadObjects();
    res.json(objects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load objects' });
  }
});

// Crystallize an object (set status + position)
objectsRouter.post('/:id/crystallize', async (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  try {
    const objects = await loadObjects();
    const obj = objects.find((o) => o.id === id);
    if (!obj) return res.status(404).json({ error: 'Object not found' });

    obj.status = 'crystallized';
    obj.position = position;
    obj.updated = new Date().toISOString();

    await saveObject(obj);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to crystallize object' });
  }
});

// Update an object
objectsRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const objects = await loadObjects();
    const obj = objects.find((o) => o.id === id);
    if (!obj) return res.status(404).json({ error: 'Object not found' });

    Object.assign(obj, updates, { updated: new Date().toISOString() });
    await saveObject(obj);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update object' });
  }
});

// Delete (dismiss) an object
objectsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteObject(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete object' });
  }
});
