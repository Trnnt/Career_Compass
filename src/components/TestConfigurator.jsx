import React, { useState } from 'react';

const MODES = [
    { id: 'EASY', label: 'Easy Mode', desc: 'A gentle introduction to explore your basic interests and preferences.', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-400' },
    { id: 'MEDIUM', label: 'Medium Mode', desc: 'Standard assessment with a mix of everyday scenarios and moderate challenges.', color: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 hover:border-indigo-400' },
    { id: 'HARD', label: 'Hard Mode', desc: 'Complex, advanced scenarios requiring deep thought and specific domain knowledge.', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-400' },
    { id: 'TOUGH', label: 'Tough Mode', desc: 'The ultimate test! A gauntlet of Easy, Medium, Hard, and exclusive Tough questions designed to truly test your limits.', color: 'from-orange-500/20 to-red-600/20 border-red-500/30 hover:border-red-400' }
];

export default function TestConfigurator({ onStart, onCancel }) {
    const [selectedDifficulty, setSelectedDifficulty] = useState('MEDIUM');

    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden max-w-2xl w-full mx-auto">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white font-['Syne']">Select Difficulty Mode</h3>
                    <p className="text-sm text-white/60 mt-1">
                        Questions are strictly personalized to your specific Academic Stream to prevent repetition!
                    </p>
                </div>
                <button type="button" onClick={onCancel} className="text-white/40 hover:text-white transition">
                    ✕
                </button>
            </div>

            <div className="p-6 md:p-8 space-y-4">
                {MODES.map((mode) => {
                    const isActive = selectedDifficulty === mode.id;
                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => setSelectedDifficulty(mode.id)}
                            className={`w-full flex items-start text-left p-5 rounded-2xl border transition-all duration-300 bg-gradient-to-br
                ${isActive ? mode.color + ' scale-[1.02] shadow-xl' : 'from-white/5 to-transparent border-white/10 opacity-70 hover:opacity-100'}
              `}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-white' : 'border-white/30'}`}>
                                        {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <h4 className={`text-lg font-bold ${isActive ? 'text-white' : 'text-white/80'}`}>{mode.label}</h4>
                                </div>
                                <p className="mt-2 text-sm text-white/60 pl-7 leading-relaxed">
                                    {mode.desc}
                                </p>
                            </div>
                        </button>
                    )
                })}

                <div className="pt-6 flex gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl border border-white/10 text-white hover:bg-white/5 font-semibold transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onStart(selectedDifficulty)}
                        className="flex-[2] py-3.5 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                    >
                        Begin Assessment
                    </button>
                </div>
            </div>
        </div>
    );
}
