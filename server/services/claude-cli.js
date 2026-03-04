// Claude API helper — calls Anthropic Messages API directly using the OAuth token
// from the environment. Falls back to spawning `claude -p` if available.

import { spawn } from 'child_process';

const API_BASE = 'https://api.anthropic.com';

/**
 * Lazily resolve auth token (dotenv may load after this module is imported).
 */
function getAuthToken() {
  return process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE_OAUTH_TOKEN || null;
}

/**
 * Call Claude via the Anthropic Messages API directly.
 */
async function callApi(promptText) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No Anthropic auth token available (set ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN)');
  }

  const response = await fetch(`${API_BASE}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': token,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: promptText }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  const text = data.content
    ?.filter(b => b.type === 'text')
    .map(b => b.text)
    .join('') || '';
  return text;
}

/**
 * Try CLI spawn as fallback (works when not sandboxed).
 */
function callCli(promptText) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.CLAUDECODE;

    const proc = spawn('claude', ['-p'], { shell: true, env });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Claude CLI exited with code ${code}: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });

    proc.on('error', reject);

    proc.stdin.write(promptText);
    proc.stdin.end();
  });
}

/**
 * Run a prompt through Claude. Tries API first, falls back to CLI.
 */
export async function runClaudeCli(promptText) {
  const token = getAuthToken();
  if (token) {
    return callApi(promptText);
  }
  return callCli(promptText);
}
