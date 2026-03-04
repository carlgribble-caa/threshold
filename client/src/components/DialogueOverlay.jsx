import { useState, useRef, useEffect, useCallback } from 'react';

const PAUSE_DELAY = 3500; // 3.5 seconds pause detection

export default function DialogueOverlay() {
  const [userText, setUserText] = useState('');
  const [claudeResponse, setClaudeResponse] = useState('');
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const pauseTimer = useRef(null);
  const fadeTimer = useRef(null);
  const inputRef = useRef(null);

  // Show overlay and capture keystrokes globally
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore modifier-only keys, Escape, Tab, etc.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['Escape', 'Tab', 'CapsLock', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;

      if (!visible) {
        setVisible(true);
      }

      // Clear fade timer on any typing
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
        fadeTimer.current = null;
      }

      // Reset pause timer
      if (pauseTimer.current) {
        clearTimeout(pauseTimer.current);
      }

      pauseTimer.current = setTimeout(() => {
        handlePause();
      }, PAUSE_DELAY);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, userText]);

  const handlePause = useCallback(async () => {
    if (!userText.trim()) return;
    setSending(true);

    try {
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
      });
      const data = await res.json();
      setClaudeResponse(data.response || '');

      // Start fade timer after response
      fadeTimer.current = setTimeout(() => {
        setVisible(false);
        setUserText('');
        setClaudeResponse('');
      }, 10000);
    } catch (err) {
      setClaudeResponse('(connection error)');
    } finally {
      setSending(false);
    }
  }, [userText]);

  const handleInput = (e) => {
    setUserText(e.target.value);

    // If Claude is streaming, interrupt
    if (sending) {
      // TODO: implement interrupt via AbortController
    }
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '520px',
        maxHeight: '400px',
        background: 'rgba(20, 18, 15, 0.85)',
        border: '1px solid rgba(212, 165, 116, 0.15)',
        borderRadius: '16px',
        padding: '24px',
        zIndex: 1000,
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <textarea
        ref={inputRef}
        autoFocus
        value={userText}
        onChange={handleInput}
        placeholder="start thinking..."
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: '#d4a574',
          fontSize: '15px',
          fontFamily: 'inherit',
          letterSpacing: '0.02em',
          resize: 'none',
          minHeight: '60px',
          width: '100%',
        }}
      />
      {claudeResponse && (
        <div
          style={{
            borderTop: '1px solid rgba(212, 165, 116, 0.1)',
            paddingTop: '12px',
            color: '#a67c52',
            fontSize: '14px',
            lineHeight: '1.6',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {claudeResponse}
        </div>
      )}
      {sending && (
        <div style={{ color: '#6b5a45', fontSize: '12px' }}>...</div>
      )}
    </div>
  );
}
