import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const color = '#d4c574';
const handleStyle = { background: color, border: 'none', width: 6, height: 6 };

function ConfidenceDots({ confidence }) {
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

const goalOps = ['deduce', 'explode', 'bridge'];

const opStyle = {
  background: `${color}12`,
  border: `1px solid ${color}25`,
  borderRadius: 4,
  color: `${color}cc`,
  fontSize: 10,
  padding: '4px 8px',
  cursor: 'pointer',
  letterSpacing: '0.03em',
  textTransform: 'capitalize',
};

function GoalNode({ data }) {
  const { label, summary, confidence, expanded, onDelete, onReason, reasoning } = data;

  return (
    <div
      style={{
        width: expanded ? 280 : 220,
        padding: expanded ? 16 : 14,
        background: 'rgba(30, 25, 18, 0.9)',
        border: `1px solid rgba(212, 197, 116, ${expanded ? 0.5 : 0.4})`,
        borderRadius: expanded ? 12 : 10,
        color,
        boxShadow: expanded
          ? '0 0 30px rgba(212, 197, 116, 0.15), 0 4px 20px rgba(0,0,0,0.4)'
          : '0 0 20px rgba(212, 197, 116, 0.1)',
        transition: 'width 0.2s ease, padding 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <Handle id="top" type="source" position={Position.Top} style={handleStyle} />
      <Handle id="top" type="target" position={Position.Top} style={handleStyle} />
      <Handle id="right" type="source" position={Position.Right} style={handleStyle} />
      <Handle id="right" type="target" position={Position.Right} style={handleStyle} />
      <Handle id="bottom" type="source" position={Position.Bottom} style={handleStyle} />
      <Handle id="bottom" type="target" position={Position.Bottom} style={handleStyle} />
      <Handle id="left" type="source" position={Position.Left} style={handleStyle} />
      <Handle id="left" type="target" position={Position.Left} style={handleStyle} />

      {/* Header: type badge + confidence */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: `${color}80` }}>goal</div>
        <ConfidenceDots confidence={confidence} />
      </div>

      <div style={{ fontSize: expanded ? 16 : 14, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>

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

          {/* Reasoning operations */}
          <div style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: `1px solid ${color}15`,
          }}>
            <div style={{ fontSize: 9, color: `${color}50`, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Reason
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {goalOps.map((op) => (
                <button
                  key={op}
                  disabled={reasoning}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReason?.(op);
                  }}
                  style={{
                    ...opStyle,
                    opacity: reasoning ? 0.4 : 1,
                    cursor: reasoning ? 'wait' : 'pointer',
                  }}
                >
                  {op}
                </button>
              ))}
            </div>
            {reasoning && (
              <div style={{ fontSize: 10, color: `${color}60`, marginTop: 6, fontStyle: 'italic' }}>
                reasoning...
              </div>
            )}
          </div>

          {/* Delete */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${color}10`,
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

export default memo(GoalNode);
