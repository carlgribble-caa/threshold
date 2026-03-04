import { useState } from 'react';

// Icon mapping by document key pattern
function getDocIcon(key) {
  if (key === 'plan-of-plan') return '\u{1F5FA}\uFE0F';
  if (key.startsWith('rationale:')) return '\u{1F4A1}';
  if (key === 'plan') return '\u{1F4CB}';
  if (key === 'generation-plan') return '\u{2699}\uFE0F';
  if (key === 'final') return '\u{1F4D6}';
  return '\u{1F4C4}';
}

// Status styling
function getStatusStyle(status) {
  switch (status) {
    case 'locked':
      return { opacity: 0.25, filter: 'grayscale(1)', cursor: 'default', borderColor: 'rgba(232, 196, 154, 0.04)' };
    case 'empty':
      return { opacity: 0.5, filter: 'grayscale(0.8)', cursor: 'pointer', borderColor: 'rgba(232, 196, 154, 0.08)' };
    case 'draft':
      return { opacity: 0.7, filter: 'none', cursor: 'pointer', borderColor: 'rgba(232, 196, 154, 0.15)' };
    case 'generating':
      return { opacity: 1, filter: 'none', cursor: 'wait', borderColor: 'rgba(232, 196, 154, 0.2)' };
    case 'ready':
      return { opacity: 1, filter: 'none', cursor: 'pointer', borderColor: 'rgba(232, 196, 154, 0.3)' };
    case 'approved':
      return { opacity: 1, filter: 'none', cursor: 'pointer', borderColor: 'rgba(120, 180, 120, 0.4)' };
    default:
      return { opacity: 0.5, filter: 'grayscale(1)', cursor: 'default', borderColor: 'rgba(232, 196, 154, 0.08)' };
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'locked': return 'locked';
    case 'empty': return 'empty';
    case 'draft': return 'draft';
    case 'generating': return 'generating...';
    case 'ready': return 'ready';
    case 'approved': return '\u2713 approved';
    default: return status;
  }
}

function getStatusColor(status) {
  switch (status) {
    case 'locked': return '#2a2219';
    case 'empty': return '#3d3229';
    case 'draft': return '#6b5a4a';
    case 'generating': return '#d4a574';
    case 'ready': return '#e8c49a';
    case 'approved': return '#7ab87a';
    default: return '#3d3229';
  }
}

export default function DocumentTray({ open, pipeline, onGenerate, onOpenDoc, onReset }) {
  const [hoveredDoc, setHoveredDoc] = useState(null);

  if (!open) return null;

  const docs = pipeline?.documents || {};
  const entries = Object.entries(docs);

  // Group: plan-of-plan, then rationale docs, then plan, gen-plan, final
  const planOfPlan = entries.filter(([k]) => k === 'plan-of-plan');
  const rationale = entries.filter(([k]) => k.startsWith('rationale:'));
  const downstream = entries.filter(([k]) => ['plan', 'generation-plan', 'final'].includes(k));

  const groups = [];
  if (planOfPlan.length) groups.push(planOfPlan);
  if (rationale.length) groups.push(rationale);
  if (downstream.length) groups.push(downstream);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 950,
      transition: 'transform 0.3s ease',
      transform: open ? 'translateY(0)' : 'translateY(100%)',
    }}>
      <div style={{
        background: 'rgba(25, 22, 18, 0.92)',
        border: '1px solid rgba(232, 196, 154, 0.12)',
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
        backdropFilter: 'blur(16px)',
        padding: '16px 24px 20px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}>
          <span style={{
            color: '#8a7460',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>Documents</span>
          {pipeline?.stage !== 'idle' && (
            <button
              onClick={onReset}
              style={{
                background: 'transparent',
                border: '1px solid rgba(232, 196, 154, 0.15)',
                color: '#6b5a4a',
                fontSize: 10,
                padding: '3px 10px',
                borderRadius: 5,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              Reset Pipeline
            </button>
          )}
        </div>

        {/* Document Icons — grouped */}
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
        }}>
          {groups.map((group, gi) => (
            <div key={gi} style={{
              display: 'flex',
              gap: 8,
              ...(gi > 0 ? { marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid rgba(232, 196, 154, 0.08)' } : {}),
            }}>
              {group.map(([key, doc]) => {
                const status = doc.status || 'empty';
                const style = getStatusStyle(status);
                const isHovered = hoveredDoc === key;
                const isClickable = status !== 'locked' && status !== 'generating';
                const label = doc.label || key.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                const icon = getDocIcon(key);

                return (
                  <button
                    key={key}
                    onClick={() => {
                      if (!isClickable) return;
                      if (status === 'empty' && !key.startsWith('rationale:')) {
                        // Non-rationale empty docs: auto-generate
                        onGenerate(key);
                      } else {
                        // Rationale docs + all non-empty: open in editor
                        onOpenDoc(key);
                      }
                    }}
                    onMouseEnter={() => setHoveredDoc(key)}
                    onMouseLeave={() => setHoveredDoc(null)}
                    disabled={status === 'generating'}
                    title={doc.description || label}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 5,
                      background: isHovered && isClickable
                        ? 'rgba(232, 196, 154, 0.08)'
                        : 'transparent',
                      border: '1px solid',
                      borderColor: style.borderColor,
                      borderRadius: 10,
                      padding: '10px 12px 8px',
                      cursor: style.cursor,
                      minWidth: 72,
                      maxWidth: 88,
                      transition: 'all 0.2s ease',
                      animation: status === 'generating' ? 'docPulse 1.5s ease-in-out infinite' : 'none',
                      opacity: style.opacity,
                    }}
                  >
                    <span style={{
                      fontSize: 24,
                      filter: style.filter,
                      lineHeight: 1,
                    }}>
                      {status === 'approved' ? '\u2705' : icon}
                    </span>
                    <span style={{
                      fontSize: 9,
                      color: status === 'ready' || status === 'approved' ? '#e8c49a' : '#6b5a4a',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      textAlign: 'center',
                    }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: 7,
                      color: getStatusColor(status),
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      {getStatusLabel(status)}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes docPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
