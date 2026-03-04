import { getBezierPath, EdgeLabelRenderer } from '@xyflow/react';

const EDGE_COLOR = '#8a746080';

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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={EDGE_COLOR}
        strokeWidth={1}
        strokeDasharray="6 4"
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
          {label && (
            <span style={{
              fontSize: 10,
              color: '#8a7460',
              background: 'rgba(10, 10, 10, 0.8)',
              padding: '2px 6px',
              borderRadius: 3,
              marginRight: 2,
            }}>
              {label}
            </span>
          )}

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
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
