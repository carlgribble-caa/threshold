# Changelog

All notable changes to Threshold are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

Version is in `package.json`. Git hash is injected at build time and shown in the sidebar.

## [0.1.0] - 2026-03-04

### Added
- **Phase 8**: UI polish, configurable model selector, build versioning (`7987833`)
  - Slide-in animations for sidebar, document tray, and markdown editor
  - Amber-styled scrollbars and checkbox icons in document tray
  - Download-as-markdown button in editor
  - Configurable model selector (Sonnet/Opus/Haiku) in sidebar
  - Settings API endpoint for runtime model switching
  - Build version + git hash display in sidebar header
- **TC-001**: Document pipeline e2e test + doc parts auto-generation fix (`1526e8f`)
- **Phase 7**: Dynamic document generation pipeline (`ff145b3`)
  - Multi-stage document pipeline (plan, parts, generation, approval)
  - Document tray UI with pipeline progress
  - Markdown editor with live preview
- **Phase 5**: Canvas save/load with archive management (`d6f9842`)
  - New canvas creation, archive previous canvases
  - Load archived canvases from sidebar
- **Phase 4**: Goals, metrics, suggestions, and Claude API integration (`b24de95`)
  - Goal setting and north star display
  - Graph metrics (density, clustering, bridge objects)
  - AI-powered suggestions for reasoning gaps
  - Claude API direct calls with CLI fallback
- **Phase 3**: Reasoning operations, toolbar, and manual graph editing (`58cae41`)
  - 8 reasoning operations as graph verbs
  - Toolbar with dialogue, add object, connect, goal, suggest, docs, menu
  - Manual node/edge editing
- **Phase 2**: Visual intelligence (`9e9eb87`)
  - Force-directed graph layout
  - Object nodes with type-colored styling
  - Edge labels and routing
- **Phase 1**: Core scaffold (`9119b15`)
  - React + Vite + ReactFlow frontend
  - Express.js server with file-based storage
  - Dialogue overlay with pause-to-send
  - 11 object types
