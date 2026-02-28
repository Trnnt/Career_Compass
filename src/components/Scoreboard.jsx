import React from 'react';
import { formatDateShort } from '../utils/date';
import { useTheme } from '../theme/ThemeProvider';

export default function Scoreboard({ attempts, weeklyAvailable, weekKey, onClear }) {
  const { isDark } = useTheme();
  const total = attempts.length;
  const avg = total ? Math.round(attempts.reduce((s, a) => s + (a.percent || 0), 0) / total) : 0;
  const best = total ? Math.max(...attempts.map((a) => a.percent || 0)) : 0;
  const last = total ? attempts[attempts.length - 1] : null;

  return (
    <div
      className={`rounded-3xl border ${
        isDark ? 'border-white/10 bg-white/5 text-white' : 'border-slate-200 bg-white/95 text-slate-900'
      } shadow-[0_30px_80px_rgba(15,23,42,0.2)] overflow-hidden`}
    >
      <div className={`px-6 py-5 flex items-center justify-between gap-4 ${isDark ? 'border-b border-white/10' : 'border-b border-slate-200'}`}>
        <div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Marks & score</h3>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
            Your attempts are saved locally in this browser.
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white/10 text-white/80 border border-white/10 hover:bg-white/20' : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'} transition`}
        >
          Reset data
        </button>
      </div>

      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Attempts" value={String(total)} isDark={isDark} />
        <Stat label="Average score" value={`${avg}%`} isDark={isDark} />
        <Stat label="Best score" value={`${best}%`} isDark={isDark} />
        <Stat label="Latest" value={last ? `${last.percent}% · ${formatDateShort(last.dateISO)}` : '—'} isDark={isDark} />
      </div>

      <div className="px-6 pb-6">
        <div
          className={`rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
            isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div>
            <p className={`${isDark ? 'text-white' : 'text-slate-900'} font-medium`}>Weekly test</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
              Week: <span className={`font-semibold ${isDark ? 'text-white/70' : 'text-slate-700'}`}>{weekKey}</span>
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              weeklyAvailable
                ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20'
                : 'bg-white/5 text-white/60 border-white/10'
            }`}
          >
            {weeklyAvailable ? 'Available now' : 'Completed this week'}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, isDark }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDark ? 'border-white/10 bg-black/20 text-white' : 'border-slate-200 bg-white/90 text-slate-900'
      }`}
    >
      <p className={`${isDark ? 'text-white/50' : 'text-slate-500'} text-xs`}>{label}</p>
      <p className={`text-xl font-semibold mt-1 tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  );
}
