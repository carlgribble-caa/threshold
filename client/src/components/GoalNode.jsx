import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function GoalNode({ data }) {
  const { label, summary } = data;

  return (
    <div
      style={{
        width: 220,
        padding: 14,
        background: 'rgba(30, 25, 18, 0.9)',
        border: '1px solid rgba(212, 197, 116, 0.4)',
        borderRadius: 10,
        color: '#d4c574',
        boxShadow: '0 0 20px rgba(212, 197, 116, 0.1)',
      }}
    >
      <Handle type="target" position={Position.Bottom} style={{ background: '#d4c574', border: 'none', width: 6, height: 6 }} />
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#d4c57480', marginBottom: 4 }}>goal</div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      {summary && (
        <div style={{ fontSize: 11, color: '#d4c57499', marginTop: 6, lineHeight: 1.4 }}>{summary}</div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: '#d4c574', border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

export default memo(GoalNode);
