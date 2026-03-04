import { useState, useRef, useCallback, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ObjectPicker from './ObjectPicker.jsx';

export default function MarkdownEditor({
  docName,
  content,
  onSave,
  onClose,
  onApprove,
  onGenerate,
  objects,
  showApprove,
  showInsertObject,
  showGenerate,
  isGenerating,
}) {
  const [value, setValue] = useState(content || '');
  const [width, setWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    setValue(content || '');
  }, [content, docName]);

  const handleChange = useCallback((newValue) => {
    setValue(newValue || '');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      onSave(docName, newValue || '');
    }, 1000);
  }, [docName, onSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleInsertObject = useCallback((markdown) => {
    const newValue = (value || '') + '\n' + markdown;
    setValue(newValue);
    onSave(docName, newValue);
  }, [value, docName, onSave]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (e) => {
      const vw = window.innerWidth;
      const pct = ((vw - e.clientX) / vw) * 100;
      setWidth(Math.min(70, Math.max(30, pct)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  const displayName = docName
    ?.replace(/^rationale:/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Document';

  const isRationale = docName?.startsWith('rationale:');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: `${width}vw`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0b09',
        borderLeft: '1px solid rgba(232, 196, 154, 0.12)',
      }}
      data-color-mode="dark"
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          top: 0,
          left: -3,
          bottom: 0,
          width: 6,
          cursor: 'col-resize',
          zIndex: 1001,
          background: isDragging ? 'rgba(232, 196, 154, 0.3)' : 'transparent',
        }}
      />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(232, 196, 154, 0.1)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <span style={{
          color: '#e8c49a',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          {isRationale ? `Rationale: ${displayName}` : displayName}
        </span>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {showInsertObject && (
            <button
              onClick={() => setPickerOpen(!pickerOpen)}
              style={{
                background: pickerOpen ? 'rgba(232, 196, 154, 0.15)' : 'rgba(232, 196, 154, 0.06)',
                border: '1px solid rgba(232, 196, 154, 0.15)',
                color: '#c4a882',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 5,
                cursor: 'pointer',
              }}
            >
              + Object
            </button>
          )}
          {showGenerate && (
            <button
              onClick={() => onGenerate(docName)}
              disabled={isGenerating}
              style={{
                background: 'rgba(212, 165, 116, 0.1)',
                border: '1px solid rgba(212, 165, 116, 0.25)',
                color: isGenerating ? '#6b5a4a' : '#d4a574',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 5,
                cursor: isGenerating ? 'wait' : 'pointer',
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          )}
          {showApprove && (
            <button
              onClick={() => onApprove(docName)}
              style={{
                background: 'rgba(120, 180, 120, 0.1)',
                border: '1px solid rgba(120, 180, 120, 0.3)',
                color: '#7ab87a',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 5,
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Approve
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b5a4a',
              fontSize: 18,
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Object Picker dropdown */}
        {pickerOpen && objects && (
          <ObjectPicker
            objects={objects}
            onInsert={handleInsertObject}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <MDEditor
          value={value}
          onChange={handleChange}
          height="100%"
          visibleDragbar={false}
          preview="preview"
          hideToolbar={false}
          style={{
            background: '#0d0b09',
            height: '100%',
          }}
        />
      </div>

      <style>{`
        .w-md-editor {
          --color-canvas-default: #0d0b09 !important;
          --color-border-default: rgba(232, 196, 154, 0.1) !important;
          --color-fg-default: #c4a882 !important;
          background-color: #0d0b09 !important;
          border: none !important;
          box-shadow: none !important;
        }
        .w-md-editor-toolbar {
          background-color: #111 !important;
          border-bottom: 1px solid rgba(232, 196, 154, 0.08) !important;
        }
        .w-md-editor-toolbar li > button {
          color: #8a7460 !important;
        }
        .w-md-editor-toolbar li > button:hover {
          color: #e8c49a !important;
        }
        .w-md-editor-text-pre,
        .w-md-editor-text-input,
        .w-md-editor-text {
          color: #c4a882 !important;
        }
        .wmde-markdown {
          background-color: #0d0b09 !important;
          color: #c4a882 !important;
          font-size: 12px !important;
        }
        .wmde-markdown h1 {
          color: #e8c49a !important;
          border-bottom-color: rgba(232, 196, 154, 0.1) !important;
          font-size: 24px !important;
        }
        .wmde-markdown h2 {
          color: #e8c49a !important;
          border-bottom-color: rgba(232, 196, 154, 0.1) !important;
          font-size: 18px !important;
        }
        .wmde-markdown h3 {
          color: #e8c49a !important;
          border-bottom-color: rgba(232, 196, 154, 0.1) !important;
          font-size: 15px !important;
        }
        .w-md-editor-preview {
          background-color: #0d0b09 !important;
          border-left: 1px solid rgba(232, 196, 154, 0.08) !important;
        }
        .w-md-editor-bar {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
