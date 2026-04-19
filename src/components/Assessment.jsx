import React, { useState } from 'react';
import {
  APTITUDE_QUESTIONS,
  getStreamsForGrade,
  INTERESTS,
} from '../data/careers';

const STEPS = ['profile', 'interest'];

export default function Assessment({ initialProfile, onSubmit, isLoading }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(
    initialProfile || {
      name: '',
      grade: '12',
      stream: 'PCM',
      interest: 'tech',
    }
  );

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLast) {
      setStepIndex((current) => current + 1);
      return;
    }

    onSubmit({
      profile: form,
      aptitudeAnswers: APTITUDE_QUESTIONS.map(() => 3),
    });
  };

  const goBack = () => setStepIndex((current) => Math.max(0, current - 1));

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-2">
        <div className="flex gap-1 flex-1">
          {STEPS.map((currentStep, index) => (
            <div
              key={currentStep}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= stepIndex ? 'bg-indigo-500' : 'bg-white/20'
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
              Tell us your current stage so we can build your personalized test.
            </p>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Your name
              </label>
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
              <label className="block text-sm font-medium text-white/80 mb-1">
                Current / last grade
              </label>
              <select
                value={form.grade}
                onChange={(e) => {
                  const grade = e.target.value;
                  const options = getStreamsForGrade(grade);
                  const nextStream = options[0]?.value || 'PCM';
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
              <label className="block text-sm font-medium text-white/80 mb-1">
                Stream
              </label>
              <select
                value={form.stream}
                onChange={(e) => setForm({ ...form, stream: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:border-indigo-400 outline-none transition"
              >
                {getStreamsForGrade(form.grade).map((streamOption) => (
                  <option key={streamOption.value} value={streamOption.value}>
                    {streamOption.label}
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
              We will add 10 extra questions from your selected interest area.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTERESTS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                    form.interest === option.value
                      ? 'border-indigo-400 bg-indigo-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="interest"
                    value={option.value}
                    checked={form.interest === option.value}
                    onChange={(e) => setForm({ ...form, interest: e.target.value })}
                    className="sr-only"
                  />
                  <span className="text-white font-medium">{option.label}</span>
                </label>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              Your test will contain 40 questions:
              <div className="mt-2 text-white/90 font-medium">
                30 from grade + stream, and 10 from your interest area.
              </div>
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
              ? 'Preparing test...'
              : isLast
                ? 'Start personalized test'
                : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
