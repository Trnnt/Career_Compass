import React, { useState } from 'react';

export default function RaisecTestRunner({ title, subtitle, questions, onCancel, onComplete }) {
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState(() => questions.map(() => null));
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const current = questions[index];
    const doneCount = answers.filter((a) => a !== null).length;
    const progress = Math.round((doneCount / questions.length) * 100);

    const finish = async () => {
        setSubmitError('');
        setSubmitting(true);
        try {
            await onComplete({
                questionIds: questions.map((q) => q.id),
                answers,
            });
        } catch (err) {
            setSubmitError(err?.message || 'Failed to submit the assessment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-w-[1400px] mx-auto min-h-[85vh]">
            {/* Header */}
            <div className="px-10 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="text-[10px] font-bold tracking-[0.2em] text-indigo-300 uppercase mb-2 opacity-80">GUIDED TEST SESSION</div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                    {subtitle && <p className="text-sm text-white/50 mt-2 font-medium">{subtitle}</p>}
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[100px]">
                        <span className="opacity-40 font-semibold uppercase tracking-[0.1em] text-[9px] mb-1">Progress</span>
                        <span className="text-xl font-bold text-white">{progress}%</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[100px]">
                        <span className="opacity-40 font-semibold uppercase tracking-[0.1em] text-[9px] mb-1">Marked</span>
                        <span className="text-xl font-bold text-white">{doneCount}/{questions.length}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[100px]">
                        <span className="opacity-40 font-semibold uppercase tracking-[0.1em] text-[9px] mb-1">Current</span>
                        <span className="text-xl font-bold text-white">Q{index + 1}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 p-8 md:p-10">

                {/* Left Pane - Question Area */}
                <div className="flex flex-col space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-black/20 p-8 md:p-12 flex flex-col relative overflow-hidden">

                        {/* Question Number Badge */}
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-[0.15em]">
                                Question {index + 1} OF {questions.length}
                            </span>
                            {/* Visual pill mapped from screenshot */}
                            <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-[10px] uppercase font-bold tracking-wider">
                                Backend score after submit
                            </span>
                        </div>

                        {/* Prompt */}
                        <h3 className="text-xl md:text-2xl text-[var(--color-text-primary)] font-medium leading-relaxed mb-10 max-w-4xl">
                            {current?.prompt || current?.text}
                        </h3>

                        {/* Options Stack */}
                        <div className="space-y-4 max-w-4xl mb-4">
                            {['A', 'B', 'C', 'D'].map((letter, i) => {
                                const optText = current?.options ? current.options[i] : `Option ${letter}`;
                                if (!optText) return null;

                                const selected = answers[index] === i;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        disabled={submitting}
                                        onClick={() => {
                                            setAnswers(prev => {
                                                const next = [...prev];
                                                next[index] = i;
                                                return next;
                                            });
                                        }}
                                        className={`w-full flex items-center p-5 rounded-2xl outline-none transition-all duration-300 text-left ${selected
                                            ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_8px_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50'
                                            : 'bg-white/[.08] hover:bg-white/[.12] border-white/10 hover:border-white/20'
                                            } border`}
                                    >
                                        <div className={`flex-shrink-0 w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-bold mr-6 transition-colors duration-300 ${selected ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-white/10 text-[var(--color-text-muted)]'
                                            }`}>
                                            {letter}
                                        </div>
                                        <span className={`text-base font-medium transition-colors duration-300 ${selected ? 'text-indigo-700 dark:text-indigo-100' : 'text-[var(--color-text-primary)]'}`}>
                                            {optText}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Action Buttons (Bottom of left pane) */}
                        <div className="flex items-center justify-between pt-6 border-t border-white/[0.06]">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={submitting}
                                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-all font-semibold text-sm"
                            >
                                Exit
                            </button>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    disabled={index === 0 || submitting}
                                    onClick={() => setIndex(i => Math.max(0, i - 1))}
                                    className="px-8 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 transition-all font-semibold text-sm disabled:opacity-30"
                                >
                                    Back
                                </button>

                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={() => {
                                        if (index < questions.length - 1) {
                                            setIndex(i => i + 1);
                                        }
                                    }}
                                    className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm transition-all shadow-[0_8px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
                                >
                                    Next question
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Pane - Question Map */}
                <div className="flex flex-col space-y-6">
                    <div className="rounded-[2rem] border border-white/5 bg-black/20 p-8 flex flex-col h-full">
                        <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.15em] mb-7">Question Map</h4>

                        {/* Grid - EXACTLY like screenshot mappings */}
                        <div className="grid grid-cols-5 gap-3 mb-10 flex-1 content-start">
                            {questions.map((_, i) => {
                                const isCurrent = i === index;
                                const isAnswered = answers[i] !== null;

                                let stateStyle = "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"; // Default Unanswered
                                if (isCurrent) {
                                    stateStyle = "bg-[#2563eb] text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] transform scale-[1.05] z-10 border-transparent font-bold";
                                } else if (isAnswered) {
                                    stateStyle = "bg-[#eff6ff] text-[#1e40af] border-transparent font-bold cursor-pointer hover:bg-blue-100";
                                }

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setIndex(i)}
                                        className={`aspect-square w-full flex items-center justify-center rounded-2xl text-[13px] transition-all duration-300 ${stateStyle}`}
                                    >
                                        {i + 1}
                                    </button>
                                )
                            })}
                        </div>

                        <div className="mt-auto space-y-8">
                            {/* Legend */}
                            <div className="space-y-4 px-2 text-xs font-medium text-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]"></div>
                                    <span>Current question</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#eff6ff]"></div>
                                    <span>Answered question</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/10"></div>
                                    <span>Unanswered question</span>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div className="p-5 rounded-2xl bg-white/5 border border-white/[0.03]">
                                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Session Note</h4>
                                <p className="text-xs text-white/40 leading-relaxed">
                                    This assessment mixes 30 academic questions from your selected grade and stream with 10 questions from your interest area.
                                </p>
                            </div>

                            {/* Submit Button (Only active when all are answered) */}
                            <div>
                                <button
                                    type="button"
                                    onClick={finish}
                                    disabled={doneCount !== questions.length || submitting}
                                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] disabled:opacity-20 disabled:shadow-none"
                                >
                                    {submitting ? 'Submitting to Backend...' : doneCount !== questions.length ? `Complete ${questions.length - doneCount} more` : 'Submit Assessment'}
                                </button>
                                {submitError && (
                                    <p className="text-red-400 text-xs text-center mt-3 font-medium">{submitError}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
