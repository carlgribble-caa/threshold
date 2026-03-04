import { useState, useMemo } from 'react';

const TYPE_COLORS = {
  concept: '#d4a574',
  question: '#c49a6c',
  tension: '#b8856e',
  claim: '#c4a882',
  metaphor: '#a89070',
  relation: '#9a8060',
  goal: '#e8c49a',
  evidence: '#b0956a',
  assumption: '#8a7460',
  pattern: '#c0a080',
  principle: '#d0b890',
};

function formatObjectMarkdown(obj) {
  let md = `\n---\n**[${obj.type.toUpperCase()}] ${obj.label}**\n`;
  if (obj.summary) {
    md += `${obj.summary}\n`;
  }
  const validConns = (obj.connections || []).filter(c => c.otherType !== 'unknown');
  if (validConns.length > 0) {
    md += `\n*Connections:*\n`;
    for (const conn of validConns.slice(0, 5)) {
      const arrow = conn.direction === 'outgoing' ? '\u2192' : '\u2190';
      md += `- ${arrow} "${conn.otherLabel}"${conn.label ? ` \u2014 ${conn.label}` : ''}\n`;
    }
  }
  md += `---\n`;
  return md;
}

export default function ObjectPicker({ objects, onInsert, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return objects;
    const lower = search.toLowerCase();
    return objects.filter(o =>
      o.label.toLowerCase().includes(lower) ||
      o.type.toLowerCase().includes(lower) ||
      (o.summary || '').toLowerCase().includes(lower)
    );
  }, [objects, search]);

  return (
    <div style={{
      position: 'absolute',
      top: 44,
      left: 0,
      right: 0,
      maxHeight: 320,
      background: '#151210',
      border: '1px solid rgba(232, 196, 154, 0.15)',
      borderRadius: 8,
      zIndex: 1100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(232, 196, 154, 0.08)' }}>
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search objects..."
          style={{
            width: '100%',
            background: 'rgba(232, 196, 154, 0.05)',
            border: '1px solid rgba(232, 196, 154, 0.1)',
            borderRadius: 5,
            padding: '6px 10px',
            color: '#c4a882',
            fontSize: 12,
            outline: 'none',
          }}
        />
      </div>

      {/* Object list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '12px 14px', color: '#6b5a4a', fontSize: 11, textAlign: 'center' }}>
            No objects found
          </div>
        )}
        {filtered.map(obj => (
          <button
            key={obj.id}
            onClick={() => {
              onInsert(formatObjectMarkdown(obj));
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              width: '100%',
              padding: '8px 14px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(232, 196, 154, 0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Type badge */}
            <span style={{
              fontSize: 8,
              color: TYPE_COLORS[obj.type] || '#8a7460',
              background: 'rgba(232, 196, 154, 0.08)',
              padding: '2px 6px',
              borderRadius: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              flexShrink: 0,
              marginTop: 2,
            }}>
              {obj.type}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#e8c49a',
                fontSize: 12,
                fontWeight: 500,
                marginBottom: 2,
              }}>
                {obj.label}
              </div>
              {obj.summary && (
                <div style={{
                  color: '#6b5a4a',
                  fontSize: 10,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {obj.summary}
                </div>
              )}
              {obj.connections && obj.connections.length > 0 && (
                <div style={{ color: '#4d4030', fontSize: 9, marginTop: 2 }}>
                  {obj.connections.length} connection{obj.connections.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Close hint */}
      <div style={{
        padding: '6px 14px',
        borderTop: '1px solid rgba(232, 196, 154, 0.06)',
        textAlign: 'right',
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4d4030',
            fontSize: 10,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
