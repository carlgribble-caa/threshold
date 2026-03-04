import { useState, useRef, useEffect } from 'react';

const OUTPUT_FORMATS = [
  { value: 'report', label: 'Report' },
  { value: 'essay', label: 'Essay' },
  { value: 'software-spec', label: 'Software Spec' },
  { value: 'fiction-book', label: 'Fiction Book' },
  { value: 'movie-script', label: 'Movie Script' },
  { value: 'research-paper', label: 'Research Paper' },
  { value: 'business-plan', label: 'Business Plan' },
  { value: 'presentation', label: 'Presentation' },
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'other', label: 'Other' },
];

const inputStyle = {
  background: 'rgba(10, 10, 10, 0.6)',
  border: '1px solid rgba(232, 196, 154, 0.15)',
  borderRadius: 6,
  padding: '8px 12px',
  color: '#e8c49a',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
};

export default function GoalDialog({ goal, onClose, onSave, onClear }) {
  const [text, setText] = useState(goal?.text || '');
  const [outputFormat, setOutputFormat] = useState(goal?.outputFormat || 'other');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ text: text.trim(), outputFormat });
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const isEditing = !!goal;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 340,
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
        <div style={{
          color: '#8a7460', fontSize: 11,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {isEditing ? 'Edit Goal' : 'Set Goal'}
        </div>

        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are you working toward?"
          rows={3}
          style={{
            ...inputStyle,
            fontSize: 13,
            resize: 'vertical',
            lineHeight: 1.5,
          }}
        />

        <div>
          <div style={{
            color: '#8a7460', fontSize: 10,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Target Output
          </div>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            style={{ ...inputStyle, width: '100%' }}
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          {isEditing && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: '1px solid rgba(232, 140, 100, 0.25)',
                borderRadius: 6,
                color: '#e8a08a',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
                marginRight: 'auto',
              }}
            >
              Clear
            </button>
          )}
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
            {isEditing ? 'Update' : 'Set Goal'}
          </button>
        </div>
      </form>
    </div>
  );
}
