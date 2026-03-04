import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const OBJECTS_DIR = path.join(DATA_DIR, 'objects');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');
const ARCHIVES_DIR = path.join(DATA_DIR, 'archives');
const GRAPH_FILE = path.join(DATA_DIR, 'graph.json');
const GOAL_FILE = path.join(DATA_DIR, 'goal.json');

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

// Goal (singleton)
export async function loadGoal() {
  try {
    const raw = await fs.readFile(GOAL_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveGoal(goal) {
  await fs.writeFile(GOAL_FILE, JSON.stringify(goal, null, 2));
}

export async function deleteGoal() {
  try {
    await fs.unlink(GOAL_FILE);
  } catch {
    // File may not exist
  }
}

// Archives — snapshot a full canvas (objects + graph + goal) for later restoration

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src).catch(() => []);
  for (const entry of entries) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    const stat = await fs.stat(srcPath);
    if (stat.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function removeDir(dir) {
  const entries = await fs.readdir(dir).catch(() => []);
  for (const entry of entries) {
    const p = path.join(dir, entry);
    const stat = await fs.stat(p);
    if (stat.isDirectory()) {
      await removeDir(p);
    } else {
      await fs.unlink(p);
    }
  }
  await fs.rmdir(dir);
}

export async function archiveCanvas(name) {
  const id = crypto.randomUUID();
  const archiveDir = path.join(ARCHIVES_DIR, id);
  const archiveObjectsDir = path.join(archiveDir, 'objects');

  await fs.mkdir(archiveDir, { recursive: true });

  // Copy objects
  await copyDir(OBJECTS_DIR, archiveObjectsDir);

  // Copy graph
  try {
    await fs.copyFile(GRAPH_FILE, path.join(archiveDir, 'graph.json'));
  } catch { /* no graph yet */ }

  // Copy goal
  try {
    await fs.copyFile(GOAL_FILE, path.join(archiveDir, 'goal.json'));
  } catch { /* no goal */ }

  // Count for metadata
  const objects = await loadObjects().catch(() => []);
  const graph = await loadGraph().catch(() => ({ edges: [] }));

  const meta = {
    id,
    name: name || `Canvas ${new Date().toLocaleDateString()}`,
    archivedAt: new Date().toISOString(),
    objectCount: objects.length,
    edgeCount: (graph.edges || []).length,
  };
  await fs.writeFile(path.join(archiveDir, 'meta.json'), JSON.stringify(meta, null, 2));

  return meta;
}

export async function listArchives() {
  await fs.mkdir(ARCHIVES_DIR, { recursive: true });
  const entries = await fs.readdir(ARCHIVES_DIR).catch(() => []);
  const archives = [];

  for (const entry of entries) {
    const metaPath = path.join(ARCHIVES_DIR, entry, 'meta.json');
    try {
      const raw = await fs.readFile(metaPath, 'utf8');
      archives.push(JSON.parse(raw));
    } catch { /* skip invalid */ }
  }

  return archives.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
}

export async function loadArchive(id) {
  const archiveDir = path.join(ARCHIVES_DIR, id);
  const metaPath = path.join(archiveDir, 'meta.json');

  // Verify archive exists
  await fs.access(metaPath);

  // Clear current canvas
  const currentObjects = await loadObjects().catch(() => []);
  for (const obj of currentObjects) {
    await deleteObject(obj.id);
  }

  // Restore objects
  const archiveObjectsDir = path.join(archiveDir, 'objects');
  await copyDir(archiveObjectsDir, OBJECTS_DIR);

  // Restore graph
  try {
    await fs.copyFile(path.join(archiveDir, 'graph.json'), GRAPH_FILE);
  } catch {
    await saveGraph({ edges: [], metadata: {} });
  }

  // Restore goal
  try {
    await fs.copyFile(path.join(archiveDir, 'goal.json'), GOAL_FILE);
  } catch {
    await deleteGoal();
  }

  const raw = await fs.readFile(metaPath, 'utf8');
  return JSON.parse(raw);
}

export async function deleteArchive(id) {
  const archiveDir = path.join(ARCHIVES_DIR, id);
  try {
    await removeDir(archiveDir);
  } catch { /* may not exist */ }
}
