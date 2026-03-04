import { loadGoal } from './storage.js';
import { runClaudeCli } from './claude-cli.js';

// Operation-specific prompts that tell Claude what reasoning to perform
const OPERATION_PROMPTS = {
  explode: {
    name: 'Explode',
    prompt: (target, context) => `You are performing an EXPLODE reasoning operation on a knowledge graph object.

EXPLODE means: Take a complex idea and break it into its constituent sub-parts, aspects, or dimensions.

Target object to explode:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Break this object into 2-4 meaningful sub-components. Each should be a distinct aspect that together reconstruct the whole.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "concept|claim|pattern|principle|question|evidence|assumption", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each sub-object back to "${target.label}" with a descriptive relationship like "part of", "aspect of", "dimension of".`,
  },

  challenge: {
    name: 'Challenge',
    prompt: (target, context) => `You are performing a CHALLENGE reasoning operation on a knowledge graph object.

CHALLENGE means: Identify counter-evidence, weaknesses, edge cases, or alternative perspectives that undermine or complicate this object.

Target object to challenge:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Generate 1-3 challenges. These might be counter-examples, logical weaknesses, unstated assumptions, or tensions.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "tension|question|evidence|claim", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each challenge back to "${target.label}" with relationships like "challenges", "contradicts", "complicates".`,
  },

  bridge: {
    name: 'Bridge',
    prompt: (target, context) => `You are performing a BRIDGE reasoning operation on a knowledge graph.

BRIDGE means: Find a connecting concept that links two currently disconnected ideas, revealing a non-obvious relationship.

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Propose 1-2 bridging concepts that connect "${target.label}" to other objects in the graph that it's not currently connected to. The bridge should reveal a genuine intellectual connection.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "concept|relation|pattern|metaphor", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Each bridge object should connect to at least two existing objects.`,
  },

  analogize: {
    name: 'Analogize',
    prompt: (target, context) => `You are performing an ANALOGIZE reasoning operation on a knowledge graph object.

ANALOGIZE means: Find a structural parallel from another domain or context that mirrors the structure or dynamics of this idea.

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Propose 1-2 analogies. Each should map structure, not just surface similarity.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "metaphor|concept|pattern", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each analogy to "${target.label}" with "analogous to" or a more specific structural mapping.`,
  },

  induce: {
    name: 'Induce',
    prompt: (target, context) => `You are performing an INDUCE reasoning operation on a knowledge graph object.

INDUCE means: Look at this object and nearby related objects to derive a general principle or pattern that explains them.

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Propose 1-2 general principles or patterns that emerge from these specific instances.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "principle|pattern", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each principle to the objects it generalizes from using "generalizes" or "induced from".`,
  },

  deduce: {
    name: 'Deduce',
    prompt: (target, context) => `You are performing a DEDUCE reasoning operation on a knowledge graph object.

DEDUCE means: Given this general principle or concept, what specific implications or consequences follow logically?

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Derive 1-3 specific implications that follow from this object.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "claim|evidence|question", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each implication to "${target.label}" with "follows from", "implies", or "predicted by".`,
  },

  synthesize: {
    name: 'Synthesize',
    prompt: (target, context) => `You are performing a SYNTHESIZE reasoning operation on a knowledge graph object.

SYNTHESIZE means: Find a resolution or higher-order concept that reconciles this tension or contradiction.

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Propose 1-2 synthesizing concepts that resolve or transcend this tension. A good synthesis doesn't pick a side — it finds a framework that encompasses both.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "concept|principle|pattern", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each synthesis to "${target.label}" with "resolves", "synthesizes", or "transcends".`,
  },

  abduct: {
    name: 'Abduct',
    prompt: (target, context) => `You are performing an ABDUCT reasoning operation on a knowledge graph object.

ABDUCT means: Given this surprising or anomalous observation, what is the best explanation? Inference to the best explanation.

Target object:
- "${target.label}" (${target.type}): ${target.summary || 'no summary'}

${context}

Propose 1-2 explanatory hypotheses. Rank by plausibility.

Respond with ONLY a JSON block (no other text):
<threshold-extract>
{
  "objects": [
    { "label": "3-8 word name", "summary": "1-2 sentence description", "type": "claim|assumption|concept", "confidence": 0.0-1.0 }
  ],
  "connections": [
    { "from_label": "source label", "to_label": "target label", "label": "relationship" }
  ]
}
</threshold-extract>

Connect each hypothesis to "${target.label}" with "explains" or "accounts for".`,
  },
};

// Which operations make sense for which object types
export const OPERATIONS_FOR_TYPE = {
  concept:    ['explode', 'bridge', 'analogize', 'challenge', 'induce'],
  question:   ['abduct', 'bridge', 'deduce'],
  tension:    ['synthesize', 'challenge', 'bridge'],
  claim:      ['challenge', 'deduce', 'abduct'],
  metaphor:   ['analogize', 'explode', 'bridge'],
  relation:   ['explode', 'bridge'],
  evidence:   ['induce', 'abduct', 'challenge'],
  assumption: ['challenge', 'abduct', 'deduce'],
  pattern:    ['induce', 'analogize', 'explode'],
  principle:  ['deduce', 'challenge', 'analogize'],
};

function buildContext(existingObjects, edges, targetId, goal) {
  const neighbors = new Set();
  const relevantEdges = [];

  for (const e of edges) {
    if (e.source === targetId || e.target === targetId) {
      neighbors.add(e.source === targetId ? e.target : e.source);
      relevantEdges.push(e);
    }
  }

  const lines = [];
  if (existingObjects.length > 0) {
    lines.push('Existing graph objects:');
    for (const o of existingObjects) {
      const marker = neighbors.has(o.id) ? ' [CONNECTED]' : '';
      lines.push(`- "${o.label}" (${o.type}): ${o.summary || 'no summary'}${marker}`);
    }
  }
  if (relevantEdges.length > 0) {
    const labelMap = {};
    existingObjects.forEach((o) => { labelMap[o.id] = o.label; });
    lines.push('\nDirect connections:');
    for (const e of relevantEdges) {
      lines.push(`- "${labelMap[e.source] || e.source}" --[${e.label || ''}]--> "${labelMap[e.target] || e.target}"`);
    }
  }
  if (goal) {
    lines.push(`\nUser's goal: "${goal.text}" (target format: ${goal.outputFormat})`);
  }

  return lines.length > 0 ? lines.join('\n') : '';
}

export async function executeReasoning(operation, targetObject, existingObjects, edges) {
  const op = OPERATION_PROMPTS[operation];
  if (!op) throw new Error(`Unknown operation: ${operation}`);

  const goal = await loadGoal().catch(() => null);
  const context = buildContext(existingObjects, edges, targetObject.id, goal);
  const fullPrompt = op.prompt(targetObject, context);

  const rawResponse = await runClaudeCli(fullPrompt);

  return rawResponse;
}
