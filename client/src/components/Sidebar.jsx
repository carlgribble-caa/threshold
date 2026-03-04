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

const sectionHeader = { color: '#8a7460', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11, marginTop: 20 };
const metricRow = { display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' };
const metricLabel = { color: '#8a7460' };
const metricValue = { color: '#e8c49a' };
const warningColor = '#e8a08a';

function ClickableItem({ label, color: itemColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        fontSize: 11,
        color: itemColor || '#e8c49a',
        padding: '2px 0',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  );
}

export default function Sidebar({ open, onToggle, nodes = [], edges = [], onReset, metrics, onNodeFocus, onGapClick }) {
  // Count objects by type
  const typeCounts = {};
  nodes.forEach((n) => {
    const t = n.data?.type || 'concept';
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  });

  if (!open) return null;

  const gm = metrics?.graph;
  const hasMetrics = gm && gm.nodeCount > 0;

  // Clustering descriptor
  let clusterDesc = '';
  if (hasMetrics) {
    const avgClustering = Object.values(metrics.nodes || {}).reduce((sum, n) => sum + (n.clusteringCoefficient || 0), 0) / (gm.nodeCount || 1);
    if (avgClustering > 0.5) clusterDesc = 'tightly clustered';
    else if (avgClustering > 0.2) clusterDesc = 'moderately connected';
    else if (avgClustering > 0) clusterDesc = 'loosely connected';
    else clusterDesc = 'sparse';
  }

  return (
    <>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Overview */}
            <div style={sectionHeader}>Overview</div>

            {nodes.length === 0 ? (
              <div style={{ color: '#5a4e42', fontSize: 11 }}>No objects yet</div>
            ) : (
              <>
                <div style={metricRow}>
                  <span style={metricLabel}>Objects</span>
                  <span style={metricValue}>{nodes.length}</span>
                </div>
                <div style={metricRow}>
                  <span style={metricLabel}>Connections</span>
                  <span style={metricValue}>{edges.length}</span>
                </div>
                {hasMetrics && (
                  <>
                    <div style={metricRow}>
                      <span style={metricLabel}>Density</span>
                      <span style={metricValue}>{Math.round(gm.density * 100)}%</span>
                    </div>
                    <div style={metricRow}>
                      <span style={metricLabel}>Components</span>
                      <span style={metricValue}>{gm.connectedComponents} {gm.connectedComponents === 1 ? 'island' : 'islands'}</span>
                    </div>
                    <div style={metricRow}>
                      <span style={metricLabel}>Clustering</span>
                      <span style={{ ...metricValue, fontSize: 11 }}>{clusterDesc}</span>
                    </div>
                  </>
                )}

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

            {/* Structural Health */}
            {hasMetrics && (gm.mostConnected.length > 0 || gm.bridgeObjects.length > 0 || gm.isolatedNodes.length > 0) && (
              <>
                <div style={sectionHeader}>Structure</div>

                {gm.mostConnected.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: '#8a7460', marginBottom: 2 }}>Most connected</div>
                    {gm.mostConnected.slice(0, 3).map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ClickableItem label={item.label} onClick={() => onNodeFocus?.(item.id)} />
                        <span style={{ fontSize: 10, color: '#5a4e42', flexShrink: 0, marginLeft: 8 }}>{item.degree}</span>
                      </div>
                    ))}
                  </div>
                )}

                {gm.bridgeObjects.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#8a7460', marginBottom: 2 }}>Bridge objects</div>
                    {gm.bridgeObjects.map((item) => (
                      <ClickableItem key={item.id} label={item.label} color="#ffe6b4" onClick={() => onNodeFocus?.(item.id)} />
                    ))}
                  </div>
                )}

                {gm.isolatedNodes.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#8a7460', marginBottom: 2 }}>
                      Isolated ({gm.isolatedNodes.length})
                    </div>
                    {gm.isolatedNodes.slice(0, 5).map((id) => {
                      const node = nodes.find(n => n.id === id);
                      return node ? (
                        <ClickableItem key={id} label={node.data?.label || id} color="#6a5e52" onClick={() => onNodeFocus?.(id)} />
                      ) : null;
                    })}
                  </div>
                )}
              </>
            )}

            {/* Reasoning Coverage */}
            {hasMetrics && (gm.unchallengedClaims.length > 0 || gm.unsupportedClaims.length > 0 || gm.unresolvedTensions.length > 0) && (
              <>
                <div style={sectionHeader}>Reasoning Gaps</div>

                {gm.unchallengedClaims.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ fontSize: 10, color: warningColor, marginBottom: 2 }}>
                      Unchallenged claims ({gm.unchallengedClaims.length})
                    </div>
                    {gm.unchallengedClaims.slice(0, 4).map((item) => (
                      <ClickableItem key={item.id} label={item.label} color={warningColor} onClick={() => onGapClick?.(item, 'unchallenged')} />
                    ))}
                  </div>
                )}

                {gm.unsupportedClaims.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: '#c9a070', marginBottom: 2 }}>
                      Unsupported claims ({gm.unsupportedClaims.length})
                    </div>
                    {gm.unsupportedClaims.slice(0, 4).map((item) => (
                      <ClickableItem key={item.id} label={item.label} color="#c9a070" onClick={() => onGapClick?.(item, 'unsupported')} />
                    ))}
                  </div>
                )}

                {gm.unresolvedTensions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: warningColor, marginBottom: 2 }}>
                      Unresolved tensions ({gm.unresolvedTensions.length})
                    </div>
                    {gm.unresolvedTensions.slice(0, 4).map((item) => (
                      <ClickableItem key={item.id} label={item.label} color={warningColor} onClick={() => onGapClick?.(item, 'unresolved')} />
                    ))}
                  </div>
                )}
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
