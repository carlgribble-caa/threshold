export default function Sidebar({ open, onToggle }) {
  return (
    <>
      {/* Hover trigger zone — left edge */}
      <div
        onMouseEnter={onToggle}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 12,
          height: '100vh',
          zIndex: 900,
        }}
      />
      {open && (
        <div
          onMouseLeave={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 260,
            height: '100vh',
            background: 'rgba(15, 13, 10, 0.92)',
            borderRight: '1px solid rgba(212, 165, 116, 0.1)',
            backdropFilter: 'blur(20px)',
            padding: '24px 16px',
            zIndex: 950,
            color: '#d4a574',
            fontSize: 13,
          }}
        >
          <h3 style={{ fontSize: 14, fontWeight: 400, letterSpacing: '0.06em', marginBottom: 24, color: '#a67c52' }}>
            THRESHOLD
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ color: '#6b5a45' }}>Sessions</div>
            <button
              style={{
                background: 'rgba(212, 165, 116, 0.08)',
                border: '1px solid rgba(212, 165, 116, 0.15)',
                borderRadius: 6,
                color: '#d4a574',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              End Session
            </button>
            <div style={{ marginTop: 24, color: '#6b5a45' }}>Graph Health</div>
            <div style={{ color: '#4a3f33', fontSize: 11 }}>No objects yet</div>
          </div>
        </div>
      )}
    </>
  );
}
