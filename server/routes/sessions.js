import { Router } from 'express';
import {
  loadSessions, saveSession, loadObjects, deleteObject, saveGraph, deleteGoal,
  archiveCanvas, listArchives, loadArchive, deleteArchive,
} from '../services/storage.js';

export const sessionsRouter = Router();

// Reset — clear all objects and edges (end session + fresh start)
sessionsRouter.post('/reset', async (req, res) => {
  try {
    const objects = await loadObjects().catch(() => []);
    await Promise.all(objects.map((o) => deleteObject(o.id)));
    await saveGraph({ edges: [], metadata: {} });
    await deleteGoal();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset' });
  }
});

// Archive current canvas + reset (New Canvas)
sessionsRouter.post('/archive', async (req, res) => {
  const { name } = req.body;
  try {
    // Check if there's anything to archive
    const objects = await loadObjects().catch(() => []);
    if (objects.length === 0) {
      return res.json({ archived: null, message: 'Nothing to archive' });
    }

    const meta = await archiveCanvas(name);

    // Reset current canvas
    await Promise.all(objects.map((o) => deleteObject(o.id)));
    await saveGraph({ edges: [], metadata: {} });
    await deleteGoal();

    res.json({ archived: meta });
  } catch (err) {
    console.error('Archive error:', err);
    res.status(500).json({ error: 'Failed to archive canvas' });
  }
});

// List all archived canvases
sessionsRouter.get('/archives', async (req, res) => {
  try {
    const archives = await listArchives();
    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list archives' });
  }
});

// Load an archived canvas (replaces current)
sessionsRouter.post('/archives/:id/load', async (req, res) => {
  const { id } = req.params;
  try {
    // Archive current canvas first if non-empty
    const currentObjects = await loadObjects().catch(() => []);
    if (currentObjects.length > 0) {
      await archiveCanvas();
    }

    const meta = await loadArchive(id);
    res.json({ loaded: meta });
  } catch (err) {
    console.error('Load archive error:', err);
    res.status(500).json({ error: 'Failed to load archive' });
  }
});

// Delete an archived canvas
sessionsRouter.delete('/archives/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteArchive(id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete archive' });
  }
});

// Get all sessions
sessionsRouter.get('/', async (req, res) => {
  try {
    const sessions = await loadSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load sessions' });
  }
});

// Start a new session
sessionsRouter.post('/', async (req, res) => {
  const { name } = req.body;

  const session = {
    id: crypto.randomUUID(),
    name: name || `Session ${new Date().toLocaleDateString()}`,
    started: new Date().toISOString(),
    ended: null,
    objectsCreated: 0,
    operationsPerformed: 0,
  };

  try {
    await saveSession(session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// End a session
sessionsRouter.post('/:id/end', async (req, res) => {
  const { id } = req.params;

  try {
    const sessions = await loadSessions();
    const session = sessions.find((s) => s.id === id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.ended = new Date().toISOString();
    await saveSession(session);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to end session' });
  }
});
