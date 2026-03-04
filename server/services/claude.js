import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '..', 'data', 'logs');

// System prompt instructs Claude to respond conversationally AND append structured JSON
const SYSTEM_PROMPT = `You are the reasoning engine for Threshold, a knowledge graph dialogue system.

When the user shares thoughts, do TWO things:
1. Respond conversationally — elaborate, question, connect, challenge. Be a thinking partner, not an assistant. Keep responses concise (2-4 sentences).
2. After your response, on a new line, output a JSON block wrapped in <threshold-extract> tags containing any objects or connections you identified.

Format:
<threshold-extract>
{
  "objects": [
    {
      "label": "short 3-8 word name",
      "summary": "1-2 sentence description",
      "type": "concept|question|tension|claim|metaphor|relation|goal|evidence|assumption|pattern|principle",
      "confidence": 0.0-1.0
    }
  ],
  "connections": [
    {
      "from_label": "source object label",
      "to_label": "target object label",
      "label": "relationship description"
    }
  ],
  "suggestions": []
}
</threshold-extract>

Only extract objects when genuine semantic units emerge. Don't force extraction on every turn. Quality over quantity.

IMPORTANT: When proposing connections, use the EXACT label of existing objects in from_label/to_label so the system can match them. You can connect new objects to existing ones or existing objects to each other.`;

// In-memory conversation history (keyed by session, keeps last N turns)
const MAX_HISTORY_TURNS = 10;
const conversationHistory = new Map();

function getHistory(sessionId) {
  const key = sessionId || 'default';
  if (!conversationHistory.has(key)) {
    conversationHistory.set(key, []);
  }
  return conversationHistory.get(key);
}

function addTurn(sessionId, userText, claudeResponse) {
  const history = getHistory(sessionId);
  // Store the clean dialogue (strip extraction tags)
  const cleanResponse = claudeResponse.replace(/<threshold-extract>[\s\S]*?<\/threshold-extract>/, '').trim();
  history.push({ user: userText, assistant: cleanResponse });
  // Keep only recent turns
  if (history.length > MAX_HISTORY_TURNS) {
    history.splice(0, history.length - MAX_HISTORY_TURNS);
  }
}

// Append to markdown log file
async function appendToLog(sessionId, userText, claudeResponse) {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    const logFile = path.join(LOGS_DIR, `${sessionId || 'default'}.md`);
    const timestamp = new Date().toISOString();
    const cleanResponse = claudeResponse.replace(/<threshold-extract>[\s\S]*?<\/threshold-extract>/, '').trim();
    const entry = `\n---\n**${timestamp}**\n\n**User:** ${userText}\n\n**Claude:** ${cleanResponse}\n`;
    await fs.appendFile(logFile, entry);
  } catch {
    // Non-critical — don't fail the request
  }
}

export async function sendToClaude(userText, sessionId, existingObjects = []) {
  let contextBlock = '';
  if (existingObjects.length > 0) {
    const objectList = existingObjects
      .map((o) => `- "${o.label}" (${o.type}): ${o.summary || 'no summary'}`)
      .join('\n');
    contextBlock = `\n\nExisting knowledge graph objects:\n${objectList}\n\nWhen relevant, propose connections between these objects and any new ones you extract. Use exact labels for from_label/to_label.\n`;
  }

  // Build conversation history block
  const history = getHistory(sessionId);
  let historyBlock = '';
  if (history.length > 0) {
    historyBlock = '\n\nRecent conversation:\n' +
      history.map((t) => `User: ${t.user}\nAssistant: ${t.assistant}`).join('\n\n') +
      '\n\n';
  }

  const fullPrompt = `${SYSTEM_PROMPT}${contextBlock}${historyBlock}User: ${userText}`;

  const rawResponse = await new Promise((resolve, reject) => {
    // Unset CLAUDECODE env var to allow spawning from within a Claude Code session
    const env = { ...process.env };
    delete env.CLAUDECODE;

    // Pipe prompt via stdin instead of command-line arg (avoids length limits)
    const proc = spawn('claude', ['-p'], {
      shell: true,
      env,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        console.error('Claude CLI error (code ' + code + '):', stderr);
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });

    proc.on('error', (err) => {
      console.error('Failed to spawn Claude CLI:', err.message);
      reject(err);
    });

    // Write prompt to stdin and close
    proc.stdin.write(fullPrompt);
    proc.stdin.end();
  });

  // Store in history + log to file
  addTurn(sessionId, userText, rawResponse);
  appendToLog(sessionId, userText, rawResponse);

  return rawResponse;
}
