const OWNER_SESSION_KEY = 'careercompass:owner:session:v1';
const OWNER_LOCK_KEY = 'careercompass:owner:lock:v1';
const OWNER_SECRET_STORAGE_KEY = 'careercompass:owner:secret:v1';
const OWNER_SESSION_HOURS = 8;
const LOCK_WINDOW_MS = 10 * 60 * 1000;
const LOCK_AFTER_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function getOwnerCredentials() {
  return {
    email: String(import.meta.env.VITE_OWNER_EMAIL || 'owner@careercompass.local').trim().toLowerCase(),
    password: String(import.meta.env.VITE_OWNER_PASSWORD || 'change-this-owner-password').trim(),
  };
}

function readLockState() {
  return safeParse(localStorage.getItem(OWNER_LOCK_KEY), {
    count: 0,
    firstAttemptAt: 0,
    lockedUntil: 0,
  });
}

function writeLockState(next) {
  localStorage.setItem(OWNER_LOCK_KEY, JSON.stringify(next));
}

export function getOwnerSecurityState() {
  const lock = readLockState();
  const now = Date.now();
  const isLocked = Number(lock.lockedUntil) > now;
  return {
    isLocked,
    lockUntil: isLocked ? new Date(lock.lockedUntil).toISOString() : null,
    failedAttempts: Number(lock.count) || 0,
  };
}

function registerFailedAttempt() {
  const now = Date.now();
  const lock = readLockState();
  const inWindow = now - Number(lock.firstAttemptAt || 0) <= LOCK_WINDOW_MS;
  const count = inWindow ? Number(lock.count || 0) + 1 : 1;
  const firstAttemptAt = inWindow ? Number(lock.firstAttemptAt || now) : now;
  const lockedUntil = count >= LOCK_AFTER_ATTEMPTS ? now + LOCK_DURATION_MS : 0;
  writeLockState({ count, firstAttemptAt, lockedUntil });
}

function clearFailedAttempts() {
  writeLockState({ count: 0, firstAttemptAt: 0, lockedUntil: 0 });
}

export function loadOwnerSession() {
  const session = safeParse(localStorage.getItem(OWNER_SESSION_KEY), null);
  if (!session || typeof session !== 'object') return null;
  const now = Date.now();
  const expiresAt = Number(session.expiresAt || 0);
  if (expiresAt <= now) {
    localStorage.removeItem(OWNER_SESSION_KEY);
    return null;
  }
  return session;
}

export function isOwnerAuthenticated() {
  return Boolean(loadOwnerSession());
}

export function getOwnerEmail() {
  return getOwnerCredentials().email;
}

export function loadOwnerSecretKey() {
  if (typeof window === 'undefined') return String(import.meta.env.VITE_OWNER_SECRET_KEY || '').trim();
  const stored = localStorage.getItem(OWNER_SECRET_STORAGE_KEY);
  if (stored) return stored;
  return String(import.meta.env.VITE_OWNER_SECRET_KEY || '').trim();
}

export function setOwnerSecretKey(next) {
  if (typeof window === 'undefined') return;
  if (!next) {
    localStorage.removeItem(OWNER_SECRET_STORAGE_KEY);
  } else {
    localStorage.setItem(OWNER_SECRET_STORAGE_KEY, next);
  }
}

export function ownerLogin({ email, password, secretKey, useSecretKey = false }) {
  const lock = getOwnerSecurityState();
  if (lock.isLocked) {
    const lockTime = new Date(lock.lockUntil).toLocaleTimeString();
    throw new Error(`Too many failed attempts. Try again after ${lockTime}.`);
  }

  const creds = getOwnerCredentials();
  if (useSecretKey) {
    const storedKey = loadOwnerSecretKey();
    const providedKey = String(secretKey || '').trim();
    if (!storedKey || providedKey !== storedKey) {
      registerFailedAttempt();
      throw new Error('Invalid owner secret key.');
    }
  } else {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');
    if (normalizedEmail !== creds.email || rawPassword !== creds.password) {
      registerFailedAttempt();
      throw new Error('Invalid owner credentials.');
    }
  }

  const now = Date.now();
  const session = {
    email: useSecretKey ? creds.email : String(email || creds.email),
    role: 'owner',
    issuedAt: now,
    expiresAt: now + OWNER_SESSION_HOURS * 60 * 60 * 1000,
  };
  localStorage.setItem(OWNER_SESSION_KEY, JSON.stringify(session));
  clearFailedAttempts();
  return session;
}

export function ownerLogout() {
  localStorage.removeItem(OWNER_SESSION_KEY);
}
