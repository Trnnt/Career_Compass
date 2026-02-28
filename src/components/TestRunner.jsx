import React, { useMemo, useState } from 'react';
import { scoreQuiz } from '../utils/scoring';

export default function TestRunner({ title, subtitle, questions, onCancel, onComplete, meta }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => null));

  const current = questions[index];
  const doneCount = answers.filter((a) => a !== null).length;
  const progress = Math.round((doneCount / questions.length) * 100);

  const canNext = answers[index] !== null;
  const isLast = index === questions.length - 1;

  const result = useMemo(() => scoreQuiz({ questions, answers }), [questions, answers]);

  const finish = () => {
    const attempt = {
      id: `${meta?.type || 'test'}_${Date.now()}`,
      type: meta?.type || 'test',
      weekKey: meta?.weekKey || null,
      dateISO: new Date().toISOString(),
      ...result,
    };
    onComplete(attempt);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle ? <p className="text-sm text-white/60 mt-1">{subtitle}</p> : null}
        </div>
        <div className="text-sm text-white/70 tabular-nums">{progress}%</div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>
            Question {index + 1} / {questions.length}
          </span>
          <span>
            Marked: {doneCount}/{questions.length}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <p className="text-white font-medium">{current.prompt}</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map((opt, i) => {
              const selected = answers[index] === i;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[index] = i;
                      return next;
                    })
                  }
                  className={`text-left px-4 py-3 rounded-xl border transition ${
                    selected
                      ? 'border-indigo-400 bg-indigo-500/20 text-white'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 text-white/80'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition"
          >
            Exit
          </button>

          <div className="flex-1" />

          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 transition"
          >
            Back
          </button>

          {!isLast ? (
            <button
              type="button"
              disabled={!canNext}
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-40 transition"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={doneCount !== questions.length}
              onClick={finish}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-40 transition"
            >
              Finish & save score
            </button>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/50">
            Current score (so far): <span className="text-white/70 font-semibold">{result.percent}%</span>
          </p>
        </div>
      </div>
    </div>
  );
}

