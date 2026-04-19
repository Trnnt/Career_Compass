const AUTH_KEY = 'careercompass:auth:v1';
const USERS_KEY = 'careercompass:users:v1';
export const STUDENT_ROLE = 'student';

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function loadUsers() {
  const parsed = safeParse(localStorage.getItem(USERS_KEY));
  if (!parsed || typeof parsed !== 'object') return {};
  return parsed;
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadSession() {
  const parsed = safeParse(localStorage.getItem(AUTH_KEY));
  if (!parsed || typeof parsed !== 'object') return null;
  return parsed;
}

export function saveSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

export function registerUser({ name, email, password }) {
  const users = loadUsers();
  const key = String(email).trim().toLowerCase();
  if (!key) throw new Error('Email is required.');
  if (users[key]) throw new Error('User already exists. Please sign in.');
  users[key] = {
    id: key,
    name: String(name || '').trim() || 'Student',
    email: key,
    password,
    role: STUDENT_ROLE,
  };
  saveUsers(users);
  return { id: key, name: users[key].name, email: key, role: STUDENT_ROLE };
}

const ALLOWED_ADMINS = {
  'admin@school.com': 'admin123'
};

export function loginAdmin({ email, password }) {
  const key = String(email).trim().toLowerCase();
  if (!ALLOWED_ADMINS[key]) throw new Error('Not authorized as Admin.');
  if (ALLOWED_ADMINS[key] !== password) throw new Error('Incorrect password.');
  recordUserLogin(key);
  return { id: key, name: 'Authorized Admin', email: key, role: 'admin' };
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const key = String(email).trim().toLowerCase();
  const u = users[key];
  if (!u) throw new Error('Account not found. Please register first.');
  if (u.password !== password) throw new Error('Incorrect password.');
  recordUserLogin(key);
  return { id: u.id, name: u.name, email: u.email, role: STUDENT_ROLE };
}

const LOGIN_TRACK_KEY = 'careercompass:logins:v1';

function readLoginTrack() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOGIN_TRACK_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeLoginTrack(entries) {
  localStorage.setItem(LOGIN_TRACK_KEY, JSON.stringify(entries));
}

export function recordUserLogin(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return;
  const entries = readLoginTrack();
  entries.unshift({ email: normalized, at: Date.now() });
  if (entries.length > 200) entries.length = 200;
  writeLoginTrack(entries);
}

export function loadLoginEntries(limit = 50) {
  const entries = readLoginTrack();
  const sliced = entries.slice(0, limit);
  return sliced;
}

export { loginTeacher } from './teacherAuth';
