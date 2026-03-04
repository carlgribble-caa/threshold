export default function Toolbar({ onDialogue, onAddObject, onConnect, onSidebar, connectMode, dialogueActive }) {
  const buttons = [
    { key: 'dialogue', icon: '\u25C7', label: 'Dialogue', active: dialogueActive, onClick: onDialogue, title: 'Open dialogue with Claude' },
    { key: 'add', icon: '+', label: 'Add Object', onClick: onAddObject, title: 'Create a new object' },
    { key: 'connect', icon: '\u2014', label: 'Connect', active: connectMode, onClick: onConnect, title: 'Draw connection between objects' },
    { key: 'sidebar', icon: '\u2630', label: 'Menu', onClick: onSidebar, title: 'Toggle sidebar' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        background: 'rgba(25, 22, 18, 0.85)',
        border: '1px solid rgba(232, 196, 154, 0.12)',
        borderRadius: 10,
        padding: '4px 6px',
        zIndex: 900,
        backdropFilter: 'blur(16px)',
      }}
    >
      {buttons.map((btn) => (
        <button
          key={btn.key}
          onClick={btn.onClick}
          title={btn.title}
          style={{
            background: btn.active ? 'rgba(232, 196, 154, 0.15)' : 'transparent',
            border: 'none',
            color: btn.active ? '#e8c49a' : '#8a7460',
            cursor: 'pointer',
            padding: '6px 14px',
            borderRadius: 7,
            fontSize: 12,
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: 14 }}>{btn.icon}</span>
          {btn.label}
        </button>
      ))}
    </div>
  );
}
