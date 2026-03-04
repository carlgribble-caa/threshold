// In-memory model configuration. Defaults to env var or Sonnet.

const AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Sonnet' },
  { id: 'claude-opus-4-20250514', label: 'Opus' },
  { id: 'claude-haiku-4-5-20251001', label: 'Haiku' },
];

let currentModel = process.env.THRESHOLD_MODEL || 'claude-sonnet-4-20250514';

export function getModel() {
  return currentModel;
}

export function setModel(modelId) {
  const valid = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!valid) throw new Error(`Unknown model: ${modelId}`);
  currentModel = modelId;
  return currentModel;
}

export function getAvailableModels() {
  return AVAILABLE_MODELS;
}
