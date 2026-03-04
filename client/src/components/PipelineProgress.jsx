import { useState } from 'react';

function getSegmentColor(status) {
  switch (status) {
    case 'approved': return '#7ab87a';
    case 'ready': return '#d4a574';
    case 'generating': return '#d4a574';
    case 'draft': return 'rgba(212, 165, 116, 0.4)';
    case 'empty': return 'rgba(232, 196, 154, 0.15)';
    case 'locked': return 'rgba(232, 196, 154, 0.05)';
    default: return 'rgba(232, 196, 154, 0.1)';
  }
}

export default function PipelineProgress({ pipeline }) {
  const [hoveredStep, setHoveredStep] = useState(null);

  if (!pipeline || pipeline.stage === 'idle') return null;

  const docs = pipeline.documents || {};
  const entries = Object.entries(docs);
  if (entries.length === 0) return null;

  const segWidth = Math.max(20, Math.min(48, 300 / entries.length));

  return (
    <div style={{
      position: 'fixed',
      bottom: 118,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 2,
      zIndex: 960,
      background: 'rgba(25, 22, 18, 0.7)',
      borderRadius: 4,
      padding: 2,
      backdropFilter: 'blur(8px)',
    }}>
      {entries.map(([key, doc]) => {
        const status = doc.status || 'empty';
        const isHovered = hoveredStep === key;
        const label = doc.label || key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return (
          <div
            key={key}
            onMouseEnter={() => setHoveredStep(key)}
            onMouseLeave={() => setHoveredStep(null)}
            style={{ position: 'relative' }}
          >
            <div style={{
              width: segWidth,
              height: 4,
              borderRadius: 2,
              background: getSegmentColor(status),
              animation: status === 'generating' ? 'progressPulse 1.2s ease-in-out infinite' : 'none',
              transition: 'background 0.3s ease',
            }} />
            {isHovered && (
              <div style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(25, 22, 18, 0.95)',
                border: '1px solid rgba(232, 196, 154, 0.15)',
                borderRadius: 4,
                padding: '3px 8px',
                whiteSpace: 'nowrap',
                fontSize: 10,
                color: '#8a7460',
                letterSpacing: '0.03em',
                pointerEvents: 'none',
              }}>
                {label}: {status}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
