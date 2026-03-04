// Load .env for auth tokens (needed in preview sandbox where env vars aren't inherited)
import dotenv from 'dotenv';
dotenv.config();

// Ensure npm global bin is on PATH for child processes (e.g. claude CLI)
import os from 'os';
import path from 'path';
const npmBin = path.join(os.homedir(), 'AppData', 'Roaming', 'npm');
if (process.env.PATH && !process.env.PATH.includes(npmBin)) {
  process.env.PATH = npmBin + ';' + process.env.PATH;
}

import express from 'express';
import cors from 'cors';
import { dialogueRouter } from './routes/dialogue.js';
import { objectsRouter } from './routes/objects.js';
import { graphRouter } from './routes/graph.js';
import { sessionsRouter } from './routes/sessions.js';
import { reasoningRouter } from './routes/reasoning.js';
import { metricsRouter } from './routes/metrics.js';
import { goalRouter } from './routes/goal.js';
import { suggestionRouter } from './routes/suggestion.js';
import { documentsRouter } from './routes/documents.js';

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
app.use('/api/metrics', metricsRouter);
app.use('/api/goal', goalRouter);
app.use('/api/suggestion', suggestionRouter);
app.use('/api/documents', documentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.listen(PORT, () => {
  console.log(`Threshold server running on port ${PORT}`);
});
