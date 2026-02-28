import React from 'react';

const FEATURE_HIGHLIGHTS = [
  {
    title: 'Focus streak',
    value: '5 days',
    detail: 'Log a practice moment daily to keep signals flowing into your career fit logic.',
  },
  {
    title: 'Opportunity radar',
    value: '3 pipelines',
    detail: 'We detect the streams where your latest score and profile give you early advantage.',
  },
  {
    title: 'Confidence index',
    value: '+12%',
    detail: 'Recommendations gained clarity because your latest tests added more context.',
  },
];

const OPPORTUNITY_ACTIONS = [
  { title: 'Schedule weekly test', detail: 'Reserve the next weekly slot and keep the streak alive.', badge: 'Habit' },
  { title: 'Refresh your profile', detail: 'Add new marks or interests so the logic stays accurate.', badge: 'Profile' },
  { title: 'Share the dashboard', detail: 'Send mentors a view of your latest analytics.', badge: 'Share' },
];

export function FeatureShowcase({ isDark }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {FEATURE_HIGHLIGHTS.map((item) => (
        <div
          key={item.title}
          className={`rounded-3xl border border-white/10 px-5 py-4 bg-gradient-to-br ${
            isDark ? 'from-white/5 to-white/0' : 'from-white/70 to-white/40'
          } shadow-[0_20px_80px_rgba(15,23,42,0.3)]`}
        >
          <p className="text-xs text-white/60">{item.title}</p>
          <p className="text-3xl font-bold text-white mt-2">{item.value}</p>
          <p className="text-sm text-white/60 mt-2">{item.detail}</p>
        </div>
      ))}
    </section>
  );
}

export function OpportunityBoard({ attempts, isDark }) {
  const streak = Math.min(Math.max(attempts.length, 0), 7);
  const latest = attempts[attempts.length - 1];
  const latestScore = Number(latest?.percent) || 0;
  const focusMessage =
    latestScore >= 85
      ? 'Push into scenario planning and leadership questions.'
      : latestScore >= 65
      ? 'Design disciplined practice batches for the week.'
      : 'Lock fundamentals before upping the difficulty.';
  const focusTone =
    latestScore >= 85
      ? 'bg-emerald-500/30 text-emerald-100'
      : latestScore >= 65
      ? 'bg-cyan-500/30 text-cyan-100'
      : 'bg-amber-500/30 text-amber-100';

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-white/60">Daily focus</p>
          <p className="text-2xl font-bold text-white mt-1">Streak · {streak} days</p>
          <p className="text-sm mt-2 text-white/70">{focusMessage}</p>
          <span className={`inline-flex mt-3 items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${focusTone}`}>
            last score {latestScore}%
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionChip label="Insight digest" detail="New guidance daily" />
          <ActionChip label="Career call" detail="Plan a mentor session" />
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {OPPORTUNITY_ACTIONS.map((item) => (
          <OpportunityAction key={item.title} title={item.title} detail={item.detail} badge={item.badge} isDark={isDark} />
        ))}
      </div>
    </section>
  );
}

function OpportunityAction({ title, detail, badge, isDark }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 p-4 ${isDark ? 'bg-white/5' : 'bg-white/90'} shadow-[0_15px_50px_rgba(15,23,42,0.25)]`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">{title}</p>
        <span className="text-xs text-white/60">{badge}</span>
      </div>
      <p className="text-xs text-white/70 mt-2">{detail}</p>
      <div className="mt-4">
        <button type="button" className="btn-secondary text-xs text-white border border-white/20 px-3 py-1 rounded-xl">
          Start now
        </button>
      </div>
    </div>
  );
}

function ActionChip({ label, detail }) {
  return (
    <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/60">
      <p className="font-semibold text-white">{label}</p>
      <p className="text-[0.65rem] text-white/60">{detail}</p>
    </div>
  );
}
