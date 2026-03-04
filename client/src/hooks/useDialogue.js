import { useState, useRef, useCallback } from 'react';

const PAUSE_DELAY = 3500;

export function useDialogue() {
  const [userText, setUserText] = useState('');
  const [claudeResponse, setClaudeResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [emergingObjects, setEmergingObjects] = useState([]);
  const pauseTimer = useRef(null);
  const abortController = useRef(null);

  const resetPauseTimer = useCallback(() => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => {
      sendDialogue();
    }, PAUSE_DELAY);
  }, []);

  const sendDialogue = useCallback(async () => {
    if (!userText.trim()) return;

    // Abort any ongoing stream
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    setIsStreaming(true);

    try {
      const res = await fetch('/api/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userText }),
        signal: abortController.current.signal,
      });
      const data = await res.json();
      setClaudeResponse(data.response || '');

      if (data.objects && data.objects.length > 0) {
        setEmergingObjects((prev) => [...prev, ...data.objects]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Dialogue error:', err);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [userText]);

  const interrupt = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setIsStreaming(false);
  }, []);

  const crystallizeObject = useCallback((id, position) => {
    setEmergingObjects((prev) => prev.filter((o) => o.id !== id));
    // Return the object for the graph to pick up
    return emergingObjects.find((o) => o.id === id);
  }, [emergingObjects]);

  const dismissObject = useCallback((id) => {
    setEmergingObjects((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return {
    userText,
    setUserText,
    claudeResponse,
    isStreaming,
    emergingObjects,
    resetPauseTimer,
    interrupt,
    crystallizeObject,
    dismissObject,
  };
}
