import { useState } from 'react';
import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const EDGE_COLOR = '#8a746080';
const MAX_LABEL = 25;

export default function ConfirmedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
}) {
  const [expanded, setExpanded] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const text = label || '';
  const needsTruncation = text.length > MAX_LABEL;
  const displayText = !needsTruncation || expanded ? text : text.slice(0, MAX_LABEL) + '...';

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={{ stroke: EDGE_COLOR, strokeWidth: 1 }}
        className="react-flow__edge-path"
      />

      {text && (
        <EdgeLabelRenderer>
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (needsTruncation) setExpanded((v) => !v);
            }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              fontSize: 10,
              color: '#8a7460',
              background: 'rgba(10, 10, 10, 0.8)',
              padding: expanded ? '4px 8px' : '2px 6px',
              borderRadius: 3,
              cursor: needsTruncation ? 'pointer' : 'default',
              maxWidth: expanded ? 220 : 'none',
              lineHeight: 1.4,
              whiteSpace: expanded ? 'normal' : 'nowrap',
            }}
            className="nodrag nopan"
          >
            {displayText}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
