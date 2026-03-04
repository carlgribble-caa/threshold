import { Router } from 'express';
import { loadSessions, saveSession, loadObjects, deleteObject, saveGraph } from '../services/storage.js';

export const sessionsRouter = Router();

// Reset — clear all objects and edges (end session + fresh start)
sessionsRouter.post('/reset', async (req, res) => {
  try {
    const objects = await loadObjects().catch(() => []);
    await Promise.all(objects.map((o) => deleteObject(o.id)));
    await saveGraph({ edges: [], metadata: {} });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset' });
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
