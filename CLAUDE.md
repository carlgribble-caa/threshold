# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Threshold

A no-code reasoning platform. Where Notion is no-code CRUD, Threshold is no-code reasoning operations — induce, deduce, abduct, analogize, synthesize, decompose, bridge, challenge. Dialogue with AI produces a persistent knowledge graph. The graph feeds reasoning. The reasoning feeds the graph.

## Full Specification

**Read `Documentation/threshold-system-spec-draft.md` before making any implementation decisions.** It contains the complete UX spec, object schema, command/event architecture, layout rules, SNA-based context assembly algorithm, and build phases.

## Architecture

- **Frontend**: React 18 + Vite + @xyflow/react (ReactFlow v12)
- **Server**: Express.js on port 3001
- **AI**: Claude CLI via `child_process` (`claude -p`)
- **Storage**: JSON (objects), YAML (sessions), MD (dialogue logs) — no database
- **Graph metrics**: graphology + graphology-metrics (centrality, community detection, etc.)
- **Dev**: `concurrently` runs Vite (5173) + Express (3001), Vite proxies `/api`

## Key Design Decisions

- Pause detection triggers dialogue (3-4s), no send button
- Typing interrupts Claude mid-stream
- Objects orbit the dialogue overlay, drag into graph to crystallize
- Center floating translucent dialogue overlay
- Goals pinned to top of canvas as North Stars
- Hidden sidebar (hover left edge)
- Dark amber palette (near-black #0a0a0a, amber #d4a574)
- Force-directed layout, semantic zoom, smart edge routing
- SNA-based dynamic context assembly for Claude prompts
- 8 reasoning operations as graph verbs
- 11 object types: concept, question, tension, claim, metaphor, relation, goal, evidence, assumption, pattern, principle

## Design Principles

1. The dialogue is the engine, not the interface
2. Objects are the product, text is the process
3. The editor is welcome after crystallization, not during generation
4. The space grows with the user's thinking, not their message count
5. Context is navigated, not consumed
6. Teach through experience, not explanation

## Versioning & Changelog

- Version lives in root `package.json` (`"version": "0.1.0"`)
- Git short hash is injected at build time by `client/vite.config.js`
- Both are displayed in the sidebar under the THRESHOLD header
- **When committing meaningful changes**, update `CHANGELOG.md`:
  1. Add entries under the current `[version]` section, or create a new version section if bumping
  2. Include the git hash in parentheses after each entry group
  3. Use categories: Added, Changed, Fixed, Removed
  4. Keep entries concise — one line per feature/fix
- **When bumping version**, update `package.json` version field. Use semver: patch for fixes, minor for features, major for breaking changes
