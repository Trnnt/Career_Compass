import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ServerCog, RefreshCw, LogOut, Users, BookMarked, Activity, ShieldCheck, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  getOwnerEmail,
  getOwnerSecurityState,
  loadOwnerSecretKey,
  loadOwnerSession,
  ownerLogout,
  setOwnerSecretKey,
} from '../auth/ownerAuth';
import { fetchAdminSnapshot, publishStagedQuestions, saveAdminLinks, stageQuestion } from '../services/adminService';

const EMPTY_SNAPSHOT = {
  source: 'local',
  summary: { totalUsers: 0, activeProfiles: 0, totalAttempts: 0, avgScore: 0, recommendationsIssued: 0 },
  users: [],
  tests: [],
  questionBank: [],
  stagedQuestions: [],
  questionCoverage: [],
  domainPerformance: [],
  recentAttempts: [],
  links: [],
  alerts: [],
};

export default function Admin() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingLinks, setSavingLinks] = useState(false);
  const [stagingQuestion, setStagingQuestion] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [search, setSearch] = useState('');
  const [linkDraft, setLinkDraft] = useState({ label: '', url: '', domain: 'general' });
  const [links, setLinks] = useState([]);
  const [questionDraft, setQuestionDraft] = useState({
    domain: 'programming',
    trait: 'tech',
    difficulty: 'medium',
    prompt: '',
    options: ['', '', '', ''],
    answerIndex: 0,
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [secretDraft, setSecretDraft] = useState('');
  const [secretSaving, setSecretSaving] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [secretConfigured, setSecretConfigured] = useState(() => Boolean(loadOwnerSecretKey()));

  const loadSnapshot = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminSnapshot();
      setSnapshot(data || EMPTY_SNAPSHOT);
      setLinks(Array.isArray(data?.links) ? data.links : []);
    } catch (err) {
      setError(err?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSnapshot();
  }, []);

  const apiStateLabel = useMemo(
    () => (snapshot.source === 'api' ? 'Spring Boot connected' : 'Local fallback mode'),
    [snapshot.source]
  );

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return snapshot.users;
    return snapshot.users.filter((u) => {
      return String(u.name || '').toLowerCase().includes(q) || String(u.email || '').toLowerCase().includes(q);
    });
  }, [snapshot.users, search]);

  const ownerSession = loadOwnerSession();
  const ownerSecurity = getOwnerSecurityState();

  const addLink = () => {
    const label = linkDraft.label.trim();
    const url = linkDraft.url.trim();
    if (!label || !url) return;
    setLinks((prev) => [...prev, { id: `link_${Date.now()}`, label, url, domain: linkDraft.domain }]);
    setLinkDraft({ label: '', url: '', domain: 'general' });
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((x) => x.id !== id));
  };

  const persistLinks = async () => {
    setSavingLinks(true);
    setError('');
    try {
      await saveAdminLinks(links);
      await loadSnapshot();
    } catch (err) {
      setError(err?.message || 'Unable to save links');
    } finally {
      setSavingLinks(false);
    }
  };

  const saveSecretKey = () => {
    const nextKey = secretDraft.trim();
    if (!nextKey) {
      setSecretMessage('Secret key cannot be empty.');
      return;
    }
    setSecretSaving(true);
    try {
      setOwnerSecretKey(nextKey);
      setSecretConfigured(true);
      setSecretMessage('Secret key saved.');
      setSecretDraft('');
    } finally {
      setSecretSaving(false);
    }
  };

  const clearSecretKey = () => {
    setOwnerSecretKey('');
    setSecretConfigured(false);
    setSecretMessage('Secret key cleared.');
  };

  const submitQuestion = async () => {
    if (!questionDraft.prompt.trim()) return;
    if (questionDraft.options.some((x) => !x.trim())) return;
    setStagingQuestion(true);
    setError('');
    try {
      await stageQuestion({
        domain: questionDraft.domain,
        trait: questionDraft.trait,
        difficulty: questionDraft.difficulty,
        prompt: questionDraft.prompt.trim(),
        options: questionDraft.options.map((x) => x.trim()),
        answerIndex: Number(questionDraft.answerIndex) || 0,
      });
      setQuestionDraft((prev) => ({ ...prev, prompt: '', options: ['', '', '', ''], answerIndex: 0 }));
      await loadSnapshot();
    } catch (err) {
      setError(err?.message || 'Unable to stage question');
    } finally {
      setStagingQuestion(false);
    }
  };

  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setQuestionDraft(prev => ({
        ...prev,
        prompt: `[AI Generated] What is the best approach to handle ${prev.domain} problems involving ${prev.trait} at a ${prev.difficulty} complexity?`,
        options: [
          'A plausible but technically incorrect approach',
          'The optimal and structurally sound AI-verified approach',
          'An entirely irrelevant methodology',
          'Legacy pattern that is no longer recommended'
        ],
        answerIndex: 1
      }));
      setIsGeneratingAI(false);
    }, 1200);
  };

  const handlePublishStaged = async () => {
    setPublishing(true);
    setError('');
    try {
      await publishStagedQuestions();
      await loadSnapshot();
    } catch (err) {
      setError(err?.message || 'Unable to publish staged questions');
    } finally {
      setPublishing(false);
    }
  };

  const doOwnerLogout = () => {
    ownerLogout();
    navigate('/owner/login', { replace: true });
  };

  const downloadFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toCsv = (rows) => {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [headers.join(',')];
    rows.forEach((row) => lines.push(headers.map((h) => escapeCsv(row[h])).join(',')));
    return lines.join('\n');
  };

  const exportUsersCsv = () => {
    const csv = toCsv(
      snapshot.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        attempts: u.attempts,
        bestScore: u.bestScore,
        latestRecommendation: u.latestRecommendation,
      }))
    );
    downloadFile(`users_${Date.now()}.csv`, csv, 'text/csv');
  };

  const exportAttemptsCsv = () => {
    const csv = toCsv(
      snapshot.recentAttempts.map((a) => ({
        id: a.id,
        type: a.type,
        correct: a.correct,
        total: a.total,
        percent: a.percent,
        weekKey: a.weekKey || '-',
      }))
    );
    downloadFile(`attempts_${Date.now()}.csv`, csv, 'text/csv');
  };

  const exportSnapshotJson = () => {
    downloadFile(`admin_snapshot_${Date.now()}.json`, JSON.stringify(snapshot, null, 2), 'application/json');
  };

  return (
    <div className="space-y-8 pb-16">
      <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_24px_100px_rgba(0,0,0,0.45)] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ServerCog size={40} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-white/70 mt-1">
                Backbone for users, test engine, score fetch, links, and backend operations.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1.5 text-xs rounded-full border border-white/10 bg-white/10 text-white/80">
              {apiStateLabel}
            </span>
            <button
              type="button"
              onClick={loadSnapshot}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh data
            </button>
            <button
              type="button"
              onClick={doOwnerLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 transition"
            >
              <LogOut size={16} />
              Owner sign out
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-rose-200 text-sm">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Users} label="Registered users" value={snapshot.summary.totalUsers} />
        <MetricCard icon={CheckCircle2} label="Profiles completed" value={snapshot.summary.activeProfiles} />
        <MetricCard icon={Activity} label="Total attempts" value={snapshot.summary.totalAttempts} />
        <MetricCard icon={BookMarked} label="Average score" value={`${snapshot.summary.avgScore}%`} />
        <MetricCard icon={ShieldCheck} label="Recommendations" value={snapshot.summary.recommendationsIssued} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
        <div className="space-y-8">
          <Panel title="Security & Owner Session" subtitle="Owner-only gate and access telemetry">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatPill label="Owner email" value={getOwnerEmail()} />
              <StatPill
                label="Session status"
                value={ownerSession ? 'Active' : 'Not active'}
                tone={ownerSession ? 'ok' : 'warn'}
              />
              <StatPill
                label="Failed attempts"
                value={ownerSecurity.failedAttempts}
                tone={ownerSecurity.failedAttempts > 0 ? 'warn' : 'ok'}
              />
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <StatPill
                label="Secret key configured"
                value={secretConfigured ? 'Yes' : 'No'}
                tone={secretConfigured ? 'ok' : 'warn'}
              />
              <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-white/60">Secret key lets you unlock the admin panel without typing credentials.</p>
                <div className="flex gap-2">
                  <input
                    value={secretDraft}
                    onChange={(e) => setSecretDraft(e.target.value)}
                    placeholder="Enter secret key"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={saveSecretKey}
                    disabled={secretSaving}
                    className="px-3 py-2 rounded-xl bg-emerald-500/70 text-white text-sm font-semibold hover:bg-emerald-500 transition disabled:opacity-60"
                  >
                    {secretSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearSecretKey}
                  className="text-xs text-rose-300 hover:text-rose-200 underline"
                >
                  Remove secret key
                </button>
                {secretMessage ? (
                  <p className="text-xs text-emerald-200">{secretMessage}</p>
                ) : null}
              </div>
            </div>
            <Panel title="System signals" subtitle="Track usage and question health">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatPill
                  label="Unique logins"
                  value={`${snapshot.metrics?.uniqueLogins ?? 0}`}
                  tone="ok"
                />
                <StatPill
                  label="Tested users"
                  value={`${snapshot.metrics?.testedUsers ?? 0}`}
                  tone="ok"
                />
                <StatPill
                  label="Questions flagged"
                  value={`${snapshot.questionProblems?.length ?? 0}`}
                  tone={snapshot.questionProblems?.length ? 'warn' : 'ok'}
                />
              </div>
              {snapshot.questionProblems?.length ? (
                <div className="mt-4 space-y-2">
                  {snapshot.questionProblems.map((item) => (
                    <div
                      key={item.domain}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70"
                    >
                      {item.domain} has only {item.questionCount} questions (needs more coverage).
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-white/50 mt-3">No question problems detected.</p>
              )}
            </Panel>
            {snapshot.alerts?.length ? (
              <div className="mt-4 space-y-2">
                {snapshot.alerts.map((a, idx) => (
                  <div
                    key={`${a.type}_${idx}`}
                    className="rounded-xl border border-amber-300/20 bg-amber-500/10 px-3 py-2 text-amber-100 text-sm"
                  >
                    {a.message}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-sm mt-3">No active system alerts.</p>
            )}
          </Panel>

          <Panel title="Registered Users" subtitle="Searchable list of users and progress">
            <div className="mb-3">
              <Field
                label="Search user"
                value={search}
                onChange={setSearch}
                placeholder="Search by name or email"
              />
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                type="button"
                onClick={exportUsersCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition"
              >
                <Download size={16} />
                Export users CSV
              </button>
              <button
                type="button"
                onClick={exportSnapshotJson}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/70 text-white font-semibold hover:bg-cyan-500 transition"
              >
                <Download size={16} />
                Export full JSON
              </button>
            </div>
            {loading ? (
              <p className="text-white/60">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p className="text-white/60">No users matched.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-white/50 border-b border-white/10">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Name</th>
                      <th className="py-2 pr-4 font-medium">Email</th>
                      <th className="py-2 pr-4 font-medium">Attempts</th>
                      <th className="py-2 pr-4 font-medium">Best</th>
                      <th className="py-2 pr-4 font-medium">Top recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-white/5">
                        <td className="py-3 pr-4">{u.name}</td>
                        <td className="py-3 pr-4">{u.email}</td>
                        <td className="py-3 pr-4 tabular-nums">{u.attempts}</td>
                        <td className="py-3 pr-4 tabular-nums">{u.bestScore}%</td>
                        <td className="py-3 pr-4">{u.latestRecommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Recent Score Fetch" subtitle="Latest attempts captured for analytics and backend sync">
            <div className="mb-4">
              <button
                type="button"
                onClick={exportAttemptsCsv}
                className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition"
              >
                Export attempts CSV
              </button>
            </div>
            {snapshot.recentAttempts.length === 0 ? (
              <p className="text-white/60">No attempt data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-white/50 border-b border-white/10">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Marks</th>
                      <th className="py-2 pr-4 font-medium">Score</th>
                      <th className="py-2 pr-4 font-medium">Week</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {snapshot.recentAttempts.map((a) => (
                      <tr key={a.id} className="border-b border-white/5">
                        <td className="py-3 pr-4">{a.type || '-'}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {a.correct ?? 0}/{a.total ?? 0}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">{a.percent ?? 0}%</td>
                        <td className="py-3 pr-4">{a.weekKey || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Question Refresh (Stage)" subtitle="Create/stage questions before publishing to live bank">
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
              <p className="text-sm text-indigo-300/80 leading-relaxed">
                <strong className="text-indigo-400">What is this?</strong> Staging a question allows you to draft and review questions before they go live in the main test bank. This benefits the system by ensuring all questions are verified for accuracy.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SelectInput
                label="Knowledge Domain"
                value={questionDraft.domain}
                onChange={(value) => setQuestionDraft((prev) => ({ ...prev, domain: value }))}
                options={['programming', 'tech', 'math', 'communication', 'business', 'helping']}
              />
              <SelectInput
                label="Cognitive Trait"
                value={questionDraft.trait}
                onChange={(value) => setQuestionDraft((prev) => ({ ...prev, trait: value }))}
                options={['tech', 'logic', 'analytical', 'team', 'business', 'helping']}
              />
              <SelectInput
                label="Difficulty"
                value={questionDraft.difficulty}
                onChange={(value) => setQuestionDraft((prev) => ({ ...prev, difficulty: value }))}
                options={['easy', 'medium', 'hard']}
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Field
                  label="📝 Question Prompt"
                  value={questionDraft.prompt}
                  onChange={(value) => setQuestionDraft((prev) => ({ ...prev, prompt: value }))}
                  placeholder="e.g., What is the time complexity of QuickSort in the worst case?"
                />
              </div>
              <button
                type="button"
                onClick={handleAIGenerate}
                disabled={isGeneratingAI}
                className="w-full sm:w-auto px-5 py-3 h-[46px] rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-70 whitespace-nowrap"
              >
                {isGeneratingAI ? <RefreshCw className="animate-spin" size={18} /> : <span>✨ Auto-Generate AI</span>}
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <span>🎯</span> Answer Choices
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {questionDraft.options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const placeholders = [
                    "e.g., O(n log n)",
                    "e.g., O(n²)",
                    "e.g., O(1)",
                    "e.g., O(log n)"
                  ];
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute left-3 top-[50%] -translate-y-[50%] font-bold text-white/30 text-xs bg-white/5 w-6 h-6 flex items-center justify-center rounded-md">
                        {letters[idx]}
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) =>
                          setQuestionDraft((prev) => ({
                            ...prev,
                            options: prev.options.map((x, i) => (i === idx ? e.target.value : x)),
                          }))
                        }
                        placeholder={placeholders[idx]}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition outline-none ${questionDraft.answerIndex === idx
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100 placeholder-emerald-200/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'bg-white/5 border-white/10 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                          }`}
                      />
                      {questionDraft.answerIndex === idx && (
                        <div className="absolute right-3 top-[50%] -translate-y-[50%] text-emerald-400">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 w-full sm:w-64">
              <SelectInput
                label="✅ Correct Option (Index)"
                value={String(questionDraft.answerIndex)}
                onChange={(value) => setQuestionDraft((prev) => ({ ...prev, answerIndex: Number(value) }))}
                options={['0 (Option A)', '1 (Option B)', '2 (Option C)', '3 (Option D)']}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitQuestion}
                disabled={stagingQuestion}
                className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition disabled:opacity-60"
              >
                {stagingQuestion ? 'Staging...' : 'Stage question'}
              </button>
              <button
                type="button"
                onClick={handlePublishStaged}
                disabled={publishing || snapshot.stagedQuestions.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-500/80 text-white font-semibold hover:bg-emerald-500 transition disabled:opacity-60"
              >
                {publishing ? 'Publishing...' : `Publish staged (${snapshot.stagedQuestions.length})`}
              </button>
            </div>
          </Panel>
        </div>

        <div className="space-y-8">
          <Panel title="Learning Links" subtitle="Store and sync resource links for recommendations and roadmap">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field
                label="Label"
                value={linkDraft.label}
                onChange={(value) => setLinkDraft((prev) => ({ ...prev, label: value }))}
                placeholder="Java DSA playlist"
              />
              <Field
                label="URL"
                value={linkDraft.url}
                onChange={(value) => setLinkDraft((prev) => ({ ...prev, url: value }))}
                placeholder="https://..."
              />
              <SelectInput
                label="Domain"
                value={linkDraft.domain}
                onChange={(value) => setLinkDraft((prev) => ({ ...prev, domain: value }))}
                options={['general', 'programming', 'tech', 'math', 'business', 'communication']}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-2 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition"
              >
                Add link
              </button>
              <button
                type="button"
                onClick={persistLinks}
                disabled={savingLinks}
                className="px-4 py-2 rounded-xl bg-cyan-500/80 text-white font-semibold hover:bg-cyan-500 transition disabled:opacity-60"
              >
                {savingLinks ? 'Saving...' : 'Save links'}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {links.length === 0 ? (
                <p className="text-white/60 text-sm">No links added yet.</p>
              ) : (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate">{link.label}</p>
                      <p className="text-white/50 text-xs truncate">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="text-rose-300 hover:text-rose-200 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Staged Question Queue" subtitle="Questions waiting for publish">
            {snapshot.stagedQuestions.length === 0 ? (
              <p className="text-white/60">No staged questions.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-auto custom-scrollbar pr-1">
                {snapshot.stagedQuestions.map((q) => (
                  <div key={q.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <p className="text-white/90 text-sm">{q.prompt}</p>
                    <p className="text-white/50 text-xs mt-1">
                      {q.domain} | trait: {q.trait} | answer: {q.answerIndex}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Question Bank Coverage" subtitle="Distribution by domain">
            <div className="space-y-2">
              {snapshot.questionCoverage.length === 0 ? (
                <p className="text-white/60">No questions available.</p>
              ) : (
                snapshot.questionCoverage.map((item) => (
                  <div key={item.domain} className="flex items-center justify-between text-sm text-white/80">
                    <span>{item.domain}</span>
                    <span className="tabular-nums">{item.questionCount}</span>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Score Analytics" subtitle="Average domain performance from attempts">
            <div className="space-y-2">
              {snapshot.domainPerformance.length === 0 ? (
                <p className="text-white/60">No score data yet.</p>
              ) : (
                snapshot.domainPerformance.map((row) => (
                  <div key={row.domain} className="flex items-center justify-between text-sm text-white/80">
                    <span>{row.domain}</span>
                    <span className="tabular-nums">
                      {row.avgScore}% ({row.attempts})
                    </span>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>
      </section>

      <Panel title="Backend API Contract (Spring Boot)" subtitle="Endpoints to implement on the Java backend">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <ContractRow method="GET" path="/api/admin/dashboard" note="Load users, tests, scores, links, staged queue" />
          <ContractRow method="PUT" path="/api/admin/links" note="Persist curated resource links" />
          <ContractRow method="POST" path="/api/admin/questions/stage" note="Stage new questions for review" />
          <ContractRow method="POST" path="/api/admin/questions/publish" note="Publish staged questions to live bank" />
          <ContractRow method="GET" path="/api/admin/attempts?limit=50" note="Fetch latest score attempts" />
          <ContractRow method="POST" path="/api/admin/questions/refresh" note="Rebuild test sets and clear stale cache" />
        </div>
      </Panel>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-5 group hover:bg-white/10 transition-colors">
      <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-10 transition-opacity">
        {Icon && <Icon size={100} />}
      </div>
      <div className="flex items-center gap-2 text-white/60 mb-2 relative z-10">
        {Icon && <Icon size={16} />}
        <p className="text-xs font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-extrabold text-white tabular-nums relative z-10">{value}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-sm text-white/60 mt-1">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/65 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-indigo-400"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-xs text-white/65 mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:border-indigo-400"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function ContractRow({ method, path, note }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center min-w-14 px-2 py-1 rounded-md bg-white/10 text-cyan-200 text-xs font-semibold">
          {method}
        </span>
        <code className="text-white/90 text-xs">{path}</code>
      </div>
      <p className="text-white/60 text-xs mt-2">{note}</p>
    </div>
  );
}

function StatPill({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'ok'
      ? 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100'
      : tone === 'warn'
        ? 'border-amber-300/20 bg-amber-500/10 text-amber-100'
        : 'border-white/10 bg-white/5 text-white/80';
  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="text-sm mt-1">{value}</p>
    </div>
  );
}
