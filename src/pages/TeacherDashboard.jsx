import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { fetchAdminSnapshot } from '../services/adminService';
import {
    BookOpen, Users, ClipboardList, CheckCircle2, TrendingUp, LogOut,
    Activity, AlertCircle, Sun, Moon, CalendarDays, Bell, BarChart3,
    Star, Award, Zap, Target, RefreshCw
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

/* ─────────────────────────────────────────────
   Scoped CSS — all teacher-panel vars
   ───────────────────────────────────────────── */
const css = `
.tp-root {
    --tp-bg:       #0c0e17;
    --tp-surface:  rgba(255,255,255,0.04);
    --tp-border:   rgba(255,255,255,0.08);
    --tp-text:     #f0f0f5;
    --tp-muted:    rgba(240,240,245,0.45);
    --tp-card:     rgba(255,255,255,0.05);
    --tp-hover:    rgba(255,255,255,0.08);
    --tp-shadow:   0 8px 40px rgba(0,0,0,0.5);
    --tp-green:    #10b981;
    --tp-red:      #f43f5e;
    --tp-indigo:   #818cf8;
    --tp-yellow:   #fbbf24;
    --tp-divider:  rgba(255,255,255,0.07);
}
.tp-root.is-light {
    --tp-bg:       #f1f5f9;
    --tp-surface:  #ffffff;
    --tp-border:   rgba(0,0,0,0.08);
    --tp-text:     #0f172a;
    --tp-muted:    #64748b;
    --tp-card:     #ffffff;
    --tp-hover:    #f8fafc;
    --tp-shadow:   0 4px 24px rgba(0,0,0,0.08);
    --tp-divider:  #e2e8f0;
}
.tp-page { background: var(--tp-bg); min-height: 100vh; padding: 24px 24px 64px; transition: background .3s; }
.tp-wrap { max-width: 1600px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px; }

/* Card */
.tp-card {
    background: var(--tp-card);
    border: 1px solid var(--tp-border);
    border-radius: 24px;
    box-shadow: var(--tp-shadow);
    padding: 28px;
    transition: background 0.3s, border-color 0.3s;
}

/* Header */
.tp-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--tp-divider); padding-bottom: 24px; }
.tp-title { font-size: 2rem; font-weight: 900; letter-spacing: -0.04em; background: linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #a78bfa 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.tp-subtitle { color: var(--tp-muted); font-size: 0.9rem; margin-top: 4px; }
.tp-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.tp-btn-ghost { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 12px; border: 1px solid var(--tp-border); background: var(--tp-card); color: var(--tp-muted); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all .2s; }
.tp-btn-ghost:hover { background: var(--tp-hover); color: var(--tp-text); }
.tp-btn-danger { border-color: rgba(244,63,94,.3); background: rgba(244,63,94,.1); color: #f43f5e; }
.tp-btn-danger:hover { background: rgba(244,63,94,.2); }
.tp-theme-btn { border-color: rgba(129,140,248,.3); background: rgba(129,140,248,.1); color: var(--tp-indigo); }
.tp-theme-btn:hover { background: rgba(129,140,248,.2); }

/* Stat row */
.tp-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
.tp-stat { border-radius: 20px; border: 1px solid var(--tp-border); background: var(--tp-card); padding: 20px 22px; position: relative; overflow: hidden; cursor: default; transition: background .2s; }
.tp-stat:hover { background: var(--tp-hover); }
.tp-stat-icon { position: absolute; right: -8px; top: -8px; opacity: 0.05; }
.tp-stat-label { font-size: 0.72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--tp-muted); margin-bottom: 8px; }
.tp-stat-value { font-size: 2.2rem; font-weight: 900; color: var(--tp-text); line-height: 1; }
.tp-stat-delta { font-size: 0.72rem; font-weight: 600; margin-top: 6px; }

/* Table */
.tp-table-wrap { overflow-x: auto; }
.tp-table { width: 100%; border-collapse: collapse; }
.tp-table thead tr { border-bottom: 1px solid var(--tp-divider); }
.tp-table thead th { padding: 12px 14px; font-size: 0.72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--tp-muted); text-align: left; }
.tp-table tbody tr { border-bottom: 1px solid var(--tp-divider); transition: background .15s; }
.tp-table tbody tr:last-child { border-bottom: none; }
.tp-table tbody tr:hover { background: var(--tp-hover); }
.tp-table td { padding: 14px; font-size: 0.88rem; color: var(--tp-text); }

/* Score badge */
.tp-score { display: inline-flex; align-items: center; justify-content: center; padding: 3px 10px; border-radius: 99px; font-size: 0.8rem; font-weight: 700; }
.tp-score-high { background: rgba(16,185,129,.15); color: #10b981; }
.tp-score-mid  { background: rgba(251,191,36,.15);  color: #fbbf24; }
.tp-score-low  { background: rgba(244,63,94,.15);  color: #f43f5e; }

/* Section headings */
.tp-section-title { font-size: 1.05rem; font-weight: 800; color: var(--tp-text); display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }

/* Progress bar */
.tp-progress-bg { background: var(--tp-divider); border-radius: 99px; height: 8px; flex: 1; overflow: hidden; }
.tp-progress-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }

/* Timeline */
.tp-timeline { display: flex; flex-direction: column; gap: 20px; position: relative; padding-left: 24px; }
.tp-timeline::before { content: ''; position: absolute; left: 7px; top: 6px; bottom: 0; width: 2px; background: var(--tp-divider); border-radius: 99px; }
.tp-timeline-dot { position: absolute; left: -20px; top: 2px; width: 14px; height: 14px; border-radius: 50%; border: 2px solid; display: flex; align-items: center; justify-content: center; }
.tp-timeline-item { position: relative; }
.tp-timeline-text { font-size: 0.87rem; color: var(--tp-text); line-height: 1.4; }
.tp-timeline-time { font-size: 0.72rem; color: var(--tp-muted); margin-top: 3px; }

/* Announce */
.tp-announce { border-radius: 16px; padding: 16px; margin-bottom: 12px; border: 1px solid var(--tp-border); background: var(--tp-hover); }
.tp-announce-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; display: inline-block; margin-bottom: 8px; }

/* Heatmap */
.tp-heatmap { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; }
.tp-heat-cell { aspect-ratio: 1; border-radius: 6px; cursor: default; }

/* Grid layouts */
.tp-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media(max-width:640px){ .tp-2col { grid-template-columns: 1fr; } }
`;

const SUBJECTS = [
    { name: 'Programming', pct: 76, color: '#818cf8' },
    { name: 'Mathematics', pct: 58, color: '#fbbf24' },
    { name: 'Communication', pct: 85, color: '#10b981' },
    { name: 'Problem Solving', pct: 62, color: '#f43f5e' },
    { name: 'Data Structures', pct: 44, color: '#a78bfa' },
];

const UPCOMING = [
    { title: 'Weekly Assessment — Batch A', date: 'Mar 3, 2026', tag: 'Scheduled' },
    { title: 'Core Skill Test — Intermediate', date: 'Mar 7, 2026', tag: 'Upcoming' },
    { title: 'Monthly Review Exam', date: 'Mar 15, 2026', tag: 'Pending' },
];

const ANNOUNCEMENTS = [
    { badge: 'Notice', color: '#fbbf24', text: 'Midterm results will be released by March 5th via student portals.' },
    { badge: 'Reminder', color: '#818cf8', text: 'Please update all student profiles with the current semester data.' },
    { badge: 'New', color: '#10b981', text: 'A new Career Aptitude module has been added. Assign it to Batch B.' },
];

// Generate a deterministic heatmap (7×6 for 6 weeks × 7 days)
const HEATMAP = Array.from({ length: 42 }, (_, i) => {
    const v = (Math.sin(i * 0.8 + 1.5) * 0.5 + 0.5);
    return Math.floor(v * 5); // 0..4
});

function heatColor(level, isLight) {
    const hues = ['transparent', '#312e81', '#4338ca', '#6366f1', '#818cf8'];
    const lhues = ['transparent', '#e0e7ff', '#c7d2fe', '#a5b4fc', '#6366f1'];
    return isLight ? lhues[level] : hues[level];
}

function scoreClass(v) {
    const n = parseFloat(v);
    if (n >= 75) return 'tp-score-high';
    if (n >= 50) return 'tp-score-mid';
    return 'tp-score-low';
}

export default function TeacherDashboard() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAdminSnapshot();
                setSnapshot(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.role === 'teacher') load();
    }, [user, refreshKey]);

    if (!user || user.role !== 'teacher') return <Navigate to="/login" replace />;

    const students = snapshot?.users || [];
    const totalStudents = students.length;
    const avgScore = snapshot?.summary?.avgScore || 0;
    const totalAttempts = snapshot?.summary?.totalAttempts || 0;
    const activeProfiles = snapshot?.summary?.activeProfiles || 0;

    const topStudents = useMemo(() =>
        [...students].filter(s => parseFloat(s.bestScore) > 0)
            .sort((a, b) => parseFloat(b.bestScore) - parseFloat(a.bestScore)),
        [students]);

    const needsHelp = useMemo(() =>
        [...students].filter(s => parseFloat(s.bestScore) > 0 && parseFloat(s.bestScore) <= 50)
            .sort((a, b) => parseFloat(a.bestScore) - parseFloat(b.bestScore)),
        [students]);

    const activityFeed = [
        { color: '#10b981', bg: 'rgba(16,185,129,.2)', border: 'rgba(16,185,129,.3)', name: students[0]?.name || 'Aarav Mehta', action: 'completed the weekly assessment.', time: '2h ago' },
        { color: '#818cf8', bg: 'rgba(129,140,248,.2)', border: 'rgba(129,140,248,.3)', name: students[1]?.name || 'Priya Sharma', action: 'updated their career profile.', time: '5h ago' },
        { color: '#f43f5e', bg: 'rgba(244,63,94,.2)', border: 'rgba(244,63,94,.3)', name: students[2]?.name || 'Rohan Gupta', action: 'scored below class average.', time: '1d ago' },
        { color: '#fbbf24', bg: 'rgba(251,191,36,.2)', border: 'rgba(251,191,36,.3)', name: students[3]?.name || 'Sneha Kapoor', action: 'registered for next month\'s exam.', time: '1d ago' },
        { color: '#a78bfa', bg: 'rgba(167,139,250,.2)', border: 'rgba(167,139,250,.3)', name: students[4]?.name || 'Dev Patel', action: 'achieved a new personal best: 90%.', time: '2d ago' },
    ];

    return (
        <div className={`tp-root${isDark ? '' : ' is-light'}`}>
            <style>{css}</style>
            <div className="tp-page">
                <div className="tp-wrap">

                    {/* ── Header ── */}
                    <header className="tp-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ padding: 14, borderRadius: 20, background: 'rgba(99,102,241,.12)', border: '1px solid rgba(99,102,241,.2)', color: '#818cf8' }}>
                                <BookOpen size={36} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="tp-title">Teacher Panel</div>
                                <p className="tp-subtitle">Welcome back, <strong>{user.name}</strong>! Your class overview for today.</p>
                            </div>
                        </div>
                        <div className="tp-header-actions">
                            <button className="tp-btn-ghost tp-theme-btn" onClick={toggleTheme}>
                                {isDark ? <Sun size={15} /> : <Moon size={15} />}
                                {isDark ? 'Light' : 'Dark'} Mode
                            </button>
                            <button className="tp-btn-ghost" onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }}>
                                <RefreshCw size={15} /> Refresh
                            </button>
                            <button className="tp-btn-ghost tp-btn-danger" onClick={logout}>
                                <LogOut size={15} /> Sign out
                            </button>
                        </div>
                    </header>

                    {/* ── Top Stats ── */}
                    <div className="tp-stats">
                        <StatCard icon={Users} label="Total Students" value={loading ? '…' : totalStudents} delta="+3 this month" deltaColor="#10b981" iconColor="#818cf8" />
                        <StatCard icon={CheckCircle2} label="Active Profiles" value={loading ? '…' : activeProfiles} delta="of total" deltaColor="#fbbf24" iconColor="#a78bfa" />
                        <StatCard icon={TrendingUp} label="Average Score" value={loading ? '…' : `${avgScore}%`} delta="+5% vs last month" deltaColor="#10b981" iconColor="#10b981" />
                        <StatCard icon={BarChart3} label="Total Attempts" value={loading ? '…' : totalAttempts} delta="all time" deltaColor="#f43f5e" iconColor="#fbbf24" />
                    </div>

                    {/* ── Student Table & Subject Performance ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>

                        {/* Student Table */}
                        <div className="tp-card">
                            <div className="tp-section-title"><ClipboardList size={18} style={{ color: '#818cf8' }} /> Student Performance Overview</div>
                            <div className="tp-table-wrap">
                                <table className="tp-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student Name</th>
                                            <th>Email</th>
                                            <th>Attempts</th>
                                            <th>Best Score</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--tp-muted)', padding: 24 }}>Loading student data…</td></tr>
                                        ) : students.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--tp-muted)', padding: 24 }}>No students registered yet.</td></tr>
                                        ) : students.map((s, i) => {
                                            const sc = parseFloat(s.bestScore);
                                            const status = sc >= 75 ? '✅ On Track' : sc >= 50 ? '⚠️ Average' : sc > 0 ? '🔴 Needs Help' : '⬜ No Data';
                                            return (
                                                <tr key={s.id || i}>
                                                    <td style={{ color: 'var(--tp-muted)', fontSize: '0.78rem' }}>{i + 1}</td>
                                                    <td><span style={{ fontWeight: 700, color: 'var(--tp-text)' }}>{s.name}</span></td>
                                                    <td style={{ color: 'var(--tp-muted)' }}>{s.email}</td>
                                                    <td style={{ color: 'var(--tp-text)' }}>{s.attempts}</td>
                                                    <td><span className={`tp-score ${scoreClass(s.bestScore)}`}>{s.bestScore}%</span></td>
                                                    <td style={{ fontSize: '0.78rem', color: 'var(--tp-muted)' }}>{status}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Subject Performance */}
                        <div className="tp-card">
                            <div className="tp-section-title"><Target size={18} style={{ color: '#a78bfa' }} /> Class Performance by Subject</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {SUBJECTS.map(sub => (
                                    <div key={sub.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                            <span style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--tp-text)' }}>{sub.name}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: sub.color }}>{sub.pct}%</span>
                                        </div>
                                        <div className="tp-progress-bg">
                                            <div className="tp-progress-fill" style={{ width: `${sub.pct}%`, background: sub.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Class Insights + Activity Feed ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

                        {/* Top Performers & Needs Attention side by side */}
                        <div className="tp-card">
                            <div className="tp-section-title"><Activity size={18} style={{ color: '#10b981' }} /> Class Insights</div>
                            <div className="tp-2col">
                                {/* Top performers */}
                                <div>
                                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--tp-muted)', marginBottom: 12 }}>
                                        🏆 Top Performers
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {topStudents.slice(0, 3).length === 0 && <p style={{ color: 'var(--tp-muted)', fontSize: '.82rem' }}>No scores yet.</p>}
                                        {topStudents.slice(0, 3).map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.15)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>{i + 1}</div>
                                                    <span style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--tp-text)' }}>{s.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 800, color: '#10b981', fontSize: '.85rem' }}>{s.bestScore}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Needs help */}
                                <div>
                                    <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--tp-muted)', marginBottom: 12 }}>
                                        🔴 Needs Attention
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {needsHelp.slice(0, 3).length === 0 && <p style={{ color: 'var(--tp-muted)', fontSize: '.82rem' }}>All students above 50%.</p>}
                                        {needsHelp.slice(0, 3).map((s, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: 'rgba(244,63,94,.07)', border: '1px solid rgba(244,63,94,.15)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <AlertCircle size={14} style={{ color: '#f43f5e', flexShrink: 0 }} />
                                                    <span style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--tp-text)' }}>{s.name}</span>
                                                </div>
                                                <span style={{ fontWeight: 800, color: '#f43f5e', fontSize: '.85rem' }}>{s.bestScore}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div className="tp-card">
                            <div className="tp-section-title"><Zap size={18} style={{ color: '#fbbf24' }} /> Recent Activity</div>
                            <div className="tp-timeline">
                                {activityFeed.map((item, i) => (
                                    <div key={i} className="tp-timeline-item">
                                        <div className="tp-timeline-dot" style={{ background: item.bg, borderColor: item.border }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color }} />
                                        </div>
                                        <p className="tp-timeline-text">
                                            <span style={{ fontWeight: 700 }}>{item.name}</span>{' '}{item.action}
                                        </p>
                                        <p className="tp-timeline-time">{item.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Upcoming Tests + Announcements + Heatmap ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>

                        {/* Upcoming Tests */}
                        <div className="tp-card">
                            <div className="tp-section-title"><CalendarDays size={18} style={{ color: '#6366f1' }} /> Upcoming Tests</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {UPCOMING.map((t, i) => (
                                    <div key={i} style={{ padding: '14px 16px', borderRadius: 16, border: '1px solid var(--tp-border)', background: 'var(--tp-hover)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,.12)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <CalendarDays size={18} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.87rem', color: 'var(--tp-text)', marginBottom: 4 }}>{t.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--tp-muted)' }}>{t.date}</p>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(99,102,241,.15)', color: '#818cf8', display: 'inline-block', marginTop: 6 }}>{t.tag}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Announcements */}
                        <div className="tp-card">
                            <div className="tp-section-title"><Bell size={18} style={{ color: '#f43f5e' }} /> Announcements</div>
                            {ANNOUNCEMENTS.map((a, i) => (
                                <div key={i} className="tp-announce">
                                    <span className="tp-announce-badge" style={{ background: `${a.color}22`, color: a.color }}>{a.badge}</span>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--tp-text)', lineHeight: 1.5 }}>{a.text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Engagement Heatmap */}
                        <div className="tp-card">
                            <div className="tp-section-title"><Star size={18} style={{ color: '#fbbf24' }} /> 6-Week Engagement</div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--tp-muted)', marginBottom: 16 }}>Student logins &amp; test activity per day.</p>
                            <div className="tp-heatmap">
                                {HEATMAP.map((level, i) => (
                                    <div key={i} className="tp-heat-cell"
                                        style={{ background: heatColor(level, !isDark) }}
                                        title={`Activity level: ${level}`} />
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 16 }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--tp-muted)' }}>Less</span>
                                {[0, 1, 2, 3, 4].map(l => (
                                    <div key={l} style={{ width: 12, height: 12, borderRadius: 4, background: heatColor(l, !isDark) }} />
                                ))}
                                <span style={{ fontSize: '0.7rem', color: 'var(--tp-muted)' }}>More</span>
                            </div>
                        </div>

                    </div>

                    {/* ── Achievement Badges ── */}
                    <div className="tp-card">
                        <div className="tp-section-title"><Award size={18} style={{ color: '#a78bfa' }} /> Class Achievements</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                            {[
                                { icon: '🏆', title: 'Top Scorer', desc: `${topStudents[0]?.name || 'N/A'} — ${topStudents[0]?.bestScore || 0}%`, color: '#fbbf24' },
                                { icon: '🔥', title: 'Most Active', desc: `${[...students].sort((a, b) => b.attempts - a.attempts)[0]?.name || 'N/A'}`, color: '#f43f5e' },
                                { icon: '📈', title: 'Most Improved', desc: 'Based on last 2 tests', color: '#10b981' },
                                { icon: '⚡', title: 'Fastest Finish', desc: 'Completed in under 10 min', color: '#818cf8' },
                            ].map(b => (
                                <div key={b.title} style={{ padding: '16px', borderRadius: 18, border: '1px solid var(--tp-border)', background: 'var(--tp-hover)', display: 'flex', gap: 12, alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.6rem' }}>{b.icon}</span>
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: b.color }}>{b.title}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--tp-muted)', marginTop: 2 }}>{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, delta, deltaColor, iconColor }) {
    return (
        <div className="tp-stat">
            <div className="tp-stat-icon"><Icon size={80} style={{ color: iconColor }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon size={14} style={{ color: iconColor }} />
                <p className="tp-stat-label">{label}</p>
            </div>
            <p className="tp-stat-value">{value}</p>
            <p className="tp-stat-delta" style={{ color: deltaColor }}>{delta}</p>
        </div>
    );
}
