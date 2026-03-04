# Threshold

**A thinking tool that turns conversation into structure.**

You talk to an AI about something you're trying to understand — consciousness, a business problem, a research question, anything. As you think out loud, the system extracts discrete intellectual objects from the dialogue: concepts, claims, tensions, questions, evidence, patterns, metaphors, assumptions, principles.

Those objects live on a graph — a visual canvas where you can see how your ideas relate to each other. Connections form between objects (this claim *challenges* that assumption, this evidence *supports* that concept). The graph isn't decoration — it's a working model of your thinking.

## Why chat isn't enough anymore

Chat interfaces were designed for LLMs that are fundamentally text-in, text-out. You type, you get an answer, the conversation scrolls. That was fine for lookup and generation. But reasoning models think differently — they benefit from structured context, not just conversation history. Threshold is a UI built for how reasoning models actually work: give them the right objects, the right relationships, the right gaps, and they reason better. Chat is a straw. Threshold is a lens.

## What makes Threshold different

### The canvas is a context management and reasoning engine

The graph isn't just a visualization — it's the system's working memory. When you continue a dialogue, the system uses social network analysis to select which objects are structurally relevant to what you're saying right now. Claude doesn't get your whole history stuffed into a prompt — it gets the important parts, chosen by graph centrality, not recency. The model builds this engine through dialogue, then leverages it to focus its own thinking. It's an external reasoning scaffold that persists across every interaction.

### Reasoning is a verb, not just output

The toolbar has operations — induce, deduce, abduct, analogize, synthesize, decompose, bridge, challenge. These aren't just prompts. They're graph transformations. "Challenge this claim" produces a tension object that connects back to the claim. "Bridge these two concepts" produces a new relation. The graph grows through structured operations, not just conversation.

### It surfaces what's missing

The sidebar shows reasoning gaps — unchallenged claims, unsupported assertions, unresolved tensions. It does graph analysis to find isolated nodes, bridge objects (ideas that connect otherwise separate clusters), and structural health metrics. It tells you where your thinking is thin.

### Documents that exceed any model's context window

The document pipeline generates written output from the graph — but it doesn't try to hold everything in one prompt. It plans the document structure, generates each section individually with graph-informed context, then assembles the parts. The result can be far larger and more coherent than anything a single generation call could produce, because the graph provides the organizational intelligence that would otherwise require fitting everything into one context window.

## Why it matters

Most AI tools treat conversation as disposable and context as a constraint. Threshold treats your thinking as a persistent, navigable, analyzable structure — and uses that structure to make the AI smarter about what you're actually working on. The dialogue is the engine, the graph is the product, and the canvas is the context layer that lets a reasoning model think beyond its own window.

What if your thinking had architecture, and the AI could see it?

## Getting Started

See [local-dev-guide.md](local-dev-guide.md) for setup and running instructions.

## Architecture

- **Frontend**: React 18 + Vite + ReactFlow
- **Backend**: Express.js with file-based storage (JSON, YAML, Markdown)
- **AI**: Claude via Anthropic API or Claude CLI
- **Graph analysis**: Graphology + graphology-metrics (centrality, community detection, clustering)
- **11 object types**: concept, question, tension, claim, metaphor, relation, goal, evidence, assumption, pattern, principle
- **8 reasoning operations**: induce, deduce, abduct, analogize, synthesize, decompose, bridge, challenge

## Project Documentation

| Document | Purpose |
|----------|---------|
| [local-dev-guide.md](local-dev-guide.md) | How to run Threshold locally |
| [threshold-system-spec-draft.md](threshold-system-spec-draft.md) | Full system specification |
| [threshold-project-brief.md](threshold-project-brief.md) | Project brief |
| [user-test-case-methodology.md](user-test-case-methodology.md) | Testing methodology |
| [claude-cli-in-preview-sandbox.md](claude-cli-in-preview-sandbox.md) | Claude CLI sandbox setup notes |
