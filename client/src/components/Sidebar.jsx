const typeColors = {
  concept: '#e8c49a',
  question: '#dbb880',
  tension: '#e8a08a',
  claim: '#d4b888',
  metaphor: '#e8cca8',
  relation: '#b5b0e8',
  goal: '#e8d888',
  evidence: '#8cc0ae',
  assumption: '#b8a080',
  pattern: '#c5b0d9',
  principle: '#d9c088',
};

export default function Sidebar({ open, onToggle, nodes = [], edges = [], onReset }) {
  // Count objects by type
  const typeCounts = {};
  nodes.forEach((n) => {
    const t = n.data?.type || 'concept';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  if (!open) return null;

  return (
    <>
      {/* Sidebar panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 260,
            height: '100vh',
            background: 'rgba(15, 13, 10, 0.92)',
            borderRight: '1px solid rgba(232, 196, 154, 0.1)',
            backdropFilter: 'blur(20px)',
            padding: '24px 16px',
            zIndex: 950,
            color: '#e8c49a',
            fontSize: 13,
            overflowY: 'auto',
          }}
        >
          {/* Close button */}
          <button
            onClick={onToggle}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: '#8a7460',
              cursor: 'pointer',
              fontSize: 18,
              padding: 8,
              lineHeight: 1,
            }}
          >
            x
          </button>

          <h3 style={{ fontSize: 14, fontWeight: 400, letterSpacing: '0.06em', marginBottom: 24, color: '#c9a070' }}>
            THRESHOLD
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Graph Health */}
            <div style={{ color: '#8a7460', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
              Graph Health
            </div>

            {nodes.length === 0 ? (
              <div style={{ color: '#5a4e42', fontSize: 11 }}>No objects yet</div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#8a7460' }}>Objects</span>
                  <span>{nodes.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: '#8a7460' }}>Connections</span>
                  <span>{edges.length}</span>
                </div>

                {/* Type breakdown */}
                <div style={{ marginTop: 8 }}>
                  {Object.entries(typeCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([type, count]) => (
                      <div
                        key={type}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: 11,
                          padding: '3px 0',
                        }}
                      >
                        <span style={{ color: typeColors[type] || '#8a7460' }}>{type}</span>
                        <span style={{ color: '#5a4e42' }}>{count}</span>
                      </div>
                    ))}
                </div>
              </>
            )}

            {/* Session controls */}
            <div style={{ marginTop: 24, color: '#8a7460', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
              Session
            </div>
            <button
              onClick={() => {
                if (nodes.length === 0 || confirm('Clear all objects and connections? This cannot be undone.')) {
                  onReset?.();
                }
              }}
              style={{
                background: 'rgba(232, 196, 154, 0.08)',
                border: '1px solid rgba(232, 196, 154, 0.15)',
                borderRadius: 6,
                color: '#e8c49a',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              End Session
            </button>
          </div>
        </div>
      )}
    </>
  );
}
