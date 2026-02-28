import React from 'react';
import Roadmap from './Roadmap';
import { buildExamDrivenLearningPlan } from '../data/careers';

const Dashboard = ({ recommendations, selectedCareerId, profile, examAttempt, onCompare, onStartOver }) => {
  const selected = recommendations.find((r) => r.id === selectedCareerId);
  const primary = selected || recommendations[0];
  const others = recommendations.filter((r) => r.id !== primary?.id);

  if (!primary) {
    return (
      <div className="text-center text-white/80 py-12">
        <p>No recommendations yet. Complete the assessment first.</p>
        <button
          onClick={onStartOver}
          className="mt-4 px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600"
        >
          Start assessment
        </button>
      </div>
    );
  }

  const learningHub = primary.learningHub;
  const examPlan = buildExamDrivenLearningPlan(primary, examAttempt);

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Hello, {profile.name}!</h2>
        <p className="text-white/70 mt-1">
          Based on your interest in <strong className="text-white">{INTEREST_LABEL(profile.interest)}</strong> and
          your academic profile, here are your top career matches.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Top match</span>
          <span className="text-2xl font-bold text-indigo-400">{primary.matchPercentage}% match</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{primary.name}</h3>
        <p className="text-white/80 mb-4">{primary.description}</p>
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-sm">{primary.difficulty}</span>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Key skills to develop</h4>
          <ul className="flex flex-wrap gap-2">
            {primary.skills.map((skill, i) => (
              <li key={i} className="px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-200 text-sm">
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <Roadmap steps={primary.steps} />

        <div className="mt-6">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-2">Learning resources</h4>
          <ul className="space-y-2">
            {primary.resources.map((r, i) => (
              <li key={i}>
                {r.url && r.url !== '#' ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:underline"
                  >
                    {r.name}
                  </a>
                ) : (
                  <span className="text-primary">{r.name}</span>
                )}
                <span className="text-white/50 text-sm ml-2">({r.type})</span>
              </li>
            ))}
          </ul>
        </div>

        {!examAttempt ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Course unlock</h4>
            <p className="text-white/70 mt-2">
              Take an exam first. After you submit the test, we will choose courses and video links based on your score.
            </p>
          </div>
        ) : null}

        {learningHub && examPlan ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 space-y-5">
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Smart course plan</h4>
              <p className="text-white/70 mt-2">{learningHub.title}</p>
              <p className="text-white/60 text-sm mt-1">Target outcome: {learningHub.outcome}</p>
              <p className="text-white/60 text-sm mt-1">
                Last exam score: <span className="text-white font-semibold">{examPlan.score}%</span> ({examPlan.attemptType})
              </p>
              <p className="text-white/60 text-sm mt-1">
                Recommended level: <span className="text-white font-semibold">{examPlan.label}</span>
              </p>
              <p className="text-white/60 text-sm mt-1">Why this level: {examPlan.goal}</p>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">8-week study flow</h5>
              <ul className="space-y-2">
                {learningHub.weeklyPlan.map((step, idx) => (
                  <li key={idx} className="text-sm text-white/80">
                    {idx + 1}. {step}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Exam-based courses and videos</h5>
              <ul className="space-y-2">
                {examPlan.courses.map((course, idx) => (
                  <li key={idx}>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline"
                    >
                      {course.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {learningHub?.videos?.length ? (
              <div>
                <h5 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">More video resources</h5>
                <ul className="space-y-2">
                  {learningHub.videos.map((video, idx) => (
                    <li key={idx}>
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-link hover:underline"
                      >
                        {video.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm text-white/70">
                Come back every week to take a test, improve weak topics, and unlock better recommendations.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {others.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h4 className="text-lg font-semibold text-white mb-3">Other strong matches</h4>
          <ul className="space-y-3 mb-4">
            {others.map((rec) => (
              <li
                key={rec.id}
                className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <span className="font-semibold text-white">{rec.name}</span>
                  <span className="text-white/60 text-sm ml-2">{rec.matchPercentage}% match</span>
                </div>
                <span className="text-white/50 text-sm">{rec.difficulty}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onCompare}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-indigo-400 text-indigo-400 font-semibold hover:bg-indigo-500/20 transition"
          >
            Compare careers side by side
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartOver}
          className="px-5 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 border border-white/20 transition"
        >
          Take assessment again
        </button>
      </div>
    </div>
  );
};

function INTEREST_LABEL(value) {
  const map = {
    tech: 'Technology & Coding',
    design: 'Creative Arts & Design',
    business: 'Management & Business',
    health: 'Healthcare & Research',
    law: 'Law & Governance',
  };
  return map[value] || value;
}

export default Dashboard;
