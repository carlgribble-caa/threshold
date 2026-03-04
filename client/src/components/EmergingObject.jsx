// EmergingObject — orbits the dialogue overlay before crystallization
// Phase 1 stub: will use framer-motion for orbit animation + drag-to-crystallize

export default function EmergingObject({ object, onCrystallize, onDismiss }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: 'rgba(20, 18, 15, 0.5)',
        border: '1px dashed rgba(212, 165, 116, 0.3)',
        borderRadius: 8,
        color: '#d4a574',
        fontSize: 12,
        cursor: 'grab',
        opacity: 0.7,
      }}
    >
      <span>{object.label}</span>
      <button
        onClick={() => onDismiss?.(object.id)}
        style={{
          marginLeft: 8,
          background: 'none',
          border: 'none',
          color: '#6b5a45',
          cursor: 'pointer',
          fontSize: 11,
        }}
      >
        x
      </button>
    </div>
  );
}
