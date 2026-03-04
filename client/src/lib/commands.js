// Command dispatcher — named actions from the spec
// Commands: dialogue.send, object.crystallize, object.dismiss, etc.

const API_BASE = '/api';

export async function sendDialogue(text, sessionId) {
  const res = await fetch(`${API_BASE}/dialogue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sessionId }),
  });
  return res.json();
}

export async function crystallizeObject(id, position) {
  const res = await fetch(`${API_BASE}/objects/${id}/crystallize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ position }),
  });
  return res.json();
}

export async function dismissObject(id) {
  const res = await fetch(`${API_BASE}/objects/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function updateObject(id, updates) {
  const res = await fetch(`${API_BASE}/objects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function confirmConnection(fromId, toId, label) {
  const res = await fetch(`${API_BASE}/graph/edges/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId, label }),
  });
  return res.json();
}

export async function rejectConnection(fromId, toId) {
  const res = await fetch(`${API_BASE}/graph/edges/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId, toId }),
  });
  return res.json();
}
