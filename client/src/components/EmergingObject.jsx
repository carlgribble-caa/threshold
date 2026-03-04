import { useRef, useState, useEffect } from 'react';

const typeColors = {
  concept: '#e8c49a',
  question: '#dbb880',
  tension: '#e8a08a',
  claim: '#d4b888',
  metaphor: '#e8cca8',
  relation: '#b5b0e8',
  goal: '#e8d888',
  evidence: '#8cc0ae',
  assumption: '#b8a080',
  pattern: '#c5b0d9',
  principle: '#d9c088',
};

export default function EmergingObject({ object, index, total, onCrystallize, onDismiss }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0, origX: 0, origY: 0 });

  const color = typeColors[object.type] || '#e8c49a';

  // Calculate orbit position around screen center
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const radiusX = 320;
  const radiusY = 260;
  const orbitX = Math.cos(angle) * radiusX;
  const orbitY = Math.sin(angle) * radiusY;

  // Set initial orbit position
  useEffect(() => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    setPos({ x: cx + orbitX - 90, y: cy + orbitY - 20 });
  }, [orbitX, orbitY]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, origX: pos.x, origY: pos.y };

    const handleMouseMove = (e) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPos({
        x: dragStart.current.origX + dx,
        y: dragStart.current.origY + dy,
      });
    };

    const handleMouseUp = (e) => {
      setDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      // If dragged far enough from centre, crystallize
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dropX = dragStart.current.origX + (e.clientX - dragStart.current.x);
      const dropY = dragStart.current.origY + (e.clientY - dragStart.current.y);
      const dist = Math.sqrt((dropX + 90 - cx) ** 2 + (dropY + 20 - cy) ** 2);

      if (dist > 200) {
        onCrystallize?.(object, dropX + 90, dropY + 20);
      } else {
        // Snap back to orbit
        setPos({ x: cx + orbitX - 90, y: cy + orbitY - 20 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 999,
        padding: '8px 14px',
        background: 'rgba(35, 30, 24, 0.7)',
        border: `1px dashed ${color}50`,
        borderRadius: 10,
        color,
        fontSize: 12,
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: dragging ? 1 : 0.8,
        transition: dragging ? 'none' : 'left 0.3s ease, top 0.3s ease, opacity 0.3s',
        userSelect: 'none',
        maxWidth: 180,
        backdropFilter: 'blur(8px)',
        boxShadow: dragging ? `0 0 20px ${color}30` : 'none',
      }}
    >
      <div style={{ fontWeight: 500, marginBottom: 2 }}>{object.label}</div>
      <div style={{
        fontSize: 9,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: `${color}80`,
      }}>
        {object.type}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss?.(object.id);
        }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent drag when clicking dismiss
        }}
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          background: 'none',
          border: 'none',
          color: `${color}60`,
          cursor: 'pointer',
          fontSize: 10,
          padding: '14px',
          lineHeight: 1,
          borderRadius: '50%',
        }}
      >
        x
      </button>
    </div>
  );
}
