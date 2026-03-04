import { loadObjects, loadGraph, loadGoal } from './storage.js';
import { runClaudeCli } from './claude-cli.js';

// In-memory current suggestion (one slot)
let currentSuggestion = null;

export function getCurrentSuggestion() {
  return currentSuggestion;
}

export function clearSuggestion() {
  currentSuggestion = null;
}

function buildSuggestionPrompt(objects, edges, goal) {
  let prompt = `You are an analytical advisor for Threshold, a knowledge graph reasoning platform.
Look at the user's current graph and (if set) their goal, and suggest ONE specific, actionable next step.

Your suggestion should be one of these types:
- gap: A reasoning gap ("The claim 'X' lacks evidence — consider adding evidence or challenging it")
- structure: A structural opportunity ("Objects 'A' and 'B' seem related but aren't connected")
- operation: A reasoning operation to try ("Apply 'synthesize' to the tension 'X'")
- goal: A goal-related nudge ("Your goal is about X, but your graph explores Y")
- meta: A meta-observation ("You have 5 unchallenged claims — consider adding challenges")

If no goal is set, suggest setting one.

Respond with ONLY valid JSON (no markdown, no explanation):
{"text": "The suggestion in 1-2 sentences", "type": "gap|structure|operation|goal|meta", "targetLabel": "specific object label or null", "operation": "suggested reasoning operation or null"}`;

  if (goal) {
    prompt += `\n\nCurrent goal: "${goal.text}"`;
    prompt += `\nTarget output format: ${goal.outputFormat}`;
  } else {
    prompt += `\n\nNo goal is currently set.`;
  }

  if (objects.length === 0) {
    prompt += `\n\nThe graph is empty. Suggest starting a dialogue.`;
  } else {
    prompt += `\n\nGraph objects (${objects.length}):`;
    for (const o of objects) {
      prompt += `\n- "${o.label}" (${o.type}): ${o.summary || 'no summary'}`;
    }

    const confirmed = edges.filter(e => e.status === 'confirmed');
    if (confirmed.length > 0) {
      const labelMap = {};
      objects.forEach(o => { labelMap[o.id] = o.label; });
      prompt += `\n\nConnections (${confirmed.length}):`;
      for (const e of confirmed) {
        const src = labelMap[e.source] || e.source;
        const tgt = labelMap[e.target] || e.target;
        prompt += `\n- "${src}" --[${e.label || ''}]--> "${tgt}"`;
      }
    }

    // Structural observations
    const claims = objects.filter(o => o.type === 'claim');
    const tensions = objects.filter(o => o.type === 'tension');
    const isolated = objects.filter(o => !edges.some(e => e.source === o.id || e.target === o.id));

    if (claims.length > 0 || tensions.length > 0 || isolated.length > 0) {
      prompt += `\n\nObservations:`;
      if (claims.length > 0) prompt += `\n- ${claims.length} claims`;
      if (tensions.length > 0) prompt += `\n- ${tensions.length} tensions`;
      if (isolated.length > 0) prompt += `\n- ${isolated.length} isolated: ${isolated.map(o => o.label).join(', ')}`;
    }
  }

  return prompt;
}

function parseSuggestionResponse(raw) {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      text: raw.trim(),
      type: 'meta',
      targetLabel: null,
      operation: null,
      generated: new Date().toISOString(),
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      text: parsed.text || raw.trim(),
      type: parsed.type || 'meta',
      targetLabel: parsed.targetLabel || null,
      operation: parsed.operation || null,
      generated: new Date().toISOString(),
    };
  } catch {
    return {
      text: raw.trim(),
      type: 'meta',
      targetLabel: null,
      operation: null,
      generated: new Date().toISOString(),
    };
  }
}

export async function generateSuggestion() {
  const [objects, graph, goal] = await Promise.all([
    loadObjects().catch(() => []),
    loadGraph().catch(() => ({ edges: [] })),
    loadGoal().catch(() => null),
  ]);

  const crystallized = objects.filter(o => o.status === 'crystallized');
  const prompt = buildSuggestionPrompt(crystallized, graph.edges || [], goal);

  const rawResponse = await runClaudeCli(prompt);

  currentSuggestion = parseSuggestionResponse(rawResponse);
  return currentSuggestion;
}
