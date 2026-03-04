# Threshold — Local Development Guide

How to run Threshold locally on your machine.

## Prerequisites

- **Node.js** (v18 or later) — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** (for version tracking and build hash)
- **Claude CLI** (for AI features) — must be logged in via `claude login`

## Quick Start

1. Open a terminal in the project root (`C:\Dev\theshold` or wherever you cloned the repo)
2. Install dependencies (first time only):
   ```
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ..
   ```
3. Ensure Claude CLI is logged in (one-time setup, see [AI Configuration](#ai-configuration) below):
   ```
   claude login
   ```
4. Start both servers:
   ```
   npm run dev
   ```
5. Open `http://localhost:5173` in your browser

That's it. One command runs everything. You do **not** need to start Claude CLI separately — the Express server spawns it automatically as a child process whenever an AI request is made.

## What `npm run dev` Starts

| Service | Port | Purpose |
|---------|------|---------|
| Vite dev server | 5173 | React frontend with hot reload |
| Express server | 3001 | API backend, Claude integration |

Vite proxies all `/api` requests to the Express server, so you only need to open port 5173.

## Windows: PowerShell Execution Policy

If you see this error in PowerShell:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Fix it by running this once:

```
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then retry `npm run dev`. Alternatively, use **Command Prompt** (cmd) instead of PowerShell — it doesn't have this restriction.

## AI Configuration

Threshold uses Claude for dialogue, reasoning operations, and document generation.

### Option A: Claude CLI (no API account needed)

1. Install Claude CLI: `npm install -g @anthropic-ai/claude-code`
2. Log in (one-time): `claude login`
3. Start Threshold — the server spawns `claude -p` as a child process for each AI request

Claude CLI is **not** a background server. It does not need to be running separately. The Express backend calls it on demand and it exits after each response.

### Option B: Anthropic API Key

1. Set your API key in a `.env` file in the project root:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
2. Start Threshold — it will call the Anthropic Messages API directly (faster)

The app tries API first, falls back to CLI automatically.

### Switching Models

Open the sidebar (click Menu or hover left edge) and use the Model buttons to switch between Sonnet, Opus, and Haiku. This takes effect immediately for all subsequent AI requests.

## Build Version

The sidebar displays the current version and git commit hash (e.g. `v0.1.0 · e36b607`). This is injected at build time from `package.json` and `git rev-parse --short HEAD`.

## Stopping

Press `Ctrl+C` in the terminal where `npm run dev` is running. This stops both servers.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5173 already in use | Kill the process using it, or set `VITE_PORT` in `client/vite.config.js` |
| Port 3001 already in use | Kill the process, or change `PORT` in `server/index.js` |
| Claude AI not responding | Check `claude login` status, or verify `.env` has a valid API key |
| "Module not found" errors | Run `npm install` in both `client/` and `server/` directories |
| Blank page in browser | Check the browser console for errors; ensure both servers are running |
