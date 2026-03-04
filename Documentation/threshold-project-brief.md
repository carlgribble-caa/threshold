# Threshold — Project Brief & Specification

## What This Is

An interface for human-AI knowledge generation that replaces the chat paradigm with a three-layer system designed around how the generative cognitive loop actually works.

---

## The Problem

Chat interfaces enforce turn-taking, editorial review, linear history, and send-as-commitment. These activate the exact cognitive layers that need to be bypassed for deep generative work. Every current AI interface makes the business layer (the dialogue) the presentation layer (what you look at). This is like showing database transactions as a UI.

---

## Architecture

### Three Tiers

```
┌─────────────────────────────────────────────┐
│  PRESENTATION: The Visual Space              │
│  Objects, connections, clusters, topology     │
│  What the user sees and navigates            │
├─────────────────────────────────────────────┤
│  BUSINESS: The Dialogue Engine               │
│  Human generates, model elaborates           │
│  Creates/modifies objects. Mostly invisible.  │
├─────────────────────────────────────────────┤
│  DATA: The Object Graph                      │
│  Compressed semantic nodes + relationships   │
│  Persists across sessions. Grows over time.  │
└─────────────────────────────────────────────┘
```

---

## The Cognitive Loop

The interface must support this cycle without forcing conscious mode-switching:

1. **Arrive** → pre-linguistic material surfaces (needs: blankness, low stimulation)
2. **Release** → type before the editor catches it (needs: frictionless input, no review)
3. **Receive** → model return lands (needs: passive absorption, not analytical reading)
4. **Trigger** → something in the return ignites next arrival (needs: salience finding the user)
5. **Arrive** → loop continues

---

## Resolved Design Decisions

### Objects: What They Are

An **object** is a compressed semantic unit extracted from dialogue. It represents one idea, concept, question, tension, or connection.

Properties:
- `id` — unique identifier
- `label` — short name (3-8 words), model-generated or human-edited
- `summary` — 1-2 sentence compression of the underlying idea
- `source_text` — the raw dialogue excerpt that produced it (hidden by default)
- `type` — one of: `concept`, `question`, `tension`, `connection`, `claim`, `metaphor`
- `children` — nested sub-objects (for ideas that contain ideas)
- `connections` — array of related object IDs with relationship labels
- `position` — {x, y} in the visual space
- `created` — timestamp
- `session_id` — which session produced it
- `depth` — how many elaboration cycles it went through (proxy for maturity)
- `status` — `emerging` | `crystallized` | `archived`

### Object Extraction: How They Form

The model performs extraction. During or after dialogue flow:
1. Model identifies when a distinct semantic unit has emerged from the exchange
2. Model proposes an object: label, summary, type, suggested connections to existing objects
3. Object appears in the visual space with `emerging` status (visually distinct — softer, less defined)
4. Human can crystallize (confirm), edit, connect, nest, or dismiss
5. Crystallized objects become permanent nodes in the graph

This means the model has a dual role: it participates in dialogue AND it acts as the object extraction engine. These can be separate model calls — one for generative dialogue, one for object identification.

### Visual Grammar

- **Proximity** = conceptual closeness (objects that relate cluster together)
- **Size** = depth/maturity (more elaborated objects are larger)
- **Nesting** = containment (click an object to see sub-objects inside)
- **Connection lines** = explicit relationships (labeled edges)
- **Opacity** = status (emerging objects are translucent, crystallized are solid)
- **Color** = type (subtle, not garish — warm tones, the same palette as the entry tool)
- **Glow/pulse** = recently active (objects just created or modified pulse gently)

### The Dialogue Subspace

The dialogue is not the primary view. It exists as a **panel that can be invoked and dismissed**.

- Default state: the visual space fills the screen
- User enters dialogue by beginning to type (anywhere — no text box needed)
- A translucent dialogue stream appears (bottom? side? overlay?) — position TBD through testing
- Text flows continuously. No send button. The model picks up input in real time or on pause detection.
- As objects crystallize from dialogue, they float up/out into the visual space
- When the user stops typing for a sustained period, the dialogue panel fades
- The dialogue text is transient — it's not saved as visible history (the objects are the persistent record, with source_text stored inside them)

### Context Management

When starting a session:
1. The object graph loads as the base context
2. Objects are serialized as structured data (not raw text) — token efficient
3. The model receives the topology: what objects exist, how they connect, their summaries
4. Human navigates to a region of the graph → those objects load with full detail
5. Dialogue proceeds with that region as active context
6. New objects from dialogue are added to the graph in real time

This means:
- Context is **navigable** — you choose what's in scope by where you look
- A massive accumulated knowledge base is traversable without consuming the full window
- The model understands spatial relationships as semantic relationships

### The Onboarding Problem

The simulated user test revealed: without understanding what threshold cognition IS, the tool is meaningless. A breathing exercise feels arbitrary. Freewriting feels like journaling.

Resolution — **the app must teach the concept through the experience, not through explanation.**

Onboarding sequence:
1. **First encounter**: Brief orienting text. Not an essay. Something like: "This is a different way of working with AI. Instead of composing messages, you'll learn to let ideas arrive before they're fully formed. The tool helps you get there."
2. **Guided first session**: The entry sequence (breathing → freewriting → release) but with contextual micro-prompts that explain WHY each phase exists as you enter it. "You're quieting the part of your mind that wants to edit. That part is useful — but not right now."
3. **First object emergence**: After the entry sequence flows into actual dialogue, the FIRST object crystallizes visibly. "That idea just became an object. It's yours. It persists. Next time you open this, it'll be here." This is the aha moment.
4. **Progressive disclosure**: Features emerge as the user's practice deepens. Session 1 is simple. Session 5 has the full visual space. The interface grows with the user.

### Session Lifecycle

```
BEFORE SESSION
  └─ Review: see the existing object graph
  └─ Orient: notice what's unfinished, what has energy
  └─ Entry: guided practice to shift cognitive state

DURING SESSION  
  └─ Dialogue: generative loop (mostly in subspace)
  └─ Crystallization: objects emerge and populate the space
  └─ Navigation: move between regions of the graph as focus shifts

AFTER SESSION
  └─ Integration: model proposes new connections across the full graph
  └─ Metrics: session stats (duration, objects created, depth, typing rhythm)
  └─ Priming: model suggests threads for next session
```

---

## Tech Stack (Recommended)

- **Frontend**: React + Canvas/SVG for the visual space (or a library like ReactFlow for the graph)
- **Dialogue engine**: Anthropic API (Claude) — one stream for generative dialogue, one for object extraction
- **Persistence**: Local-first (IndexedDB or similar) with optional sync
- **Object graph**: Lightweight graph database or JSON structure with adjacency lists
- **Entry tool**: Already prototyped as React component (needs text color fix — warmer white)

---

## Build Phases

### Phase 1: Core Loop
- Dialogue interface (stream-based, not chat-based)
- Object extraction from dialogue (model proposes objects)
- Basic visual space (objects appear, can be arranged)
- Persistence across sessions (local storage of object graph)

### Phase 2: Visual Intelligence  
- Connection lines between objects
- Nesting (click to enter an object and see its children)
- Spatial clustering (model suggests positions based on semantic proximity)
- Visual grammar fully implemented (size, opacity, color by type)

### Phase 3: Context Navigation
- Region-based context loading (navigate graph to set dialogue context)
- Object graph serialization for efficient context management
- Cross-session continuity (start where you left off)

### Phase 4: Entry & Onboarding
- Guided entry sequence (already prototyped)
- Onboarding flow for new users
- Progressive disclosure of features across sessions

### Phase 5: Measurement & Iteration
- Session metrics and tracking
- Typing cadence analysis
- Object graph growth visualization over time
- State depth estimation from behavioral signals

---

## Open Design Questions (To Resolve Through Prototyping)

1. Where does the dialogue panel sit relative to the visual space? (bottom, side, overlay, fullscreen toggle?)
2. What's the right pause duration before the model responds in stream mode?
3. How much should the model explain object extraction vs. just doing it silently?
4. How does the user *disagree* with an object extraction without breaking the generative state?
5. What happens when the graph gets very large? (hundreds of objects across dozens of sessions)
6. Should there be an audio/ambient layer? (the essay describes auditory suppression — should the tool assist that?)
7. Can the object graph be shared or is this inherently single-user?

---

## Design Principles

1. **The dialogue is the engine, not the interface**
2. **Objects are the product, text is the process**
3. **The editor is welcome — after crystallization, not during generation**
4. **The space grows with the user's thinking, not their message count**
5. **Context is navigated, not consumed**
6. **Teach through experience, not explanation**

---

*This document is itself a product of the process it describes. Take it into Claude Code and start building.*
