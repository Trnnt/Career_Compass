import React, { useState, useEffect, useRef } from 'react';
import Roadmap from './Roadmap';

/* ─────────────────────────────────────────────
   Inline CSS — preserves original indigo/dark
   theme; adds 3-D animated background + polish
   ───────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');

  .ccp-root {
    font-family: 'Raleway', sans-serif;
    position: relative;
    overflow: hidden;
    min-height: 400px;
  }

  /* ══════════════════════════════════════════
     3-D ANIMATED BACKGROUND
  ══════════════════════════════════════════ */

  .ccp-bg {
    position: absolute; inset: 0; z-index: 0;
    pointer-events: none; overflow: hidden;
    border-radius: inherit;
  }

  /* base radial gradient mesh */
  .ccp-bg-base {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 20% 10%, rgba(99,102,241,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%);
    animation: ccpBasePulse 10s ease-in-out infinite alternate;
  }
  @keyframes ccpBasePulse {
    0%  { opacity: .7; transform: scale(1); }
    100%{ opacity: 1;  transform: scale(1.04); }
  }

  /* 3-D perspective grid — feels like a plane receding into depth */
  .ccp-grid-3d {
    position: absolute; inset: -40%; z-index: 0;
    background-image:
      linear-gradient(rgba(99,102,241,0.18) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.18) 1px, transparent 1px);
    background-size: 52px 52px;
    transform: perspective(600px) rotateX(52deg) translateY(0px);
    animation: ccpGridMove 14s linear infinite;
    mask-image: radial-gradient(ellipse 90% 70% at 50% 40%,
      black 30%, transparent 80%);
  }
  @keyframes ccpGridMove {
    from { background-position: 0 0, 0 0; }
    to   { background-position: 52px 52px, 52px 52px; }
  }

  /* floating 3-D orbs with multi-keyframe paths */
  .ccp-orb {
    position: absolute; border-radius: 50%;
    filter: blur(var(--blur, 80px));
    animation: ccpOrbFloat var(--dur, 18s) ease-in-out infinite alternate;
  }
  @keyframes ccpOrbFloat {
    0%  { transform: translate3d(0,0,0) scale(1); }
    33% { transform: translate3d(var(--x1,20px),var(--y1,-30px),0) scale(var(--s1,1.05)); }
    66% { transform: translate3d(var(--x2,-15px),var(--y2,20px),0) scale(var(--s2,0.95)); }
    100%{ transform: translate3d(var(--x3,10px),var(--y3,-10px),0) scale(var(--s3,1.10)); }
  }

  /* twinkling star-particles */
  .ccp-stars {
    position: absolute; inset: 0;
    background-image:
      radial-gradient(1px 1px at 15% 25%, rgba(199,210,254,0.55) 0%, transparent 100%),
      radial-gradient(1px 1px at 72% 15%, rgba(199,210,254,0.40) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 40% 70%, rgba(199,210,254,0.60) 0%, transparent 100%),
      radial-gradient(1px 1px at 88% 55%, rgba(199,210,254,0.35) 0%, transparent 100%),
      radial-gradient(1px 1px at 5%  80%, rgba(199,210,254,0.45) 0%, transparent 100%),
      radial-gradient(1.5px 1.5px at 62% 42%, rgba(199,210,254,0.50) 0%, transparent 100%),
      radial-gradient(1px 1px at 30% 90%, rgba(199,210,254,0.30) 0%, transparent 100%),
      radial-gradient(1px 1px at 95% 8%, rgba(199,210,254,0.40) 0%, transparent 100%);
    animation: ccpStarsTwinkle 6s ease-in-out infinite alternate;
  }
  @keyframes ccpStarsTwinkle {
    0%  { opacity: .4; }
    50% { opacity: 1; }
    100%{ opacity: .5; }
  }

  /* shooting light beams */
  .ccp-beam {
    position: absolute; left: -40%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99,102,241,0.7), transparent);
    transform: rotate(-18deg);
    filter: blur(1px);
    animation: ccpBeam var(--bdur, 7s) ease-in-out infinite;
    animation-delay: var(--bdelay, 0s);
    width: var(--bw, 45%);
  }
  @keyframes ccpBeam {
    0%  { left: -45%; opacity: 0; }
    8%  { opacity: 1; }
    65% { opacity: .5; }
    100%{ left: 120%;  opacity: 0; }
  }

  /* rotating hex wireframes */
  .ccp-hex {
    position: absolute;
    width: var(--sz, 60px); height: var(--sz, 60px);
    clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
    background: rgba(99,102,241, var(--op, 0.04));
    border: 1px solid rgba(99,102,241, var(--bop, 0.09));
    animation:
      ccpHexFloat var(--dur, 20s) ease-in-out infinite alternate,
      ccpHexSpin  var(--sdur, 30s) linear infinite;
  }
  @keyframes ccpHexFloat {
    0%  { transform: translateY(0) rotate(0deg); }
    100%{ transform: translateY(var(--ty, -30px)) rotate(15deg); }
  }
  @keyframes ccpHexSpin {
    from{ transform: rotate(0deg); }
    to  { transform: rotate(360deg); }
  }

  /* ══════════════════════════════════════════
     LAYOUT & COMPONENTS
  ══════════════════════════════════════════ */
  .ccp-inner {
    position: relative; z-index: 1;
    max-width: 72rem; margin: 0 auto;
  }

  /* header */
  .ccp-header {
    display: flex; flex-wrap: wrap;
    align-items: center; justify-content: space-between;
    gap: 16px; margin-bottom: 28px;
  }
  .ccp-title {
    font-size: 1.5rem; font-weight: 700;
    color: #fff; letter-spacing: -0.02em;
    display: flex; align-items: center; gap: 10px;
  }
  .ccp-title-badge {
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase;
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.35);
    color: #a5b4fc; padding: 3px 10px; border-radius: 40px;
  }

  .ccp-back-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 12px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.8);
    font-size: 0.84rem; font-weight: 500;
    font-family: 'Raleway', sans-serif; cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(8px);
  }
  .ccp-back-btn:hover {
    background: rgba(255,255,255,0.13);
    border-color: rgba(255,255,255,0.25);
    color: #fff; transform: translateX(-2px);
  }

  /* cards grid */
  .ccp-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  @media (max-width: 768px) { .ccp-grid { grid-template-columns: 1fr; } }

  /* card */
  .ccp-card {
    position: relative; overflow: hidden;
    border-radius: 18px; height: 100%; display: flex; flex-direction: column;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(16px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    animation: ccpCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
  }
  .ccp-card:nth-child(1){ animation-delay: 0.05s; }
  .ccp-card:nth-child(2){ animation-delay: 0.16s; }
  @keyframes ccpCardIn {
    from { opacity: 0; transform: translateY(22px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .ccp-card:hover {
    border-color: rgba(99,102,241,0.4);
    box-shadow: 0 14px 50px rgba(99,102,241,0.15), 0 0 0 1px rgba(99,102,241,0.12);
    transform: translateY(-4px);
  }
  /* inner glow on hover */
  .ccp-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(99,102,241,0.1), transparent 60%);
    opacity: 0; transition: opacity 0.3s; pointer-events: none; z-index: 0;
  }
  .ccp-card:hover::before { opacity: 1; }

  /* accent top stripe */
  .ccp-card-stripe {
    height: 2px;
    background: linear-gradient(90deg, rgba(99,102,241,0.8), rgba(139,92,246,0.6), transparent);
  }

  .ccp-card-body { padding: 22px 24px; position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }

  /* card header row */
  .ccp-card-head {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px; margin-bottom: 12px;
  }
  .ccp-card-name {
    font-size: 1.08rem; font-weight: 700; color: #fff; line-height: 1.25; flex: 1;
  }
  .ccp-match-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 40px; flex-shrink: 0;
    font-size: 0.78rem; font-weight: 700;
    background: rgba(99,102,241,0.18);
    border: 1px solid rgba(99,102,241,0.35);
    color: #a5b4fc;
    box-shadow: 0 0 14px rgba(99,102,241,0.18);
  }
  .ccp-match-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #818cf8; box-shadow: 0 0 6px #818cf8;
    animation: ccpBlink 2s ease-in-out infinite;
  }
  @keyframes ccpBlink { 0%,100%{opacity:1} 50%{opacity:.3} }

  /* match progress bar */
  .ccp-bar-wrap { margin-bottom: 14px; }
  .ccp-bar-track {
    height: 4px; background: rgba(255,255,255,0.08);
    border-radius: 40px; overflow: hidden;
  }
  .ccp-bar-fill {
    height: 100%; border-radius: 40px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    box-shadow: 0 0 10px rgba(99,102,241,0.5);
    transition: width 1.1s cubic-bezier(0.16,1,0.3,1);
  }

  /* description */
  .ccp-desc {
    font-size: 0.845rem; color: rgba(255,255,255,0.65);
    line-height: 1.7; margin-bottom: 14px; flex: 1;
  }

  /* difficulty chip */
  .ccp-diff {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    font-size: 0.75rem; color: rgba(255,255,255,0.5);
    margin-bottom: 18px;
  }
  .ccp-diff strong { color: rgba(255,255,255,0.75); font-weight: 600; }

  /* section label */
  .ccp-sec-label {
    font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(255,255,255,0.35);
    display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
  }
  .ccp-sec-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.07); }

  /* skills */
  .ccp-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px; }
  .ccp-skill {
    padding: 4px 11px; border-radius: 6px;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.25);
    color: #c7d2fe; font-size: 0.75rem; font-weight: 500;
    transition: all 0.15s; list-style: none;
  }
  .ccp-skill:hover {
    background: rgba(99,102,241,0.28); border-color: rgba(99,102,241,0.5);
    transform: translateY(-1px);
  }

  /* roadmap container */
  .ccp-roadmap {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 14px;
  }

  /* footer hint */
  .ccp-hint {
    margin-top: 20px; padding: 14px 18px; border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex; align-items: center; gap: 10px;
    backdrop-filter: blur(8px);
    animation: ccpCardIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both;
  }
  .ccp-hint-icon { font-size: 1rem; flex-shrink: 0; }
  .ccp-hint-text { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.55; }
  .ccp-hint-text strong { color: #a5b4fc; font-weight: 600; }

  /* empty state */
  .ccp-empty {
    text-align: center; padding: 60px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .ccp-empty-icon {
    width: 60px; height: 60px; border-radius: 50%;
    border: 1px dashed rgba(99,102,241,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem;
    animation: ccpEmptySpin 15s linear infinite;
  }
  @keyframes ccpEmptySpin { to { transform: rotate(360deg); } }
  .ccp-empty p { font-size: 0.88rem; color: rgba(255,255,255,0.5); max-width: 260px; }
  .ccp-empty-btn {
    padding: 10px 22px; border-radius: 12px;
    background: rgba(99,102,241,0.25);
    border: 1px solid rgba(99,102,241,0.4);
    color: #c7d2fe; font-size: 0.85rem; font-weight: 500;
    font-family: 'Raleway', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .ccp-empty-btn:hover { background: rgba(99,102,241,0.38); }
`;

/* ─────────────────────────────────────────────
   AnimatedBackground
   ───────────────────────────────────────────── */
function AnimatedBackground() {
  return (
    <div className="ccp-bg">
      <div className="ccp-bg-base" />
      <div className="ccp-grid-3d" />
      <div className="ccp-stars" />

      {/* Orb 1 — large, top-left */}
      <div className="ccp-orb" style={{
        width: 480, height: 480, top: '-15%', left: '-12%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)',
        '--blur': '90px', '--dur': '20s',
        '--x1': '40px',  '--y1': '-30px', '--s1': '1.08',
        '--x2': '-20px', '--y2': '25px',  '--s2': '0.94',
        '--x3': '15px',  '--y3': '-15px', '--s3': '1.12',
      }} />

      {/* Orb 2 — medium, bottom-right */}
      <div className="ccp-orb" style={{
        width: 360, height: 360, bottom: '-10%', right: '-8%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)',
        '--blur': '80px', '--dur': '25s',
        '--x1': '-30px', '--y1': '-40px', '--s1': '1.06',
        '--x2': '20px',  '--y2': '15px',  '--s2': '0.96',
        '--x3': '-10px', '--y3': '-20px', '--s3': '1.04',
      }} />

      {/* Orb 3 — small, center */}
      <div className="ccp-orb" style={{
        width: 220, height: 220, top: '40%', left: '45%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.09), transparent 70%)',
        '--blur': '60px', '--dur': '16s',
        '--x1': '25px',  '--y1': '20px',  '--s1': '1.15',
        '--x2': '-10px', '--y2': '-25px', '--s2': '0.90',
        '--x3': '20px',  '--y3': '10px',  '--s3': '1.05',
      }} />

      {/* Shooting beams */}
      <div className="ccp-beam" style={{ '--bdelay': '0s',   top: '18%', '--bw': '45%', '--bdur': '7s'  }} />
      <div className="ccp-beam" style={{ '--bdelay': '3.5s', top: '55%', '--bw': '35%', '--bdur': '9s'  }} />
      <div className="ccp-beam" style={{ '--bdelay': '6.2s', top: '80%', '--bw': '28%', '--bdur': '11s' }} />

      {/* Floating hex shapes */}
      <div className="ccp-hex" style={{
        '--sz': '68px', '--op': '0.05', '--bop': '0.09',
        top: '10%', right: '7%', '--dur': '22s', '--ty': '-28px', '--sdur': '36s',
      }} />
      <div className="ccp-hex" style={{
        '--sz': '42px', '--op': '0.04', '--bop': '0.07',
        bottom: '14%', left: '5%', '--dur': '18s', '--ty': '-18px', '--sdur': '28s',
      }} />
      <div className="ccp-hex" style={{
        '--sz': '28px', '--op': '0.05', '--bop': '0.08',
        top: '58%', right: '23%', '--dur': '14s', '--ty': '-12px', '--sdur': '22s',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   MatchBar — animated on mount
   ───────────────────────────────────────────── */
function MatchBar({ pct }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="ccp-bar-wrap">
      <div className="ccp-bar-track">
        <div className="ccp-bar-fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CompareCard
   ───────────────────────────────────────────── */
function CompareCard({ career }) {
  const pct  = career.matchPercentage ?? career.match ?? 0;
  const name = career.name || career.title || 'Career';

  return (
    <div className="ccp-card">
      <div className="ccp-card-stripe" />
      <div className="ccp-card-body">

        <div className="ccp-card-head">
          <h3 className="ccp-card-name">{name}</h3>
          <span className="ccp-match-pill">
            <span className="ccp-match-dot" />
            {pct}% match
          </span>
        </div>

        <MatchBar pct={pct} />

        {career.description && <p className="ccp-desc">{career.description}</p>}

        {career.difficulty && (
          <div className="ccp-diff">
            📊&nbsp;Difficulty:&nbsp;<strong>{career.difficulty}</strong>
          </div>
        )}

        {career.skills?.length > 0 && (
          <>
            <div className="ccp-sec-label">Skills</div>
            <ul className="ccp-skills">
              {career.skills.map((s, i) => (
                <li key={i} className="ccp-skill">{s}</li>
              ))}
            </ul>
          </>
        )}

        {career.steps?.length > 0 && (
          <>
            <div className="ccp-sec-label">Roadmap</div>
            <div className="ccp-roadmap">
              <Roadmap steps={career.steps} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CareerCompare — main export
   ───────────────────────────────────────────── */
const CareerCompare = ({ recommendations = [], onBack, onClose }) => {
  const handleBack = onBack || onClose || (() => {});
  const [a, b] = recommendations.slice(0, 2);

  return (
    <>
      <style>{css}</style>
      <div className="ccp-root">
        <AnimatedBackground />

        <div className="ccp-inner">
          {/* Header */}
          <div className="ccp-header">
            <h2 className="ccp-title">
              Compare careers
              <span className="ccp-title-badge">Side by side</span>
            </h2>
            <button className="ccp-back-btn" onClick={handleBack}>
              ← Back to results
            </button>
          </div>

          {/* Content */}
          {!a || !b ? (
            <div className="ccp-empty">
              <div className="ccp-empty-icon">🔍</div>
              <p>Need at least 2 recommendations to compare. Complete your assessment first.</p>
              <button className="ccp-empty-btn" onClick={handleBack}>Back to results</button>
            </div>
          ) : (
            <>
              <div className="ccp-grid">
                <CompareCard career={a} />
                <CompareCard career={b} />
              </div>

              <div className="ccp-hint">
                <span className="ccp-hint-icon">💡</span>
                <p className="ccp-hint-text">
                  <strong>Tip:</strong> Use this view to weigh match score, required skills, and roadmap length before choosing your path.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CareerCompare;