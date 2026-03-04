import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OBJECTS_DIR = path.join(DATA_DIR, 'objects');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const GRAPH_FILE = path.join(DATA_DIR, 'graph.json');

// Ensure directories exist
async function ensureDirs() {
  await fs.mkdir(OBJECTS_DIR, { recursive: true });
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

// Objects
export async function loadObjects() {
  await ensureDirs();
  try {
    const files = await fs.readdir(OBJECTS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    const objects = await Promise.all(
      jsonFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(OBJECTS_DIR, f), 'utf8');
        return JSON.parse(raw);
      })
    );
    return objects;
  } catch {
    return [];
  }
}

export async function saveObject(obj) {
  await ensureDirs();
  const filePath = path.join(OBJECTS_DIR, `${obj.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2));
}

export async function deleteObject(id) {
  const filePath = path.join(OBJECTS_DIR, `${id}.json`);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist yet (emerging objects not yet saved)
  }
}

// Graph (edges + metadata)
export async function loadGraph() {
  await ensureDirs();
  try {
    const raw = await fs.readFile(GRAPH_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { edges: [], metadata: {} };
  }
}

export async function saveGraph(graph) {
  await ensureDirs();
  await fs.writeFile(GRAPH_FILE, JSON.stringify(graph, null, 2));
}

// Sessions
export async function loadSessions() {
  await ensureDirs();
  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const yamlFiles = files.filter((f) => f.endsWith('.json'));
    const sessions = await Promise.all(
      yamlFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(SESSIONS_DIR, f), 'utf8');
        return JSON.parse(raw);
      })
    );
    return sessions;
  } catch {
    return [];
  }
}

export async function saveSession(session) {
  await ensureDirs();
  const filePath = path.join(SESSIONS_DIR, `${session.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(session, null, 2));
}
