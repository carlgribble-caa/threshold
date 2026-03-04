import { useState, useRef, useEffect } from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const EDGE_COLOR = '#8a746080';
const MAX_LABEL = 25;

export default function ProposedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  data,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(label || '');
  const inputRef = useRef(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  // Sync editText when label prop changes externally
  useEffect(() => {
    setEditText(label || '');
  }, [label]);

  const text = label || '';
  const needsTruncation = text.length > MAX_LABEL;
  const displayText = !needsTruncation || expanded ? text : text.slice(0, MAX_LABEL) + '...';

  const handleEditStart = (e) => {
    e.stopPropagation();
    setEditText(label || '');
    setEditing(true);
  };

  const handleEditSave = () => {
    setEditing(false);
    const newLabel = editText.trim();
    if (newLabel !== (label || '')) {
      data?.onEditLabel?.(id, newLabel);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditText(label || '');
    }
  };

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={{ stroke: EDGE_COLOR, strokeWidth: 1, strokeDasharray: '6 4' }}
        className="react-flow__edge-path"
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="nodrag nopan"
        >
          {editing ? (
            <input
              ref={inputRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEditSave}
              onKeyDown={handleEditKeyDown}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: 10,
                color: '#e8c49a',
                background: 'rgba(10, 10, 10, 0.9)',
                border: '1px solid rgba(232, 196, 154, 0.3)',
                borderRadius: 3,
                padding: '3px 6px',
                outline: 'none',
                width: 160,
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <>
              {text && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (needsTruncation) setExpanded((v) => !v);
                  }}
                  style={{
                    fontSize: 10,
                    color: '#8a7460',
                    background: 'rgba(10, 10, 10, 0.8)',
                    padding: expanded ? '4px 8px' : '2px 6px',
                    borderRadius: 3,
                    marginRight: 2,
                    cursor: needsTruncation ? 'pointer' : 'default',
                    maxWidth: expanded ? 220 : 'none',
                    lineHeight: 1.4,
                    whiteSpace: expanded ? 'normal' : 'nowrap',
                  }}
                >
                  {displayText}
                </span>
              )}

              {/* Edit label button */}
              <button
                onClick={handleEditStart}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid rgba(232, 196, 154, 0.3)',
                  background: 'rgba(232, 196, 154, 0.1)',
                  color: '#c9a070',
                  fontSize: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                }}
                title="Edit label"
              >
                ✎
              </button>
            </>
          )}

          {!editing && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data?.onConfirm?.(id);
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid rgba(124, 176, 158, 0.4)',
                  background: 'rgba(124, 176, 158, 0.1)',
                  color: '#7cb09e',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                }}
                title="Confirm connection"
              >
                ✓
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data?.onReject?.(id);
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  border: '1px solid rgba(212, 138, 116, 0.4)',
                  background: 'rgba(212, 138, 116, 0.1)',
                  color: '#d48a74',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                }}
                title="Reject connection"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
