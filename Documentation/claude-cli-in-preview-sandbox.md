# Using Claude AI from a Server Running in Claude Code Desktop's Preview Sandbox

## The Problem

When building an app in Claude Code Desktop that needs to call Claude AI from its backend server, you'll hit a wall: the preview sandbox (used by `preview_start`) does **not** inherit environment variables or filesystem access from the parent Claude Code process. This means:

1. **`claude` CLI is not found** — The global npm binary path (e.g. `AppData/Roaming/npm`) is inaccessible from the sandbox. `spawn('claude', ...)` fails with "not recognized as a command."
2. **`ANTHROPIC_API_KEY` / `CLAUDE_CODE_OAUTH_TOKEN` are not inherited** — Even if set in the parent process, child processes started by `preview_start` don't receive them.
3. **Global module resolution is blocked** — `require.resolve()` and `existsSync()` cannot reach paths outside the project directory.

## The Solution

Call the Anthropic Messages API directly using `fetch()` (Node 18+ built-in) with the OAuth token written to a `.env` file.

### Step-by-step Setup

#### 1. Install dotenv

```bash
npm install dotenv
```

#### 2. Create `.env` with the OAuth token

From a Bash tool call in Claude Code (which *does* have access to the env var):

```bash
echo "CLAUDE_CODE_OAUTH_TOKEN=${CLAUDE_CODE_OAUTH_TOKEN}" > server/.env
```

The token looks like `sk-ant-oat01-...`. It's the OAuth token Claude Code Desktop uses for authentication.

#### 3. Gitignore the `.env` file

```gitignore
.env
```

#### 4. Load dotenv at the very top of your server entry point

```javascript
// server/index.js — MUST be the first lines
import dotenv from 'dotenv';
dotenv.config();

// ... rest of imports and server setup
```

#### 5. Create a Claude API helper module

**Critical**: Read env vars **lazily** (inside functions, not at module top level). ES module `import` statements are hoisted and execute *before* your `dotenv.config()` call in the entry point. If you read `process.env` at the top level of an imported module, the `.env` values won't be loaded yet.

```javascript
// server/services/claude-api.js

const API_BASE = 'https://api.anthropic.com';

// LAZY — reads env at call time, not import time
function getAuthToken() {
  return process.env.ANTHROPIC_API_KEY
      || process.env.CLAUDE_CODE_OAUTH_TOKEN
      || null;
}

export async function callClaude(promptText, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error(
      'No auth token. Set ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN in .env'
    );
  }

  const {
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096,
    system = undefined,
  } = options;

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: promptText }],
  };
  if (system) body.system = system;

  const response = await fetch(`${API_BASE}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': token,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.content
    ?.filter(b => b.type === 'text')
    .map(b => b.text)
    .join('') || '';
}
```

#### 6. Use it from your routes

```javascript
import { callClaude } from '../services/claude-api.js';

router.post('/ask', async (req, res) => {
  const answer = await callClaude(req.body.question, {
    system: 'You are a helpful assistant.',
  });
  res.json({ answer });
});
```

## Why Not These Alternatives?

| Approach | Why it fails in the preview sandbox |
|---|---|
| `spawn('claude', ['-p'])` | CLI binary not on PATH; sandbox blocks access to global npm dir |
| Hardcode PATH to `AppData/Roaming/npm` | Sandbox blocks filesystem reads outside project dir |
| `npm install @anthropic-ai/claude-code` locally + spawn | Binary resolves but has no auth ("Not logged in") |
| `@anthropic-ai/sdk` package | Works in principle, but adds a dependency when raw `fetch()` suffices |
| Pass token via `launch.json` env vars | `launch.json` doesn't support environment variable configuration |

## Key Gotcha: ES Module Import Hoisting

This is the single most likely thing to trip you up. Given this code:

```javascript
// index.js
import dotenv from 'dotenv';
dotenv.config();                    // Line 2 — you think this runs first

import { myHelper } from './helper.js';  // But THIS runs before line 2
```

All `import` statements execute before any other code in the module. So `helper.js` runs its top-level code (including any `process.env` reads) *before* `dotenv.config()` populates the environment.

**Fix**: Never read `process.env` at the top level of imported modules. Wrap it in a function that's called at runtime.

```javascript
// BAD — reads env at import time (before dotenv loads)
const TOKEN = process.env.MY_TOKEN;

// GOOD — reads env when function is called
function getToken() {
  return process.env.MY_TOKEN;
}
```

## launch.json Reference

Your `.claude/launch.json` for running the server in preview:

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "my-server",
      "runtimeExecutable": "node",
      "runtimeArgs": ["index.js"],
      "port": 3001,
      "cwd": "server"
    }
  ]
}
```

Then start with `preview_start` using the name `"my-server"`.

## Checklist for New Projects

- [ ] `npm install dotenv` in your server package
- [ ] `.env` file created with `CLAUDE_CODE_OAUTH_TOKEN` (via Bash tool)
- [ ] `.env` in `.gitignore`
- [ ] `dotenv.config()` is the **first** executable line in your entry point
- [ ] All `process.env` reads are inside functions (lazy), not at module top level
- [ ] API helper uses raw `fetch()` to `https://api.anthropic.com/v1/messages`
- [ ] Auth header is `x-api-key` (works for both API keys and OAuth tokens)
