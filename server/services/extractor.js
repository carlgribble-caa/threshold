import crypto from 'crypto';

// Parse Claude's response to separate dialogue from structured extraction
export function extractObjects(rawResponse) {
  const result = {
    dialogue: rawResponse,
    objects: [],
    connections: [],
    suggestions: [],
  };

  // Look for <threshold-extract> block
  const extractMatch = rawResponse.match(/<threshold-extract>([\s\S]*?)<\/threshold-extract>/);

  if (extractMatch) {
    // Remove the extraction block from the dialogue text
    result.dialogue = rawResponse.replace(/<threshold-extract>[\s\S]*?<\/threshold-extract>/, '').trim();

    try {
      const extracted = JSON.parse(extractMatch[1]);

      if (extracted.objects) {
        result.objects = extracted.objects.map((obj) => ({
          id: crypto.randomUUID(),
          label: obj.label,
          summary: obj.summary || '',
          type: obj.type || 'concept',
          status: 'emerging',
          confidence: obj.confidence || 0.5,
          tags: [],
          source_text: '',
          position: { x: 0, y: 0 },
          children: [],
          depth: 0,
          session_id: null,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        }));
      }

      if (extracted.connections) {
        result.connections = extracted.connections.map((conn) => ({
          from_label: conn.from_label,
          to_label: conn.to_label,
          label: conn.label,
          status: 'proposed',
          source: 'claude',
          created: new Date().toISOString(),
        }));
      }

      if (extracted.suggestions) {
        result.suggestions = extracted.suggestions;
      }
    } catch (parseErr) {
      console.error('Failed to parse extraction JSON:', parseErr.message);
    }
  }

  return result;
}
