// useOrbit — manages emerging objects orbiting around dialogue overlay
// Phase 1 stub: will use framer-motion for animation

import { useState, useCallback } from 'react';

export function useOrbit() {
  const [orbitingObjects, setOrbitingObjects] = useState([]);

  const addToOrbit = useCallback((object) => {
    setOrbitingObjects((prev) => [...prev, object]);
  }, []);

  const removeFromOrbit = useCallback((id) => {
    setOrbitingObjects((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return {
    orbitingObjects,
    addToOrbit,
    removeFromOrbit,
  };
}
