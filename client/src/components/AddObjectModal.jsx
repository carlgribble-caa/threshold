import { useState, useRef, useEffect } from 'react';

const OBJECT_TYPES = [
  'concept', 'question', 'tension', 'claim', 'metaphor',
  'relation', 'evidence', 'assumption', 'pattern', 'principle',
];

export default function AddObjectModal({ onClose, onCreate }) {
  const [label, setLabel] = useState('');
  const [summary, setSummary] = useState('');
  const [type, setType] = useState('concept');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    onCreate({ label: label.trim(), summary: summary.trim(), type });
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        background: 'rgba(35, 30, 24, 0.95)',
        border: '1px solid rgba(232, 196, 154, 0.15)',
        borderRadius: 12,
        padding: 20,
        zIndex: 1000,
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ color: '#8a7460', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          New Object
        </div>

        <input
          ref={inputRef}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Object label..."
          style={{
            background: 'rgba(10, 10, 10, 0.6)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 6,
            padding: '8px 12px',
            color: '#e8c49a',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Description (optional)..."
          rows={3}
          style={{
            background: 'rgba(10, 10, 10, 0.6)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 6,
            padding: '8px 12px',
            color: '#e8c49a',
            fontSize: 12,
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            background: 'rgba(10, 10, 10, 0.6)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 6,
            padding: '8px 12px',
            color: '#e8c49a',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        >
          {OBJECT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(232, 196, 154, 0.15)',
              borderRadius: 6,
              color: '#8a7460',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: 'rgba(232, 196, 154, 0.12)',
              border: '1px solid rgba(232, 196, 154, 0.25)',
              borderRadius: 6,
              color: '#e8c49a',
              padding: '6px 14px',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'inherit',
            }}
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
