import {
  loadPipeline,
  savePipeline,
  loadGoal,
  loadObjects,
  loadGraph,
  loadDocument,
  saveDocument,
  loadRationale,
  saveRationale,
  saveDocPart,
  loadDocParts,
} from './storage.js';
import { runClaudeCli } from './claude-cli.js';

// Format-specific guidance for plan-of-plan generation
const FORMAT_GUIDANCE = {
  essay: 'thesis statement, argument structure, tone/voice, evidence strategy, conclusion approach',
  analysis: 'analytical framework, key metrics/dimensions, data sources from graph, methodology, findings structure',
  book: 'chapter structure, narrative arc, key themes, target audience, pacing strategy',
  report: 'executive summary approach, section breakdown, findings format, recommendations structure',
  article: 'hook/angle, section flow, key arguments, supporting evidence, call to action',
  paper: 'abstract scope, literature context, methodology, results structure, discussion framework',
};

function getFormatGuidance(outputFormat) {
  const fmt = (outputFormat || 'essay').toLowerCase();
  return FORMAT_GUIDANCE[fmt] || FORMAT_GUIDANCE.essay;
}

// Build a concise context string from graph objects, optionally filtered by keywords
export function buildObjectContext(objects, keywords = null) {
  let filtered = objects;
  if (keywords && keywords.length > 0) {
    const lowerKw = keywords.map(k => k.toLowerCase());
    filtered = objects.filter(obj => {
      const text = `${obj.label} ${obj.summary || ''} ${obj.type}`.toLowerCase();
      return lowerKw.some(kw => text.includes(kw));
    });
    if (filtered.length < 3 && objects.length >= 3) {
      filtered = objects.slice(0, Math.min(10, objects.length));
    }
  }
  return filtered
    .map(o => `- [${o.type}] "${o.label}": ${o.summary || 'no summary'}`)
    .join('\n');
}

export function buildEdgeContext(graph, objects) {
  const edges = graph.edges || [];
  if (edges.length === 0) return '';
  const objectMap = new Map(objects.map(o => [o.id, o.label]));
  const edgeLines = edges.slice(0, 30).map(e => {
    const src = objectMap.get(e.source) || e.source;
    const tgt = objectMap.get(e.target) || e.target;
    return `- "${src}" → "${tgt}"${e.label ? ` (${e.label})` : ''}`;
  });
  return '\nConnections:\n' + edgeLines.join('\n');
}

// Parse rationale docs from plan-of-plan content
export function parsePlanOfPlan(content) {
  const match = content.match(/<threshold-rationale-docs>([\s\S]*?)<\/threshold-rationale-docs>/);
  if (!match) return [];
  try {
    return JSON.parse(match[1]);
  } catch {
    return [];
  }
}

// ---- Generation functions ----

export async function generatePlanOfPlan() {
  const goal = await loadGoal();
  if (!goal) throw new Error('No goal set. Set a goal before generating documents.');

  const objects = await loadObjects();
  const objectContext = buildObjectContext(objects);
  const guidance = getFormatGuidance(goal.outputFormat);

  const prompt = `You are a document planning assistant for Threshold, a knowledge graph reasoning platform.

The user wants to create a "${goal.outputFormat || 'essay'}" about:
"${goal.text}"

Their knowledge graph contains these elements:
${objectContext}

For this document format, identify what RATIONALE DOCUMENTS are needed before writing. Each rationale doc explores one aspect of the document's strategy. Consider: ${guidance}

For example, an essay might need rationale docs for: "Argument Structure", "Tone & Voice", "Evidence Strategy".
A book might need: "Chapter Arc", "Character Development", "Thematic Framework".

Output TWO things:

1. A markdown description of each rationale document needed, with what it should cover.

2. At the end, a structured JSON block listing each rationale doc:
<threshold-rationale-docs>
[
  {"slug": "argument-structure", "label": "Argument Structure", "description": "Defines the core thesis and how arguments build toward it"},
  {"slug": "tone-and-voice", "label": "Tone & Voice", "description": "Establishes the writing style, register, and audience approach"},
  {"slug": "evidence-strategy", "label": "Evidence Strategy", "description": "Maps which graph elements serve as evidence for which claims"}
]
</threshold-rationale-docs>

Use kebab-case for slugs. Keep to 3-6 rationale docs — enough to cover the key aspects without overcomplicating.`;

  const result = await runClaudeCli(prompt);
  await saveDocument('plan-of-plan', result);
  return result;
}

export async function generateRationaleContent(slug) {
  const goal = await loadGoal();
  if (!goal) throw new Error('No goal set.');

  // Load existing rationale doc content (user may have inserted objects)
  const existing = await loadRationale(slug);
  const objects = await loadObjects();
  const graph = await loadGraph();
  const edgeContext = buildEdgeContext(graph, objects);

  const prompt = `You are a document strategist. The user is building a "${goal.outputFormat || 'essay'}" about:
"${goal.text}"

They are working on a rationale document for: "${slug.replace(/-/g, ' ')}"

${existing ? `The user has curated the following content (including graph objects they selected):\n\n${existing}\n\n` : 'The document is currently empty.\n\n'}

Available graph elements:
${buildObjectContext(objects)}
${edgeContext}

Write supplementary prose that:
1. Builds on any objects the user has already inserted
2. Synthesizes the relevant graph knowledge into a coherent rationale
3. Identifies any gaps — what's missing from the graph that would strengthen this aspect?
4. Keeps the focus on how this rationale serves the overall document goal

Output as clean markdown. Preserve any existing object blocks the user inserted (the --- delimited sections). Add your analysis and prose around them.`;

  const result = await runClaudeCli(prompt);
  await saveRationale(slug, result);
  return result;
}

export async function generatePlan() {
  const goal = await loadGoal();
  if (!goal) throw new Error('No goal set.');

  const objects = await loadObjects();
  const graph = await loadGraph();
  const objectContext = buildObjectContext(objects);
  const edgeContext = buildEdgeContext(graph, objects);

  // Load all rationale docs
  const pipeline = await loadPipeline();
  const rationaleKeys = Object.keys(pipeline.documents).filter(k => k.startsWith('rationale:'));
  const rationaleDocs = [];
  for (const key of rationaleKeys) {
    const slug = key.replace('rationale:', '');
    const content = await loadRationale(slug);
    if (content) {
      const label = pipeline.documents[key].label || slug;
      rationaleDocs.push({ label, content });
    }
  }

  const rationaleBlock = rationaleDocs.map(r =>
    `### Rationale: ${r.label}\n${r.content}`
  ).join('\n\n');

  const prompt = `You are a document architect. Create a detailed plan/outline for a "${goal.outputFormat || 'essay'}".

Goal: "${goal.text}"

Rationale Documents:
${rationaleBlock}

Knowledge Graph:
${objectContext}
${edgeContext}

Create a structured outline with MAXIMUM 3 levels of headings:
- # Document Title
- ## Major Sections
- ### Sub-sections

For EACH section at every level, specify:
1. What it covers (brief description)
2. Which rationale doc(s) inform it (by name)
3. Which graph objects are relevant (by label)

This outline IS the plan. It should be comprehensive enough that each section can be written independently.

Output as structured markdown.`;

  const result = await runClaudeCli(prompt);
  await saveDocument('plan', result);
  return result;
}

export async function generateGenPlan() {
  const goal = await loadGoal();
  if (!goal) throw new Error('No goal set.');

  const plan = await loadDocument('plan');
  if (!plan) throw new Error('Plan must be generated first.');

  const prompt = `You are a document production planner. Given this document outline/plan, determine how to batch sections into generation runs (doc parts).

Goal: "${goal.text}"
Format: ${goal.outputFormat || 'essay'}

Document Plan:
${plan}

Group the outline sections into doc parts. Each doc part should:
1. Be a coherent chunk (not splitting mid-argument)
2. Be manageable for a single generation run
3. Include all needed context references

Output a numbered list:
## Doc Part 1: [Title/Description]
- Sections: 1.1, 1.2, 1.3
- Rationale docs needed: [list]
- Key graph objects: [list]

## Doc Part 2: [Title/Description]
...

Keep to 3-8 doc parts depending on document complexity.`;

  const result = await runClaudeCli(prompt);
  await saveDocument('generation-plan', result);
  return result;
}

export async function generateDocPart(partIndex) {
  const goal = await loadGoal();
  if (!goal) throw new Error('No goal set.');

  const genPlan = await loadDocument('generation-plan');
  const plan = await loadDocument('plan');
  if (!genPlan || !plan) throw new Error('Generation plan and plan must exist first.');

  const objects = await loadObjects();
  const graph = await loadGraph();

  // Extract the relevant section from the generation plan
  const partSections = genPlan.split(/^## Doc Part \d+/m).filter(s => s.trim());
  const section = partSections[partIndex - 1] || '';

  // Load rationale docs mentioned in this section
  const pipeline = await loadPipeline();
  const rationaleKeys = Object.keys(pipeline.documents).filter(k => k.startsWith('rationale:'));
  const rationaleDocs = [];
  for (const key of rationaleKeys) {
    const slug = key.replace('rationale:', '');
    const content = await loadRationale(slug);
    if (content) {
      const label = pipeline.documents[key].label || slug;
      // Include if mentioned in the section or if section doesn't specify
      if (!section || section.toLowerCase().includes(label.toLowerCase()) || section.toLowerCase().includes(slug)) {
        rationaleDocs.push({ label, content: content.substring(0, 1500) }); // Budget context
      }
    }
  }

  const rationaleBlock = rationaleDocs.length > 0
    ? '\nRelevant Rationale:\n' + rationaleDocs.map(r => `**${r.label}:** ${r.content}`).join('\n\n')
    : '';

  // Filter objects by keywords from section
  const keywords = extractKeywords(section, objects);
  const objectContext = buildObjectContext(objects, keywords);
  const edgeContext = buildEdgeContext(graph, objects);

  const prompt = `You are a skilled writer. Write Doc Part ${partIndex} of a ${goal.outputFormat || 'essay'}.

Goal: "${goal.text}"

This part's plan:
${section}

Full document outline (for context on flow):
${plan.substring(0, 2000)}
${rationaleBlock}

Relevant knowledge:
${objectContext}
${edgeContext}

Write polished prose in markdown. Use:
- ## for major sections
- ### for subsections
Black and white, book-like formatting. No unnecessary decoration. Let the content speak.`;

  const result = await runClaudeCli(prompt);
  await saveDocPart(partIndex, result);
  return result;
}

function extractKeywords(sectionText, objects) {
  const keywords = [];
  for (const obj of objects) {
    if (sectionText.toLowerCase().includes(obj.label.toLowerCase())) {
      keywords.push(obj.label);
    }
  }
  const words = sectionText.match(/\b[A-Z][a-z]{3,}\b/g) || [];
  keywords.push(...words.slice(0, 5));
  return [...new Set(keywords)];
}

export async function assembleFinal() {
  const parts = await loadDocParts();
  if (parts.length === 0) throw new Error('Doc parts must be generated first.');

  const assembled = parts.map(p => p.content).join('\n\n---\n\n');
  await saveDocument('final', assembled);
  return assembled;
}
