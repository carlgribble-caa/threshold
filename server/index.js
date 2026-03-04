import express from 'express';
import cors from 'cors';
import { dialogueRouter } from './routes/dialogue.js';
import { objectsRouter } from './routes/objects.js';
import { graphRouter } from './routes/graph.js';
import { sessionsRouter } from './routes/sessions.js';
import { reasoningRouter } from './routes/reasoning.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/dialogue', dialogueRouter);
app.use('/api/objects', objectsRouter);
app.use('/api/graph', graphRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/reasoning', reasoningRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Threshold server running on port ${PORT}`);
});
