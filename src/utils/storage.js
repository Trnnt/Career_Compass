const APP_KEY_PREFIX = 'careercompass:v1:';

function keyFor(userId) {
  const id = String(userId || 'anon').trim().toLowerCase();
  return `${APP_KEY_PREFIX}${id}`;
}

export function loadAppState(userId) {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAppState(userId, state) {
  try {
    localStorage.setItem(keyFor(userId), JSON.stringify(state));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function clearAppState(userId) {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    // ignore
  }
}

