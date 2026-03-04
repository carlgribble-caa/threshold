# Threshold — Complete UX & System Specification (DRAFT)

> Status: Draft v1 — Design session 1 complete. Ready for build in new chat session.
> Open items: Claude prompting call strategy (single vs dual call) needs prototyping to resolve.

---

## 1. Vision

A no-code reasoning platform. Where Notion is no-code CRUD, Threshold is no-code *reasoning operations* — induce, deduce, abduct, analogize, synthesize, decompose, bridge, challenge. Dialogue with AI produces a persistent knowledge graph. The graph feeds reasoning. The reasoning feeds the graph.

---

## 2. Interaction Model

### Dialogue Trigger
- **Pause detection only** — no send button, no Enter-to-send
- User types freely anywhere on the canvas
- After **3-4 seconds** of inactivity, text auto-sends to Claude
- No visual "send" moment — text just flows

### Interruption
- If user starts typing while Claude is streaming, **Claude stops immediately**
- New text is appended to the original input
- Combined text re-sends on next pause detection

### Object Emergence
- **Real-time as Claude streams** — as Claude identifies semantic units in its response, objects materialize one by one, orbiting the dialogue overlay

### Dialogue Scope
- **Minimal** — only two things visible in the overlay:
  1. What the user is currently typing
  2. Claude's most recent response
- No scrollable history — objects are the persistent record

---

## 3. Layout

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ◄ hidden sidebar          ◇ GOAL (pinned, elevated) ◇                    │
│ (hover left edge                                                          │
│  or key to reveal)        MAIN GRAPH CANVAS                               │
│                           (dark, warm amber on near-black)                │
│ ┌──────────────┐                                                          │
│ │ Session list │      ╭───────────╮                    ╭──────────╮       │
│ │ End session  │      │ concept A │───"enables"───────│concept B │       │
│ │ Settings     │      │ ● solid   │                    │ ● solid  │       │
│ │ Graph health │      ╰───────────╯                    ╰──────────╯       │
│ │ Proposed (5) │              │                                           │
│ └──────────────┘         "challenges"         ✦ INDUCE? ✦                │
│                               │          ╭─────────────╮                  │
│                               └─────────│  concept C   │                  │
│                 ◌                         │  ● solid     │                  │
│              ◌     ◌                     ╰─────────────╯                  │
│           ┌─────────────────┐                                             │
│        ◌  │    DIALOGUE     │  ◌         ← emerging objects orbit         │
│           │                 │               the dialogue card              │
│        ◌  │  you: ...       │  ◌                                          │
│           │  claude: ...    │                                              │
│           │  █ cursor       │                                             │
│           └─────────────────┘                                             │
│              ◌     ◌                                                      │
│                 ◌                                                         │
└───────────────────────────────────────────────────────────────────────────┘

◌ = emerging object (translucent, orbiting dialogue)
● = crystallized object (solid, placed in graph)
◇ = goal object (pinned to top, elevated above graph plane)
✦ = reasoning operation suggestion (graph annotation)
```

### Dialogue Overlay
- **Position**: Center of screen, floating translucent card
- **Appears**: When user starts typing anywhere (no text box to click)
- **Content**: Current user input + Claude's latest response only
- **Fades**: After sustained period of no typing
- **Style**: Semi-transparent dark card, warm amber text, soft rounded corners

### Hidden Sidebar
- **Trigger**: Hover left edge or keyboard shortcut
- **Contents**: Session list, End Session button, settings, graph health metrics, proposed connection count
- **Style**: Slides in from left, translucent dark, warm amber text
- **Dismissal**: Mouse away or shortcut again

### Goal Objects
- **Pinned to top** of the canvas, elevated above the graph plane
- Always visible regardless of pan/zoom
- Act as "North Stars" — influence Claude's reasoning suggestions
- Faint gravity/attraction toward related objects below

---

## 4. Visual Design

- **Background**: Near-black (`#0a0a0a` range)
- **Primary text**: Warm amber/gold (`#d4a574` range) — like embers
- **Crystallized objects**: Solid warm-toned cards, subtle glow
- **Emerging objects**: Translucent, dashed borders, softer glow
- **Connection lines**: Warm amber, thin, with freeform text labels
- **Proposed connections**: Dotted/dashed lines with confirm/reject controls
- **Dialogue overlay**: Semi-transparent, slightly lighter than background
- **Recently active**: Subtle amber pulse/glow
- **Typography**: Clean sans-serif, generous letter-spacing
- **Graph metric ambient signals**: Dense clusters glow brighter, isolated nodes dim, unchallenged claims have subtle warning hue

---

## 5. Canvas & Layout Rules

### Node Rendering
- **Fixed width**: 200px
- **Dynamic height**: grows to fit content at current zoom level
- **Inner padding**: 12px all sides
- **No content overflow**: all text constrained within node boundary

### Semantic Zoom Breakpoints
| Zoom level | What's visible inside nodes |
|------------|----------------------------|
| < 0.5x | Label only (single line, truncated) |
| 0.5x – 1.5x | Compact: label + type badge + confidence dot |
| > 1.5x | Expanded: label, type, confidence, summary (3 lines), action buttons, reasoning ops |

### Force-Directed Layout
- **Algorithm**: d3-force (or equivalent)
- **Repulsion radius**: 150px (nodes push away within this range)
- **Connected attraction**: 200px ideal distance between linked nodes
- **Clusters form naturally** from attraction between connected objects
- **New objects** enter the simulation and settle into position organically

### Node Movement
- **Free drag** anywhere on canvas
- **Soft repulsion on drop**: nearby nodes gently push away if dropped within 40px
- **Minimum spacing**: 40px between node boundaries (enforced by repulsion, not hard constraint)
- Dragged nodes become "pinned" — force simulation respects their position

### Edge Rendering
- **Line width**: 1.5px
- **Routing**: Smart routing — edges path around nodes they would cross over
- **Crossings**: Edges can cross each other. At intersection points, lines arc/offset slightly to show they're separate (electrical diagram style)
- **Z-order**: Edges render below nodes (nodes always on top)
- **Proposed edges**: Dotted/dashed, with subtle ✓/✕ controls
- **Confirmed edges**: Solid lines

### Edge Labels
- **Visible by default** when nearby or zoomed in
- **Fade with distance**: labels become transparent as user zooms out or pans away
- **Position**: centered on edge midpoint, offset slightly above the line

### Canvas
- **Infinite canvas**: pan in any direction, no boundaries
- **Zoom range**: 0.1x to 3.0x
- **Background**: near-black, no grid (clean, contemplative)

---

## 6. Object System

### Object Types (11)

| Type        | Description                                          |
|-------------|------------------------------------------------------|
| `concept`   | An idea, principle, or framework                     |
| `question`  | An open inquiry or unknown                           |
| `tension`   | A contradiction or unresolved conflict               |
| `claim`     | An assertion that could be true or false             |
| `metaphor`  | A mapping between domains                            |
| `relation`  | A relationship insight (meta-level observation)      |
| `goal`      | A desired outcome or direction (becomes North Star)  |
| `evidence`  | A data point, observation, or grounded fact          |
| `assumption`| Something taken as true without proof                |
| `pattern`   | A recurring structure across objects/domains         |
| `principle` | A generalized rule derived from reasoning            |

### Object Schema

```json
{
  "id": "uuid",
  "label": "3-8 word name (model-generated or user-edited)",
  "summary": "1-2 sentence description",
  "type": "concept|question|tension|claim|metaphor|relation|goal|evidence|assumption|pattern|principle",
  "status": "emerging|crystallized|archived",
  "confidence": 0.0-1.0,
  "tags": ["user-defined", "freeform", "labels"],
  "source_text": "raw dialogue excerpt that produced this (hidden by default)",
  "position": { "x": 0, "y": 0 },
  "children": ["child-id-1", "child-id-2"],
  "depth": 0,
  "session_id": "session-uuid",
  "created": "ISO timestamp",
  "updated": "ISO timestamp"
}
```

### Object Lifecycle

```
Claude extracts from dialogue stream
            │
            ▼
    ┌───────────────────┐
    │  EMERGING          │  Translucent, dashed border
    │  Orbits dialogue   │  Stays until dragged or dismissed
    └───────┬───────────┘
            │
     ┌──────┴──────┐
     │              │
  drag into      dismiss (✕)
  graph             │
     │              ▼
     ▼           (removed)
┌───────────────┐
│ CRYSTALLIZED   │  Solid, permanent, placed in graph
│ Position set   │  Saved to file
└───────┬───────┘
        │
     archive
        │
        ▼
┌───────────────┐
│ ARCHIVED       │  Hidden from main view
│ Still in data  │  Retrievable
└───────────────┘
```

- **Drag into graph = crystallize** (one action = placement + commitment)
- **Neglected objects stay orbiting** until explicitly dismissed
- Objects that remain emerging never auto-delete

### Object Interaction (click to expand inline)

```
Compact:                         Expanded (on click):
╭───────────────╮               ╭─────────────────────────────────╮
│  emergence &  │               │  emergence & creativity         │
│  creativity   │    ──click──► │  ● concept  ◈ 0.8 confidence   │
│  ● concept    │               │                                 │
╰───────────────╯               │  Summary: The moment when rigid │
                                │  structures give way to new     │
                                │  possibilities...                │
                                │                                 │
                                │  Actions:                       │
                                │  [✎ Edit] [⊗ Dismiss] [▽ Nest] │
                                │                                 │
                                │  Reason:                        │
                                │  [Explode] [Challenge]          │
                                │  [Bridge]  [Analogize]          │
                                ╰─────────────────────────────────╯
```

- Single click expands inline (no popup, no context menu)
- Shows: full summary, confidence, action buttons, reasoning operations
- Reasoning ops shown are contextual to what makes sense for the object type
- Click elsewhere to collapse

---

## 7. Edge System

### Edge Properties

```json
{
  "from": "object-id",
  "to": "object-id",
  "label": "freeform string (e.g., 'enables', 'contradicts', 'inspired by')",
  "status": "proposed|confirmed",
  "source": "claude|user",
  "session_id": "session-uuid",
  "created": "ISO timestamp"
}
```

### Edge Interaction

- **Claude proposes** connections with freeform labels
- **Proposed edges**: Dotted/dashed lines with subtle ✓/✕ controls
- **User confirms** (click ✓ or click the line) → becomes solid
- **User rejects** (click ✕) → edge removed
- Post-session integration proposals visible on return + sidebar badge count

---

## 8. Reasoning Operations

Eight graph verbs — the core "app":

| Operation    | Input                    | Output                                      | When to suggest              |
|-------------|--------------------------|---------------------------------------------|-------------------------------|
| **INDUCE**   | Multiple specific objects | Proposed general principle                  | Cluster has 3+ similar objects without parent |
| **DEDUCE**   | General + specific       | Proposed implications                       | Principle exists with few derived claims |
| **ABDUCT**   | Surprising/anomalous object | Proposed best explanation                | Object contradicts nearby cluster pattern |
| **EXPLODE**  | Single complex object    | Sub-objects (children)                      | Object has high depth, no children yet |
| **BRIDGE**   | Two disconnected clusters | Proposed connecting concept                | Graph has isolated components |
| **SYNTHESIZE** | Two tensions/contradictions | Proposed resolution object               | Two tension objects exist nearby |
| **ANALOGIZE** | Two structurally similar clusters | Proposed structural mapping          | Two clusters have parallel internal structure |
| **CHALLENGE** | Any object (esp. claims) | Proposed counter-evidence or weakness       | Claim/assumption has no contradicting edge |

### Trigger Model (Both paths)

**Passive (Claude suggests)**: Claude analyzes graph metrics and suggests in dialogue overlay + graph annotations (✦). User clicks to execute.

**Active (User invokes)**: Click object to expand → reasoning operation buttons. Contextual to object type (Claims → Challenge/Deduce, Concepts → Explode/Analogize/Bridge, Tensions → Synthesize, Patterns → Induce).

### Operation Execution

1. Claude receives operation type + target objects + surrounding graph context
2. Claude generates new objects and/or edges as results
3. Results emerge as new orbiting objects (same lifecycle)
4. User crystallizes the ones they accept

---

## 9. Graph Metrics

### Structural Metrics (graph theory)

| Metric | What it measures | Ambient visual signal |
|--------|------------------|----------------------|
| Degree centrality | Most connected objects | Brighter glow |
| Betweenness centrality | Bridge objects between clusters | Distinct visual (key connector) |
| Clustering coefficient | How tightly ideas clump | Cluster warmth/density |
| Isolated nodes | Objects with zero connections | Dimmer, cooler |
| Connected components | Separate thought islands | Visible gaps between clusters |
| Path length | Conceptual distance between ideas | (sidebar only) |
| Graph density | Overall interconnectedness | (sidebar only) |

### Reasoning Coverage Metrics

| Metric | What it measures | Signal |
|--------|------------------|--------|
| Unchallenged claims | Claims with no contradicting edge | Subtle warning hue |
| Unresolved tensions | Tensions with no resolving edge | Tension glow |
| Unsupported claims | Claims with no evidence edges | Faint indicator |
| Induction opportunities | 3+ similar objects without generalization | ✦ suggestion |
| Bridge opportunities | Disconnected clusters | ✦ suggestion |
| Goal alignment | % of objects connected to a goal | (sidebar) |

### UI
- **Ambient (canvas)**: Visual properties encode metrics — glow, warmth, dimness, warning hues
- **Detailed (sidebar)**: "Graph Health" section with numeric breakdowns

---

## 10. Session Lifecycle

### First Visit (Guided First Session)
1. Dark canvas loads. Brief centered text: *"This is a different way of working with AI."*
2. Guided breathing/centering prompt with micro-explanations
3. Guided freewrite
4. First object emerges with explanation: *"That idea just became an object. It persists."*
5. Progressive disclosure — features emerge as practice deepens

### Starting a Session (Return Visit)
1. Graph loads immediately — crystallized objects, edges, goals pinned at top
2. Post-session integration results visible: dotted proposed connections + sidebar badge
3. User starts typing anywhere → new session begins

### Ending a Session
1. User opens sidebar → clicks **"End Session"**
2. Claude runs **post-session integration**: proposes new cross-graph connections
3. Session metadata saved (duration, objects created, operations performed)

---

## 11. Command & Event Architecture

### Commands (explicit, named actions)

| Command                | Source        | Payload                                     |
|------------------------|---------------|---------------------------------------------|
| `dialogue.send`        | UI (auto)     | `{ text, sessionId }`                       |
| `dialogue.interrupt`   | UI            | `{ newText }`                               |
| `object.crystallize`   | UI (drag)     | `{ id, position: {x,y} }`                   |
| `object.dismiss`       | UI            | `{ id }`                                    |
| `object.edit`          | UI            | `{ id, label?, summary?, type?, tags? }`    |
| `object.move`          | UI            | `{ id, position: {x,y} }`                   |
| `object.nest`          | UI            | `{ childId, parentId }`                     |
| `connection.confirm`   | UI            | `{ fromId, toId, label }`                   |
| `connection.reject`    | UI            | `{ fromId, toId }`                          |
| `session.start`        | UI            | `{ name? }`                                 |
| `session.end`          | UI            | `{ sessionId }`                             |
| `reason.execute`       | UI / Claude   | `{ operation, targetIds[], context }`       |
| `claude.extract`       | Server        | `{ dialogueText, existingObjects }`         |
| `claude.integrate`     | Server        | `{ fullGraph }`                             |
| `claude.suggest`       | Server        | `{ graphMetrics, activeGoals }`             |

### Events (organic, reactive)

| Event                    | Emitted by   | Subscribers            |
|--------------------------|-------------|------------------------|
| `typing.started`         | UI          | UI (show dialogue)     |
| `typing.paused`          | UI          | Server (send to Claude)|
| `typing.stopped`         | UI          | UI (fade dialogue)     |
| `typing.resumed`         | UI          | Server (interrupt)     |
| `claude.streaming`       | Server      | UI (show response)     |
| `claude.stopped`         | Server      | UI                     |
| `object.emerged`         | Server      | UI (add to orbit)      |
| `connection.proposed`    | Server      | UI (show dotted edge)  |
| `object.crystallized`    | Server      | UI, Store              |
| `graph.changed`          | Server      | UI (re-render)         |
| `reason.suggested`       | Server      | UI (annotations)       |
| `metrics.updated`        | Server      | UI (ambient + sidebar) |

---

## 12. Claude Prompting & Context Assembly

### Call Strategy

When user pauses and dialogue fires:
1. Claude streams a dialogue response (conversational)
2. At end of response, Claude appends a structured JSON block with extracted objects, proposed connections, and suggested reasoning operations
3. Server strips the JSON before it reaches the UI
4. Server emits `object.emerged` / `connection.proposed` / `reason.suggested` events

> **Open question**: Single combined call vs. separate dialogue + extraction calls. Prototype both to determine quality and latency trade-offs.

### Dynamic Context Assembly (SNA-based)

Context is assembled dynamically using Social Network Analysis techniques on the knowledge graph. The graph is treated as a social network — centrality, community structure, and structural holes determine what Claude "sees."

#### Context Tiers

| Tier | Content Level | What's Included | Budget |
|------|--------------|-----------------|--------|
| **Goals** | Full detail | All crystallized goal objects (always) | ~500 tokens |
| **Tier 1** | Full detail | Ego network depth 1, top 5 eigenvector centrality, top 3 betweenness (bridges), text-matched objects | ~3000 tokens |
| **Tier 2** | Summary only | Ego network depth 2, active community (Louvain), objects adjacent to structural holes | ~2000 tokens |
| **Tier 3** | Skeleton | Everything else (label, type, edge list) | ~1500 tokens |
| **Metrics** | Snapshot | Unchallenged claims, isolated nodes, structural holes, densest community, goal alignment % | ~500 tokens |
| **Dialogue** | Raw text | Last 2-3 exchanges | ~500 tokens |

Total budget: ~8000 tokens. Adaptive — fill highest priority first, overflow to next tier.

#### SNA Techniques Used

| Technique | Purpose |
|-----------|---------|
| **Ego networks** | Active region — 1-hop full, 2-hop summaries |
| **Eigenvector centrality** | Most influential objects — always include top N |
| **Betweenness centrality** | Bridge concepts — always include |
| **Community detection (Louvain)** | Thought clusters — active community gets summary context |
| **Structural holes** | Gaps between clusters — include both sides for BRIDGE suggestions |
| **K-core decomposition** | Dense core vs. periphery — core gets priority |

#### Focal Point Determination
1. Last clicked/expanded object (strongest)
2. Objects mentioned in recent dialogue (text matching)
3. Most recently created objects (recency)
4. Canvas viewport center (if tracked)

#### Anti-Stagnation
- Occasionally include a random distant object or structural hole
- Like simulated annealing — prevents context from getting trapped in one neighborhood

#### Serialization Format

```
=== GOALS ===
[G1] "build a reasoning framework" (goal, confidence: 0.9)
  Summary: A system that makes reasoning operations...
  Connected to: C3, C7, P2

=== ACTIVE REGION (full detail) ===
[C3] "emergence & creativity" (concept, confidence: 0.8)
  Summary: The moment when rigid structures give way...
  Tags: #creativity #threshold
  Edges: enables→C7, challenges→T1

=== NEARBY (summaries) ===
[C7] "identity in systems" (concept, 0.7) — How identity...
[T1] "control vs emergence" (tension, 0.6) — The tension...

=== GRAPH SKELETON ===
Nodes: C1, C2, C3, C4, C5, C7, T1, T2, Q1, E1, P1, P2, G1
Edges: C3→C7(enables), C3→T1(challenges), C7→T2(contains)...

=== METRICS ===
Unchallenged claims: CL2, CL5
Isolated: Q3
Bridge opportunity: Cluster{C1,C2,C3} ↔ Cluster{C7,C8}
Goal alignment: 72%
```

---

## 13. Tech Stack & Dependencies

- **Frontend**: React 18 + Vite + @xyflow/react (ReactFlow v12)
- **Server**: Express.js on port 3001
- **AI**: Claude CLI via `child_process` (`claude -p`)
- **Storage**: JSON (objects, graph), YAML (sessions), MD (dialogue logs)
- **Dev**: `concurrently` runs Vite (5173) + Express (3001), Vite proxies `/api`

### NPM Dependencies

**Frontend (client/)**
| Package | Purpose |
|---------|---------|
| `react`, `react-dom` | UI framework |
| `@xyflow/react` | ReactFlow v12 — graph canvas, custom nodes, edges, drag/drop |
| `framer-motion` | Animation — orbit physics, fade transitions, crystallize effects |
| `eventemitter3` | Lightweight event bus |
| `uuid` | Unique ID generation |

**Server (server/)**
| Package | Purpose |
|---------|---------|
| `express` | HTTP server + API routes |
| `cors` | Cross-origin requests |
| `js-yaml` | YAML read/write (sessions) |
| `uuid` | ID generation |
| `graphology` | In-memory graph data structure |
| `graphology-metrics` | Centrality, clustering, components, betweenness |

**Dev Tooling**
| Package | Purpose |
|---------|---------|
| `vite` | Frontend build + dev server |
| `@vitejs/plugin-react` | React fast refresh |
| `concurrently` | Run client + server together |
| `nodemon` | Auto-restart server |

---

## 14. File Structure

```
threshold/
├── client/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── VisualSpace.jsx
│   │   │   ├── DialogueOverlay.jsx
│   │   │   ├── ObjectNode.jsx
│   │   │   ├── EmergingObject.jsx
│   │   │   ├── GoalNode.jsx
│   │   │   ├── ProposedEdge.jsx
│   │   │   ├── OperationSuggestion.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/
│   │   │   ├── useDialogue.js
│   │   │   ├── useGraph.js
│   │   │   └── useOrbit.js
│   │   ├── lib/
│   │   │   ├── commands.js
│   │   │   └── events.js
│   │   └── styles/
│   │       └── index.css
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── dialogue.js
│   │   ├── objects.js
│   │   ├── graph.js
│   │   └── sessions.js
│   ├── services/
│   │   ├── claude.js
│   │   ├── extractor.js
│   │   ├── reasoner.js
│   │   ├── metrics.js
│   │   └── storage.js
│   └── data/
│       ├── objects/
│       ├── sessions/
│       ├── logs/
│       └── graph.json
├── shared/
│   └── schema.js
├── package.json
├── CLAUDE.md
└── .gitignore
```

---

## 15. Build Phases

### Phase 1: Core Loop
- Dark canvas + dialogue overlay + pause detection
- Claude CLI integration (dialogue + object extraction)
- Objects orbit dialogue, drag to crystallize
- Basic file persistence

### Phase 2: Visual Intelligence
- Full visual grammar (size, opacity, color by type, glow)
- Proposed connections (dotted edges, confirm/reject)
- Object expand inline (summary + actions)
- Dark amber palette fully styled

### Phase 3: Reasoning Operations
- 8 operations implemented as Claude prompts
- Graph metric calculations (structural + reasoning coverage)
- Suggestions in dialogue + graph annotations
- Direct invoke from expanded object view

### Phase 4: Goals & Metrics
- Goal type with pinned/elevated behavior
- Ambient metric signals on canvas
- Sidebar graph health panel
- Goal alignment tracking

### Phase 5: Sessions & Onboarding
- Guided first session experience
- Session management (start/end in sidebar)
- Post-session integration
- Return visit: proposed connections + badge

### Phase 6: Polish & Iteration
- Hidden sidebar (hover/key)
- Animation: orbit, crystallize, fade
- Progressive disclosure
- Large graph performance

### Phase 7: Document Generation Pipeline
- Goal-driven artifact requirements (book → needs outline, thesis, tone, themes, characters, etc.)
- Gap analysis: Claude surfaces missing supporting docs
- Multi-call build plan: outline + context scoped per section
- Autonomous execution: server fires sequential Claude calls, captures MD output
- Assembly: concatenate sections into complete MD, generate TOC
- Goal steering: crystallized goals steer conversation toward generation-readiness

### Phase 8: Export & Integration (Future Vision)
- Artifact generation (docs, decks, matrices from graph)
- Knowledge base export (Obsidian, Notion)
- Project bootstrapping (GitHub, PM tools)
- External import (papers, articles → objects)
- Graph API (read/write for external tools)
- App generation (domain tools from graph structure)
