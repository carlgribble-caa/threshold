import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const typeColors = {
  concept: '#d4a574',
  question: '#c9a96e',
  tension: '#d48a74',
  claim: '#bfa574',
  metaphor: '#d4b898',
  relation: '#a5a0d4',
  goal: '#d4c574',
  evidence: '#7cb09e',
  assumption: '#a68a6b',
  pattern: '#b5a0c9',
  principle: '#c9b074',
};

function ObjectNode({ data }) {
  const { label, type, status, summary, confidence } = data;
  const color = typeColors[type] || '#d4a574';
  const isEmerging = status === 'emerging';

  return (
    <div
      style={{
        width: 200,
        padding: 12,
        background: isEmerging ? 'rgba(20, 18, 15, 0.5)' : 'rgba(20, 18, 15, 0.85)',
        border: `1px ${isEmerging ? 'dashed' : 'solid'} ${color}40`,
        borderRadius: 8,
        color,
        opacity: isEmerging ? 0.7 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none', width: 6, height: 6 }} />
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 10, color: `${color}80`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{type}</div>
      {summary && (
        <div style={{ fontSize: 11, color: `${color}99`, marginTop: 6, lineHeight: 1.4 }}>{summary}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

export default memo(ObjectNode);
