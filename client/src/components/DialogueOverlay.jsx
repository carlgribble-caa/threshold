import { useState, useRef, useEffect, useCallback } from 'react';

const PAUSE_DELAY = 3500; // 3.5 seconds pause detection

export default function DialogueOverlay({ onActiveChange, onObjectsEmerged, onConnectionsProposed }) {
  const [userText, setUserText] = useState('');
  const [claudeResponse, setClaudeResponse] = useState('');
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const pauseTimer = useRef(null);
  const fadeTimer = useRef(null);
  const textareaRef = useRef(null);

  // Notify parent of visibility changes
  useEffect(() => {
    onActiveChange?.(visible);
  }, [visible, onActiveChange]);

  // Focus textarea when it becomes visible
  useEffect(() => {
    if (visible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [visible]);

  // Global keydown listener — show overlay when user starts typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore modifier-only keys, Escape, Tab, function keys
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['Escape', 'Tab', 'CapsLock', 'Shift', 'Control', 'Alt', 'Meta',
           'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
           'ArrowUp','ArrowDown','ArrowLeft','ArrowRight'
          ].includes(e.key)) {
        if (e.key === 'Escape' && visible) {
          setVisible(false);
          setUserText('');
          setClaudeResponse('');
          setError(null);
        }
        return;
      }

      if (!visible) {
        setVisible(true);
      }

      // Clear fade timer on any typing
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
        fadeTimer.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  // Handle text changes — reset pause timer
  const handleInput = (e) => {
    const newText = e.target.value;
    setUserText(newText);
    setError(null);

    // Reset pause timer
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
    }

    if (newText.trim()) {
      pauseTimer.current = setTimeout(() => {
        handlePause(newText);
      }, PAUSE_DELAY);
    }
  };

  const handlePause = useCallback(async (text) => {
    const toSend = text || userText;
    if (!toSend.trim()) return;
    setSending(true);
    setError(null);

    try {
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: toSend }),
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      const data = await res.json();
      setClaudeResponse(data.response || '');

      // Emit extracted objects to parent
      if (data.objects && data.objects.length > 0) {
        onObjectsEmerged?.(data.objects);
      }

      // Emit proposed connections to parent
      if (data.connections && data.connections.length > 0) {
        onConnectionsProposed?.(data.connections, data.objects || []);
      }

      // Start fade timer after response
      fadeTimer.current = setTimeout(() => {
        setVisible(false);
        setUserText('');
        setClaudeResponse('');
      }, 15000);
    } catch (err) {
      setError('Backend not running — start the server to connect to Claude');
      setClaudeResponse('');
    } finally {
      setSending(false);
    }
  }, [userText]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        maxHeight: '420px',
        background: 'rgba(35, 30, 24, 0.90)',
        border: '1px solid rgba(232, 196, 154, 0.15)',
        borderRadius: '16px',
        padding: '28px',
        zIndex: 1000,
        backdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      <textarea
        ref={textareaRef}
        value={userText}
        onChange={handleInput}
        placeholder="start thinking..."
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#e8c49a',
          fontSize: '15px',
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          lineHeight: '1.6',
          resize: 'none',
          minHeight: '80px',
          width: '100%',
        }}
      />

      {sending && (
        <div style={{
          color: '#8a7460',
          fontSize: 12,
          letterSpacing: '0.05em',
        }}>
          thinking...
        </div>
      )}

      {claudeResponse && (
        <div
          style={{
            borderTop: '1px solid rgba(212, 165, 116, 0.08)',
            paddingTop: '14px',
            color: '#c9a070',
            fontSize: '14px',
            lineHeight: '1.7',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {claudeResponse}
        </div>
      )}

      {error && (
        <div style={{
          borderTop: '1px solid rgba(212, 165, 116, 0.08)',
          paddingTop: '14px',
          color: '#8a7460',
          fontSize: '12px',
          lineHeight: '1.6',
          fontStyle: 'italic',
        }}>
          {error}
        </div>
      )}

      <div style={{
        color: '#5a4e42',
        fontSize: 10,
        letterSpacing: '0.04em',
        textAlign: 'right',
      }}>
        pause to send · esc to close
      </div>
    </div>
  );
}
