import { useEffect } from 'react';

export default function SuggestionPopup({ suggestion, onClose, onResuggest, onApply, loading }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 360,
        background: 'rgba(35, 30, 24, 0.95)',
        border: '1px solid rgba(232, 196, 154, 0.15)',
        borderRadius: 10,
        padding: 16,
        zIndex: 1000,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 10,
      }}>
        <span style={{
          color: '#8a7460', fontSize: 11,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          Suggestion
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none',
            color: '#8a7460', cursor: 'pointer', fontSize: 14,
            padding: 4, lineHeight: 1,
          }}
        >
          x
        </button>
      </div>

      {/* Content */}
      {loading && !suggestion ? (
        <div style={{
          color: '#8a7460', fontSize: 12,
          fontStyle: 'italic', padding: '8px 0',
        }}>
          thinking...
        </div>
      ) : (
        <>
          <div style={{
            color: '#e8c49a', fontSize: 13,
            lineHeight: 1.6, marginBottom: 12,
          }}>
            {suggestion?.text}
          </div>

          {suggestion?.targetLabel && (
            <div style={{
              fontSize: 11, color: '#8a7460',
              marginBottom: 8,
            }}>
              Re: {suggestion.targetLabel}
            </div>
          )}
        </>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        {suggestion && onApply && (
          <button
            onClick={() => onApply(suggestion)}
            disabled={loading}
            style={{
              background: 'rgba(232, 196, 154, 0.15)',
              border: '1px solid rgba(232, 196, 154, 0.25)',
              borderRadius: 6,
              color: loading ? '#5a4e42' : '#e8c49a',
              padding: '6px 14px',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          >
            Apply
          </button>
        )}
        <button
          onClick={onResuggest}
          disabled={loading}
          style={{
            background: 'rgba(232, 196, 154, 0.08)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 6,
            color: loading ? '#5a4e42' : '#e8c49a',
            padding: '6px 14px',
            cursor: loading ? 'wait' : 'pointer',
            fontSize: 12,
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'thinking...' : 'Re-suggest'}
        </button>
      </div>
    </div>
  );
}
