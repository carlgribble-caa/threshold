// Threshold Object & Edge Schema
// Shared between client and server

export const OBJECT_TYPES = [
  'concept',
  'question',
  'tension',
  'claim',
  'metaphor',
  'relation',
  'goal',
  'evidence',
  'assumption',
  'pattern',
  'principle',
];

export const OBJECT_STATUS = ['emerging', 'crystallized', 'archived'];

export const EDGE_STATUS = ['proposed', 'confirmed'];

export const REASONING_OPERATIONS = [
  'induce',
  'deduce',
  'abduct',
  'explode',
  'bridge',
  'synthesize',
  'analogize',
  'challenge',
];

export function createObject({
  label,
  summary = '',
  type = 'concept',
  sourceText = '',
  position = { x: 0, y: 0 },
  sessionId = null,
  confidence = 0.5,
  tags = [],
}) {
  const id = crypto.randomUUID ? crypto.randomUUID() : require('uuid').v4();
  return {
    id,
    label,
    summary,
    type,
    status: 'emerging',
    confidence,
    tags,
    source_text: sourceText,
    position,
    children: [],
    depth: 0,
    session_id: sessionId,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  };
}

export function createEdge({ from, to, label, source = 'claude', sessionId = null }) {
  return {
    from,
    to,
    label,
    status: 'proposed',
    source,
    session_id: sessionId,
    created: new Date().toISOString(),
  };
}
