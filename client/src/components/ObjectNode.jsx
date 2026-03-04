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

const handleStyle = (color) => ({ background: color, border: 'none', width: 6, height: 6 });

function ConfidenceDots({ confidence, color }) {
  const filled = Math.round((confidence || 0.5) * 5);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: i < filled ? color : `${color}25`,
          }}
        />
      ))}
    </div>
  );
}

function ObjectNode({ data }) {
  const { label, type, status, summary, confidence, expanded, onDelete } = data;
  const color = typeColors[type] || '#d4a574';
  const isEmerging = status === 'emerging';
  const conf = confidence || 0.5;

  // Ambient glow: scales with confidence; claims get a warm warning tint
  const glowIntensity = Math.round(conf * 18);
  const isClaim = type === 'claim';
  const isTension = type === 'tension';
  const ambientGlow = isEmerging
    ? 'none'
    : expanded
      ? `0 0 24px ${color}15, 0 4px 20px rgba(0,0,0,0.4)`
      : `0 0 ${glowIntensity}px ${color}${Math.round(conf * 12).toString(16).padStart(2, '0')}`;

  // Claims/tensions get a subtle left accent bar
  const accentBorder = (isClaim || isTension) && !isEmerging
    ? { borderLeft: `2px solid ${color}60` }
    : {};

  return (
    <div
      style={{
        width: expanded ? 260 : 200,
        padding: expanded ? 16 : 12,
        background: isEmerging ? 'rgba(20, 18, 15, 0.5)' : 'rgba(20, 18, 15, 0.9)',
        border: `1px ${isEmerging ? 'dashed' : 'solid'} ${color}${expanded ? '60' : '40'}`,
        borderRadius: expanded ? 12 : 8,
        color,
        opacity: isEmerging ? 0.7 : 1,
        boxShadow: ambientGlow,
        transition: 'width 0.2s ease, padding 0.2s ease, box-shadow 0.3s ease, border-radius 0.2s ease',
        ...accentBorder,
      }}
    >
      <Handle id="top" type="source" position={Position.Top} style={handleStyle(color)} />
      <Handle id="top" type="target" position={Position.Top} style={handleStyle(color)} />
      <Handle id="right" type="source" position={Position.Right} style={handleStyle(color)} />
      <Handle id="right" type="target" position={Position.Right} style={handleStyle(color)} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle(color)} />
      <Handle id="bottom" type="target" position={Position.Bottom} style={handleStyle(color)} />
      <Handle id="left" type="source" position={Position.Left} style={handleStyle(color)} />
      <Handle id="left" type="target" position={Position.Left} style={handleStyle(color)} />

      {/* Header: type badge + confidence */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: `${color}80`, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{type}</div>
        <ConfidenceDots confidence={confidence} color={color} />
      </div>

      {/* Label */}
      <div style={{ fontSize: expanded ? 15 : 13, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>

      {/* Expanded content */}
      {expanded && (
        <>
          {summary && (
            <div style={{
              fontSize: 11,
              color: `${color}99`,
              marginTop: 10,
              lineHeight: 1.5,
              borderTop: `1px solid ${color}15`,
              paddingTop: 10,
            }}>
              {summary}
            </div>
          )}

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${color}15`,
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              style={{
                background: `${color}10`,
                border: `1px solid ${color}20`,
                borderRadius: 4,
                color: '#e8a08a',
                fontSize: 10,
                padding: '4px 10px',
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(ObjectNode);
