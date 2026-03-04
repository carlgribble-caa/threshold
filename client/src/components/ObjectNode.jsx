import { memo, useState, useRef, useEffect } from 'react';
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

// Operations available per type (mirrored from server)
const opsForType = {
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

const opStyle = (color) => ({
  background: `${color}12`,
  border: `1px solid ${color}25`,
  borderRadius: 4,
  color: `${color}cc`,
  fontSize: 10,
  padding: '4px 8px',
  cursor: 'pointer',
  letterSpacing: '0.03em',
  textTransform: 'capitalize',
});

const actionBtnStyle = (color) => ({
  background: `${color}10`,
  border: `1px solid ${color}20`,
  borderRadius: 4,
  fontSize: 10,
  padding: '4px 10px',
  cursor: 'pointer',
  letterSpacing: '0.04em',
});

function ObjectNode({ data }) {
  const { label, type, status, summary, confidence, expanded, onDelete, onReason, onEdit, reasoning, _metrics } = data;
  const color = typeColors[type] || '#d4a574';
  const isEmerging = status === 'emerging';
  const conf = confidence || 0.5;

  const [editMode, setEditMode] = useState(false);
  const [editLabel, setEditLabel] = useState(label);
  const [editSummary, setEditSummary] = useState(summary || '');
  const labelRef = useRef(null);

  // Sync edit fields when data changes externally
  useEffect(() => { setEditLabel(label); }, [label]);
  useEffect(() => { setEditSummary(summary || ''); }, [summary]);

  // Focus label input when entering edit mode
  useEffect(() => {
    if (editMode && labelRef.current) {
      labelRef.current.focus();
      labelRef.current.select();
    }
  }, [editMode]);

  // Exit edit mode when node collapses
  useEffect(() => {
    if (!expanded && editMode) {
      handleSave();
      setEditMode(false);
    }
  }, [expanded]);

  const handleSave = () => {
    const newLabel = editLabel.trim();
    const newSummary = editSummary.trim();
    const updates = {};
    if (newLabel && newLabel !== label) updates.label = newLabel;
    if (newSummary !== (summary || '')) updates.summary = newSummary;
    if (Object.keys(updates).length > 0) onEdit?.(updates);
  };

  const handleDone = (e) => {
    e.stopPropagation();
    handleSave();
    setEditMode(false);
  };

  // Metric-driven ambient signals
  const deg = _metrics?.degreeCentrality || 0;
  const isBridge = _metrics?.isBridge || false;
  const isIsolated = _metrics?.isIsolated || false;
  const isUnchallengedClaim = _metrics?.isUnchallengedClaim || false;
  const isUnsupportedClaim = _metrics?.isUnsupportedClaim || false;
  const isUnresolvedTension = _metrics?.isUnresolvedTension || false;
  const cc = _metrics?.clusteringCoefficient || 0;

  // Ambient glow: scales with confidence + degree centrality boost
  const glowIntensity = Math.round(conf * 18 * (1 + deg * 2));
  const isClaim = type === 'claim';
  const isTension = type === 'tension';
  const ambientGlow = isEmerging
    ? 'none'
    : expanded
      ? `0 0 24px ${color}15, 0 4px 20px rgba(0,0,0,0.4)`
      : `0 0 ${glowIntensity}px ${color}${Math.round(conf * 12).toString(16).padStart(2, '0')}`;

  // Accent borders — unchallenged claims get warning hue
  const hasAccent = (isClaim || isTension) && !isEmerging;
  const accentColor = isUnchallengedClaim ? 'rgba(232, 140, 100, 0.5)' : `${color}60`;

  const bColor = `${color}${expanded ? '60' : '40'}`;
  const bStyle = isEmerging ? 'dashed' : (isUnsupportedClaim ? 'dashed' : 'solid');

  const shadows = [
    hasAccent || isUnchallengedClaim ? `inset 2px 0 0 ${accentColor}` : null,
    ambientGlow !== 'none' ? ambientGlow : null,
    isBridge ? `0 0 12px rgba(255, 230, 180, 0.15)` : null,
    isUnresolvedTension ? `0 0 8px rgba(232, 140, 100, 0.2)` : null,
  ].filter(Boolean).join(', ') || 'none';

  // Isolated nodes: dimmer, desaturated
  const nodeOpacity = isEmerging ? 0.7 : isIsolated ? 0.55 : 1;
  // Cluster warmth: tight clusters get a warmer background
  const bgWarm = cc > 0.5 && !isEmerging;

  return (
    <div
      onClick={editMode ? (e) => e.stopPropagation() : undefined}
      style={{
        width: expanded ? 260 : 200,
        padding: expanded ? 16 : 12,
        background: isEmerging ? 'rgba(20, 18, 15, 0.5)' : bgWarm ? 'rgba(25, 20, 15, 0.92)' : 'rgba(20, 18, 15, 0.9)',
        border: `1px ${bStyle} ${bColor}`,
        borderRadius: expanded ? 12 : 8,
        color,
        opacity: nodeOpacity,
        filter: isIsolated && !isEmerging ? 'saturate(0.6)' : 'none',
        boxShadow: shadows,
        transition: 'width 0.2s ease, padding 0.2s ease, box-shadow 0.3s ease, border-radius 0.2s ease, opacity 0.3s ease, filter 0.3s ease',
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
      {expanded && editMode ? (
        <input
          ref={labelRef}
          className="nodrag"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === 'Escape') handleDone(e); e.stopPropagation(); }}
          style={{
            fontSize: 15,
            fontWeight: 500,
            lineHeight: 1.3,
            color,
            background: 'rgba(10, 10, 10, 0.6)',
            border: `1px solid ${color}40`,
            borderRadius: 4,
            padding: '4px 6px',
            outline: 'none',
            width: '100%',
            fontFamily: 'inherit',
          }}
        />
      ) : (
        <div style={{ fontSize: expanded ? 15 : 13, fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
      )}

      {/* Expanded content */}
      {expanded && (
        <>
          {/* Summary */}
          <div style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: `1px solid ${color}15`,
          }}>
            {editMode ? (
              <textarea
                className="nodrag"
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => { if (e.key === 'Escape') handleDone(e); e.stopPropagation(); }}
                placeholder="Add description..."
                rows={3}
                style={{
                  fontSize: 11,
                  color: `${color}99`,
                  lineHeight: 1.5,
                  background: 'rgba(10, 10, 10, 0.6)',
                  border: `1px solid ${color}40`,
                  borderRadius: 4,
                  padding: '4px 6px',
                  outline: 'none',
                  width: '100%',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            ) : (
              <div style={{ fontSize: 11, color: `${color}99`, lineHeight: 1.5 }}>
                {summary || <span style={{ opacity: 0.4, fontStyle: 'italic' }}>no description</span>}
              </div>
            )}
          </div>

          {/* Reasoning operations */}
          {!editMode && (
            <div style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: `1px solid ${color}15`,
            }}>
              <div style={{ fontSize: 9, color: `${color}50`, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Reason
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(opsForType[type] || ['challenge', 'bridge']).map((op) => (
                  <button
                    key={op}
                    disabled={reasoning}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReason?.(op);
                    }}
                    style={{
                      ...opStyle(color),
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
          )}

          {/* Actions: Edit / Done + Delete */}
          <div style={{
            display: 'flex',
            gap: 6,
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${color}10`,
          }}>
            {editMode ? (
              <button
                onClick={handleDone}
                style={{ ...actionBtnStyle(color), color: '#7cb09e' }}
              >
                Done
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditMode(true);
                }}
                style={{ ...actionBtnStyle(color), color: `${color}cc` }}
              >
                Edit
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              style={{ ...actionBtnStyle(color), color: '#e8a08a' }}
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
