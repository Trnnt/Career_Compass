import React, { useState } from 'react';
import {
  getStreamsForGrade,
  INTERESTS,
  APTITUDE_QUESTIONS,
} from '../data/careers';

const STEPS = ['profile', 'interest', 'aptitude', 'submit'];

const Assessment = ({ onSubmit, isLoading }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState({
    name: '',
    grade: '12',
    stream: 'science',
    interest: 'tech',
  });
  const [aptitudeAnswers, setAptitudeAnswers] = useState(
    APTITUDE_QUESTIONS.map(() => 3)
  );

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const setAptitude = (index, value) => {
    setAptitudeAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    onSubmit({
      profile: form,
      aptitudeAnswers,
    });
  };

  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? 'bg-indigo-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-white/70">
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'profile' && (
          <div className="space-y-4 animate-fade">
            <h2 className="text-xl font-semibold text-white">Academic profile</h2>
            <p className="text-white/70 text-sm">
              Tell us your current stage so we can tailor recommendations.
            </p>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Your name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Priya"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Current / last grade</label>
              <select
                value={form.grade}
                onChange={(e) => {
                  const grade = e.target.value;
                  const options = getStreamsForGrade(grade);
                  const nextStream = options[0]?.value || 'science';
                  setForm((prev) => ({ ...prev, grade, stream: nextStream }));
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-indigo-400 outline-none transition"
              >
                <option value="10">Class 10 (completed / pursuing)</option>
                <option value="12">Class 12 (completed / pursuing)</option>
                <option value="grad">Graduation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Stream</label>
              <select
                value={form.stream}
                onChange={(e) => setForm({ ...form, stream: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-indigo-400 outline-none transition"
              >
                {getStreamsForGrade(form.grade).map((s, idx) => (
                  <option key={`${s.value}-${idx}`} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 'interest' && (
          <div className="space-y-4 animate-fade">
            <h2 className="text-xl font-semibold text-white">Area of interest</h2>
            <p className="text-white/70 text-sm">
              Which field excites you most? This drives career suggestions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTERESTS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    form.interest === opt.value
                      ? 'border-indigo-400 bg-indigo-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="interest"
                    value={opt.value}
                    checked={form.interest === opt.value}
                    onChange={(e) => setForm({ ...form, interest: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-white font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 'aptitude' && (
          <div className="space-y-6 animate-fade">
            <h2 className="text-xl font-semibold text-white">Quick aptitude check</h2>
            <p className="text-white/70 text-sm">
              Rate how much each statement describes you (1 = disagree, 5 = strongly agree).
            </p>
            <div className="space-y-5">
              {APTITUDE_QUESTIONS.map((q, i) => (
                <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white font-medium mb-3">{q.text}</p>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setAptitude(i, n)}
                        className={`w-10 h-10 rounded-lg font-semibold transition ${
                          aptitudeAnswers[i] === n
                            ? 'bg-indigo-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'submit' && (
          <div className="space-y-4 animate-fade text-center">
            <h2 className="text-xl font-semibold text-white">Ready to see your path</h2>
            <p className="text-white/70 text-sm">
              We’ll use your profile, interest, and aptitude to suggest up to 3 careers with roadmaps and resources.
            </p>
            <div className="pt-4">
              <p className="text-white/60 text-sm">
                {form.name} · {getStreamsForGrade(form.grade).find((s) => s.value === form.stream)?.label} ·{' '}
                {INTERESTS.find((i) => i.value === form.interest)?.label}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!isFirst && (
            <button
              type="button"
              onClick={goBack}
              className="px-5 py-2.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-5 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-60 transition"
          >
            {isLoading
              ? 'Analyzing...'
              : isLast
                ? 'Get my career recommendations'
                : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Assessment;
