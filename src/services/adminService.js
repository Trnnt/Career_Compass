import { TEST_BANK, TEST_CATALOG } from '../data/tests';
import { loadLoginEntries } from '../auth/auth';

const USERS_KEY = 'careercompass:users:v1';
const APP_KEY_PREFIX = 'careercompass:v1:';
const ADMIN_LINKS_KEY = 'careercompass:admin:links:v1';
const STAGED_QUESTIONS_KEY = 'careercompass:admin:questions:v1';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function loadUsersLocal() {
  const usersMap = safeParse(localStorage.getItem(USERS_KEY), {});
  return Object.values(usersMap || {}).map((u) => ({
    id: u?.id || u?.email,
    name: u?.name || 'Student',
    email: u?.email || '',
    createdAt: u?.createdAt || null,
  }));
}

function loadStateForUser(userId) {
  return safeParse(localStorage.getItem(`${APP_KEY_PREFIX}${String(userId || '').toLowerCase()}`), {});
}

function buildDomainStats(attempts) {
  const totals = {};
  attempts.forEach((a) => {
    Object.entries(a.domainScores || {}).forEach(([domain, score]) => {
      if (!totals[domain]) totals[domain] = { sum: 0, count: 0 };
      totals[domain].sum += Number(score) || 0;
      totals[domain].count += 1;
    });
  });
  return Object.entries(totals)
    .map(([domain, value]) => ({
      domain,
      avgScore: value.count ? Math.round(value.sum / value.count) : 0,
      attempts: value.count,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function loadLinksLocal() {
  const links = safeParse(localStorage.getItem(ADMIN_LINKS_KEY), []);
  if (!Array.isArray(links)) return [];
  return links;
}

function loadStagedQuestionsLocal() {
  const questions = safeParse(localStorage.getItem(STAGED_QUESTIONS_KEY), []);
  if (!Array.isArray(questions)) return [];
  return questions;
}

function saveStagedQuestionsLocal(questions) {
  localStorage.setItem(STAGED_QUESTIONS_KEY, JSON.stringify(questions));
}

function buildQuestionDomainCoverage(questions) {
  const counts = {};
  questions.forEach((q) => {
    const domain = q?.domain || 'unknown';
    counts[domain] = (counts[domain] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([domain, questionCount]) => ({ domain, questionCount }))
    .sort((a, b) => b.questionCount - a.questionCount);
}

async function fetchJson(path, init) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json();
}

function buildLocalSnapshot() {
  const users = loadUsersLocal();
  const states = users.map((u) => ({ user: u, state: loadStateForUser(u.id) }));
  const allAttempts = states.flatMap((x) => x.state?.attempts || []);
  const totalUsers = users.length;
  const totalAttempts = allAttempts.length;
  const avgScore = totalAttempts
    ? Math.round(allAttempts.reduce((sum, a) => sum + (Number(a?.percent) || 0), 0) / totalAttempts)
    : 0;
  const activeProfiles = states.filter((x) => x.state?.profile).length;
  const recommendationsIssued = states.reduce(
    (sum, x) => sum + (Array.isArray(x.state?.recommendations) ? x.state.recommendations.length : 0),
    0
  );

  const recentAttempts = allAttempts
    .slice()
    .sort((a, b) => new Date(b?.completedAt || 0).getTime() - new Date(a?.completedAt || 0).getTime())
    .slice(0, 15);

  const questionCatalog = [...TEST_BANK, ...loadStagedQuestionsLocal()];
  const stagedQuestions = loadStagedQuestionsLocal();
  const lowCoverage = buildQuestionDomainCoverage(questionCatalog).filter((x) => x.questionCount < 2);

  const loginEntries = loadLoginEntries(50);
  const uniqueLogins = new Set(loginEntries.map((entry) => entry.email)).size;
  const testedUsers = states.filter((s) => Array.isArray(s.state?.attempts) && s.state.attempts.length > 0).length;

  return {
    source: 'local',
    summary: {
      totalUsers,
      activeProfiles,
      totalAttempts,
      avgScore,
      recommendationsIssued,
    },
    users: states.map(({ user, state }) => ({
      ...user,
      hasProfile: Boolean(state?.profile),
      attempts: Array.isArray(state?.attempts) ? state.attempts.length : 0,
      bestScore: Math.max(0, ...(state?.attempts || []).map((a) => Number(a?.percent) || 0)),
      latestRecommendation: state?.recommendations?.[0]?.name || '-',
    })),
    tests: TEST_CATALOG,
    questionBank: questionCatalog,
    stagedQuestions,
    questionCoverage: buildQuestionDomainCoverage(questionCatalog),
    domainPerformance: buildDomainStats(allAttempts),
    recentAttempts,
    links: loadLinksLocal(),
    alerts: [
      ...(lowCoverage.length
        ? [{ type: 'warning', message: `Low question coverage in ${lowCoverage.map((x) => x.domain).join(', ')}` }]
        : []),
      ...(totalUsers === 0 ? [{ type: 'info', message: 'No registered users yet.' }] : []),
    ],
    metrics: {
      uniqueLogins,
      testedUsers,
      totalAttempts,
      totalUsers,
    },
    loginEntries,
    questionProblems: lowCoverage,
  };
}

export async function fetchAdminSnapshot() {
  if (!API_BASE) return buildLocalSnapshot();
  try {
    const data = await fetchJson('/api/admin/dashboard');
    return { ...data, source: 'api' };
  } catch {
    return buildLocalSnapshot();
  }
}

export async function saveAdminLinks(links) {
  if (!Array.isArray(links)) throw new Error('links must be an array');
  if (!API_BASE) {
    localStorage.setItem(ADMIN_LINKS_KEY, JSON.stringify(links));
    return { ok: true, source: 'local' };
  }
  try {
    await fetchJson('/api/admin/links', {
      method: 'PUT',
      body: JSON.stringify({ links }),
    });
    return { ok: true, source: 'api' };
  } catch {
    localStorage.setItem(ADMIN_LINKS_KEY, JSON.stringify(links));
    return { ok: true, source: 'local' };
  }
}

export async function stageQuestion(question) {
  if (!question?.prompt || !question?.domain) {
    throw new Error('Question prompt and domain are required');
  }
  if (!API_BASE) {
    const current = loadStagedQuestionsLocal();
    const next = [
      ...current,
      {
        ...question,
        id: question.id || `staged_${Date.now()}`,
        stagedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STAGED_QUESTIONS_KEY, JSON.stringify(next));
    return { ok: true, source: 'local' };
  }
  try {
    await fetchJson('/api/admin/questions/stage', {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return { ok: true, source: 'api' };
  } catch {
    const current = loadStagedQuestionsLocal();
    localStorage.setItem(STAGED_QUESTIONS_KEY, JSON.stringify([...current, question]));
    return { ok: true, source: 'local' };
  }
}

export async function publishStagedQuestions() {
  if (!API_BASE) {
    saveStagedQuestionsLocal([]);
    return { ok: true, source: 'local' };
  }
  try {
    await fetchJson('/api/admin/questions/publish', {
      method: 'POST',
      body: JSON.stringify({ publish: true }),
    });
    return { ok: true, source: 'api' };
  } catch {
    saveStagedQuestionsLocal([]);
    return { ok: true, source: 'local' };
  }
}
