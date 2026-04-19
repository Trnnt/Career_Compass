import React, { useEffect, useMemo, useState, useRef } from 'react';
import Assessment from '../components/Assessment';
import CareerCompare from '../components/CareerCompare';
import Dashboard from '../components/Dashboard';
import Scoreboard from '../components/Scoreboard';
import TestRunner from '../components/TestRunner';
import RaisecTestRunner from '../components/RaisecTestRunner';
import { buildAptitudeScores, getRecommendations, getStreamsForGrade, INTERESTS } from '../data/careers';
import { TEST_BANK, TEST_CATALOG } from '../data/tests';
import { getWeekKey } from '../utils/date';
import { seededShuffle } from '../utils/random';
import { buildTraitSignalsFromAttempts, buildTraitSignalsFromRaisecScores, canTakeWeeklyTest } from '../utils/scoring';
import { clearAppState, loadAppState, saveAppState } from '../utils/storage';
import { useAuth } from '../auth/AuthProvider';

/* ─────────────────────────────────────────────
   CSS
   ───────────────────────────────────────────── */
const BG_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');

  .hbg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
  .hbg-mesh {
    position:absolute; inset:0;
    background:
      radial-gradient(ellipse 80% 55% at 15% 10%, rgba(99,102,241,.14) 0%, transparent 60%),
      radial-gradient(ellipse 60% 45% at 85% 80%, rgba(139,92,246,.11) 0%, transparent 60%),
      radial-gradient(ellipse 45% 40% at 50% 50%, rgba(99,102,241,.06) 0%, transparent 70%),
      radial-gradient(ellipse 30% 30% at 75% 20%, rgba(167,139,250,.07) 0%, transparent 60%);
    animation:hbgMesh 12s ease-in-out infinite alternate;
  }
  @keyframes hbgMesh { 0%{opacity:.65;transform:scale(1)} 100%{opacity:1;transform:scale(1.05)} }
  .hbg-grid {
    position:absolute; inset:-50%;
    background-image:linear-gradient(rgba(99,102,241,.16) 1px, transparent 1px),linear-gradient(90deg,rgba(99,102,241,.16) 1px, transparent 1px);
    background-size:56px 56px;
    transform:perspective(700px) rotateX(55deg);
    animation:hbgGrid 18s linear infinite;
    mask-image:radial-gradient(ellipse 90% 65% at 50% 38%, black 25%, transparent 78%);
  }
  @keyframes hbgGrid { from{background-position:0 0,0 0} to{background-position:56px 56px,56px 56px} }
  .hbg-orb { position:absolute; border-radius:50%; filter:blur(var(--b,90px)); animation:hbgOrb var(--d,20s) ease-in-out infinite alternate; }
  @keyframes hbgOrb {
    0%{transform:translate3d(0,0,0) scale(1)} 33%{transform:translate3d(var(--x1,30px),var(--y1,-40px),0) scale(var(--s1,1.07))}
    66%{transform:translate3d(var(--x2,-20px),var(--y2,25px),0) scale(var(--s2,.94))} 100%{transform:translate3d(var(--x3,15px),var(--y3,-15px),0) scale(var(--s3,1.10))}
  }
  .hbg-stars {
    position:absolute; inset:0;
    background-image:
      radial-gradient(1px 1px at 12% 22%,rgba(199,210,254,.55) 0%,transparent 100%),radial-gradient(1px 1px at 68% 14%,rgba(199,210,254,.40) 0%,transparent 100%),
      radial-gradient(1.5px 1.5px at 38% 68%,rgba(199,210,254,.60) 0%,transparent 100%),radial-gradient(1px 1px at 85% 52%,rgba(199,210,254,.35) 0%,transparent 100%),
      radial-gradient(1px 1px at 4% 78%,rgba(199,210,254,.45) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 58% 40%,rgba(199,210,254,.50) 0%,transparent 100%),
      radial-gradient(1px 1px at 28% 88%,rgba(199,210,254,.30) 0%,transparent 100%),radial-gradient(1px 1px at 92% 7%,rgba(199,210,254,.40) 0%,transparent 100%),
      radial-gradient(1px 1px at 47% 30%,rgba(199,210,254,.35) 0%,transparent 100%),radial-gradient(1.5px 1.5px at 76% 62%,rgba(199,210,254,.45) 0%,transparent 100%);
    animation:hbgStars 7s ease-in-out infinite alternate;
  }
  @keyframes hbgStars { 0%{opacity:.35} 50%{opacity:1} 100%{opacity:.45} }
  .hbg-beam { position:absolute; height:1px; left:-45%; width:var(--w,48%); background:linear-gradient(90deg,transparent,rgba(99,102,241,.75),transparent); transform:rotate(-16deg); filter:blur(1px); animation:hbgBeam var(--dur,8s) ease-in-out infinite; animation-delay:var(--dl,0s); }
  @keyframes hbgBeam { 0%{left:-45%;opacity:0} 8%{opacity:1} 70%{opacity:.5} 100%{left:120%;opacity:0} }
  .hbg-hex { position:absolute; width:var(--sz,64px); height:var(--sz,64px); clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0 75%,0 25%); background:rgba(99,102,241,var(--op,.04)); outline:1px solid rgba(99,102,241,var(--bop,.09)); animation:hbgHexFloat var(--fd,22s) ease-in-out infinite alternate,hbgHexSpin var(--sd,32s) linear infinite; }
  @keyframes hbgHexFloat { 0%{transform:translateY(0) rotate(0deg)} 100%{transform:translateY(var(--ty,-32px)) rotate(12deg)} }
  @keyframes hbgHexSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .h-content { position:relative; z-index:1; }
  .animate-slideUp { animation:slideUp .45s cubic-bezier(.16,1,.3,1) both; }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  .fade-stagger > * { animation:fadeSt .5s cubic-bezier(.16,1,.3,1) both; }
  .fade-stagger > *:nth-child(1){ animation-delay:.05s }
  .fade-stagger > *:nth-child(2){ animation-delay:.14s }
  @keyframes fadeSt { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  .pulse-dot { width:6px; height:6px; border-radius:50%; background:#6366f1; box-shadow:0 0 8px #6366f1; display:inline-block; flex-shrink:0; animation:pdBlink 2s ease-in-out infinite; }
  @keyframes pdBlink { 0%,100%{opacity:1} 50%{opacity:.25} }

  .custom-scrollbar::-webkit-scrollbar { height:4px; width:4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background:rgba(255,255,255,.04); }
  .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(99,102,241,.4); border-radius:4px; }

  .field-input:focus { border-color:rgba(99,102,241,.7) !important; box-shadow:0 0 0 3px rgba(99,102,241,.15); outline:none; }

  .btn-primary { box-shadow:0 0 22px rgba(99,102,241,.35); transition:box-shadow .2s,transform .2s,background .2s,opacity .2s; }
  .btn-primary:hover { box-shadow:0 0 36px rgba(99,102,241,.55); transform:translateY(-1px); }
  .btn-primary:active { transform:translateY(0); }
  .btn-secondary { transition:background .2s,border-color .2s; }
  .btn-secondary:hover { background:rgba(255,255,255,.18) !important; border-color:rgba(255,255,255,.25) !important; }

  .hbg-spinner { width:44px; height:44px; border:3px solid rgba(99,102,241,.2); border-top-color:#6366f1; border-radius:50%; animation:hbgHexSpin .8s linear infinite; }
  .avatar-ring { animation:hbgHexSpin 10s linear infinite; }
  .btn-weekly-done { background:rgba(72,187,120,.08) !important; border-color:rgba(72,187,120,.25) !important; color:#68d391 !important; cursor:not-allowed; opacity:.85; }
  .tbl-row:hover td { background:rgba(255,255,255,.025); }

  /* ── Tech News Ticker ── */
  .ticker-wrap { overflow:hidden; mask-image:linear-gradient(90deg,transparent 0%,black 5%,black 95%,transparent 100%); }
  .ticker-track { display:flex; gap:52px; width:max-content; animation:tickerScroll 50s linear infinite; }
  .ticker-track:hover { animation-play-state:paused; }
  @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  .ticker-item { display:inline-flex; align-items:center; gap:8px; white-space:nowrap; font-size:0.77rem; color:rgba(255,255,255,.5); cursor:pointer; transition:color .18s; }
  .ticker-item:hover { color:rgba(199,210,254,.88); }
  .ticker-sep { color:rgba(99,102,241,.4); font-size:0.6rem; }

  /* ── Quick Stats ── */
  .qs-val { font-family:'Raleway',sans-serif; font-size:1.85rem; font-weight:800; line-height:1; }
  @keyframes countIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .count-in { animation:countIn .4s cubic-bezier(.16,1,.3,1) both; }

  /* ── Radar chart ── */
  .radar-lbl { font-size:10px; fill:rgba(199,210,254,.6); font-weight:500; font-family:'Raleway',sans-serif; }

  /* ── Profile Completeness ── */
  .pc-bg  { fill:none; stroke:rgba(255,255,255,.06); }
  .pc-arc { fill:none; stroke-linecap:round; transition:stroke-dashoffset .75s cubic-bezier(.16,1,.3,1); }

  /* ── Roadmap Drawer ── */
  .rm-overlay { position:fixed; inset:0; z-index:500; background:rgba(4,7,16,.6); backdrop-filter:blur(8px); animation:rmFade .22s ease; }
  @keyframes rmFade { from{opacity:0} to{opacity:1} }
  .rm-panel { position:fixed; top:0; right:0; bottom:0; width:min(500px,100vw); z-index:501; background:rgba(7,10,20,.99); border-left:1px solid rgba(99,102,241,.18); box-shadow:-50px 0 140px rgba(0,0,0,.75); display:flex; flex-direction:column; animation:rmSlide .3s cubic-bezier(.16,1,.3,1); overflow:hidden; }
  @keyframes rmSlide { from{transform:translateX(100%)} to{transform:translateX(0)} }
  .rm-body { flex:1; overflow-y:auto; padding:24px 26px 48px; }
  .rm-body::-webkit-scrollbar { width:4px; }
  .rm-body::-webkit-scrollbar-thumb { background:rgba(99,102,241,.3); border-radius:4px; }
  .rm-step { display:flex; gap:14px; position:relative; }
  .rm-step:not(:last-child)::after { content:''; position:absolute; left:14px; top:30px; bottom:-14px; width:1px; background:linear-gradient(to bottom,rgba(99,102,241,.35),rgba(99,102,241,.04)); }
  .rm-num { width:30px; height:30px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-center:center; font-size:0.7rem; font-weight:700; position:relative; z-index:1; }
  .rm-content { padding-bottom:24px; flex:1; min-width:0; }
  .rm-title { font-size:0.86rem; font-weight:600; margin-bottom:4px; }
  .rm-desc  { font-size:0.77rem; line-height:1.58; }
  .rm-btn   { display:inline-flex; align-items:center; gap:5px; margin-top:8px; margin-right:6px; padding:5px 10px; border-radius:7px; font-size:0.71rem; font-weight:500; text-decoration:none; transition:all .18s; }
  .rm-btn:hover { background:rgba(99,102,241,.2); border-color:rgba(99,102,241,.38); color:#c4b5fd; }
`;

/* ── Modes ── */
const MODES = { overview: 'overview', assessment: 'assessment', test: 'test', weekly: 'weekly', compare: 'compare', raisec_test: 'raisec_test' };

/* ── Tech headlines ── */
const HEADLINES = [
  { tag: 'AI', color: '#a78bfa', text: 'GPT-5 ships with multi-modal reasoning chains' },
  { tag: 'Dev', color: '#60a5fa', text: 'Rust overtakes Go in backend microservices adoption' },
  { tag: 'Careers', color: '#34d399', text: 'Data science roles in India surge 38% YoY per NASSCOM' },
  { tag: 'Design', color: '#f472b6', text: 'Figma 2025 adds AI-generated component variants' },
  { tag: 'Web', color: '#4FC3F7', text: 'Next.js 15 ships built-in edge AI inference hooks' },
  { tag: 'Hardware', color: '#fb923c', text: '1000-qubit quantum chip breaks classical simulation barrier' },
  { tag: 'Education', color: '#fbbf24', text: 'IIT 2025 placements: average CTC crosses ₹32 LPA' },
  { tag: 'AI', color: '#a78bfa', text: 'DeepMind AlphaCode 3 solves competitive programming at expert level' },
  { tag: 'Careers', color: '#34d399', text: 'UX salaries hit ₹24 LPA median in top 4 Indian cities' },
  { tag: 'Dev', color: '#60a5fa', text: 'GitHub Copilot now supports 80+ languages and IDEs' },
  { tag: 'Web', color: '#4FC3F7', text: 'Web Assembly 3.0 brings direct DOM access to browsers' },
  { tag: 'Education', color: '#fbbf24', text: 'NPTEL certifications accepted by 800+ employers across India' },
];

/* ── Career roadmaps ── */
const ROADMAPS = {
  default: [
    { title: 'Strengthen core fundamentals', desc: 'Build a strong base in math, logic, and English communication — these underpin every tech career path.', yt: 'basics of programming and mathematics for beginners', g: 'how to build strong academic fundamentals' },
    { title: 'Pick one specialisation', desc: 'Choose one domain: software engineering, data science, design, business, or product. Focus beats breadth in the early years.', yt: 'how to choose a tech career path', g: 'career paths after 12th for science students' },
    { title: 'Complete a structured course', desc: 'Finish one end-to-end online course with certificate (freeCodeCamp, Coursera, or NPTEL work well).', yt: 'best free courses for students 2025', g: 'free online certification courses India' },
    { title: 'Build 2–3 portfolio projects', desc: 'Real projects beat theory on a resume. One CRUD app, one data analysis, or one design case study is enough to start.', yt: 'portfolio project ideas for students GitHub', g: 'how to build portfolio projects for freshers' },
    { title: 'Internship or volunteer role', desc: 'Apply for internships on Internshala, LinkedIn, or AngelList. Even 2-month unpaid roles signal real-world experience.', yt: 'how to get internship as a student India', g: 'Internshala tips for getting first internship' },
    { title: 'Network, apply, iterate', desc: 'Join Discord communities, attend hackathons, cold DM professionals on LinkedIn. Start applications 6 months before target date.', yt: 'networking tips for tech students India', g: 'how to get first tech job India' },
  ],
  'Software Engineer': [
    { title: 'Master DSA daily', desc: 'Practice LeetCode Easy → Medium. Aim for 150+ problems before applying. Consistency over marathons.', yt: 'data structures algorithms course beginners', g: 'LeetCode roadmap for beginners' },
    { title: 'Deepen one language', desc: 'Go deep on Python or JavaScript — understand memory, async, OOP, testing, and error handling patterns.', yt: 'Python programming complete course 2025', g: 'JavaScript mastery roadmap' },
    { title: 'Build full-stack projects', desc: 'One CRUD app, one API integration, one real-world clone. Deploy each on Vercel or Railway.', yt: 'full stack project tutorial beginners', g: 'full stack portfolio project ideas India' },
    { title: 'Learn CS fundamentals', desc: 'Study operating systems, networking, databases, and how they interact. This separates juniors from seniors.', yt: 'computer science fundamentals for programmers', g: 'CS basics for software engineers' },
    { title: 'Understand system design basics', desc: 'Study scaling, load balancers, caching, queues. Use "Designing Data-Intensive Applications" as reference.', yt: 'system design basics for beginners', g: 'system design interview preparation' },
    { title: 'Interview preparation', desc: 'Mock interviews, resume reviews, company-specific prep. Use Blind and Glassdoor for real insights.', yt: 'software engineering interview prep 2025', g: 'FAANG interview preparation India' },
  ],
  'Data Scientist': [
    { title: 'Python + statistics foundation', desc: 'NumPy, Pandas, Matplotlib — plus probability, distributions, and hypothesis testing.', yt: 'Python data science tutorial for beginners', g: 'statistics for data science course free' },
    { title: 'Machine learning fundamentals', desc: 'Linear regression → decision trees → neural networks. Kaggle courses are the best free starting point.', yt: 'machine learning course Andrew Ng full', g: 'machine learning roadmap beginners India' },
    { title: 'Work with real datasets', desc: '3 end-to-end Kaggle notebooks with insights, visualizations, and conclusions. Share on GitHub.', yt: 'kaggle competition tutorial for beginners', g: 'best datasets for machine learning projects India' },
    { title: 'SQL + data pipelines', desc: 'SQL window functions, CTEs, joins are non-negotiable. Learn basic ETL with Pandas or dbt.', yt: 'SQL for data scientists full course', g: 'data engineering basics for data scientists' },
    { title: 'Deploy your first model', desc: 'Flask or FastAPI + a simple ML model live on Hugging Face Spaces or Render. Shows end-to-end skill.', yt: 'deploy machine learning model Flask tutorial', g: 'how to deploy ML model for free' },
    { title: 'Write and share your work', desc: 'Medium, Towards Data Science, or a personal blog. Writing forces clarity and attracts recruiters organically.', yt: 'data science portfolio tips for beginners', g: 'how to build data science portfolio India' },
  ],
  'UX/UI Designer': [
    { title: 'Design fundamentals first', desc: 'Colour theory, typography, spacing systems, and Gestalt principles. These never go out of date.', yt: 'UI UX design fundamentals for beginners', g: 'design fundamentals free course 2025' },
    { title: 'Master Figma end-to-end', desc: 'Components, auto-layout, variables, prototyping, and design systems. Figma is free on the student plan.', yt: 'Figma complete tutorial 2025', g: 'Figma design system tutorial' },
    { title: 'Study products you love', desc: 'Pick 3 apps, tear them down — identify hierarchy, patterns, and what frustrates you. Document your findings.', yt: 'how to do UX teardown analysis', g: 'product design teardown examples' },
    { title: 'Build a 3-piece case study portfolio', desc: 'One redesign, one original concept, one real or volunteer project. Each needs problem → process → outcome.', yt: 'UX portfolio case study tutorial', g: 'how to write UX case study for portfolio' },
    { title: 'Learn user research methods', desc: 'Usability testing, user interviews, affinity mapping, journey maps. Even 5 users reveals massive insights.', yt: 'user research methods UX design', g: 'how to conduct user interviews for UX' },
    { title: 'Apply and get feedback', desc: 'Dribbble, Behance, and LinkedIn. DM 3 designers a week asking for portfolio feedback. Most say yes.', yt: 'how to get first UX design job India', g: 'UI UX jobs for freshers India 2025' },
  ],
  'Business Analyst': [
    { title: 'Excel and SQL are table stakes', desc: 'Pivot tables, VLOOKUP, SUMIF — then basic SQL with JOINs and GROUP BY. These appear in every BA role.', yt: 'Excel for business analysts full course', g: 'SQL for business analysts beginners' },
    { title: 'Understand business fundamentals', desc: 'Revenue models, KPIs, unit economics, and basic finance. Know how companies measure success.', yt: 'business fundamentals course free 2025', g: 'business analysis fundamentals for beginners' },
    { title: 'Requirements gathering techniques', desc: 'User stories, BRDs, process flowcharts, use-case diagrams, and stakeholder mapping.', yt: 'business requirements gathering tutorial', g: 'BRD user story template examples' },
    { title: 'Get a foundation certification', desc: 'CBAP foundation, IIBA Ecba, or Agile/Scrum certification signals seriousness. Many are under ₹5000.', yt: 'business analyst certification guide', g: 'IIBA ECBA certification India cost 2025' },
    { title: 'Build domain expertise', desc: 'Pick fintech, healthtech, or edtech. Domain depth combined with BA skills creates a rare, valuable profile.', yt: 'business analyst fintech domain knowledge', g: 'industry domain knowledge business analyst India' },
    { title: 'Case study practice', desc: 'Practice answering "How would you improve this product?" and "What metrics would you track for X?"', yt: 'business analyst interview case study', g: 'business analyst case study questions India' },
  ],
};

const getRoadmap = (name = '') => {
  const key = Object.keys(ROADMAPS).find(k => k !== 'default' && name.toLowerCase().includes(k.toLowerCase()));
  return ROADMAPS[key] || ROADMAPS.default;
};

/* ─────────────────────────────────────────────
   AnimatedBackground
   ───────────────────────────────────────────── */
function AnimatedBackground() {
  return (
    <div className="hbg">
      <div className="hbg-mesh" /><div className="hbg-grid" /><div className="hbg-stars" />
      <div className="hbg-orb" style={{ width: 520, height: 520, top: '-12%', left: '-10%', background: 'radial-gradient(circle,rgba(99,102,241,.17),transparent 70%)', '--b': '95px', '--d': '22s', '--x1': '40px', '--y1': '-35px', '--s1': '1.08', '--x2': '-25px', '--y2': '28px', '--s2': '.93', '--x3': '18px', '--y3': '-18px', '--s3': '1.12' }} />
      <div className="hbg-orb" style={{ width: 400, height: 400, bottom: '-10%', right: '-8%', background: 'radial-gradient(circle,rgba(139,92,246,.14),transparent 70%)', '--b': '85px', '--d': '26s', '--x1': '-35px', '--y1': '-42px', '--s1': '1.05', '--x2': '22px', '--y2': '18px', '--s2': '.96', '--x3': '-12px', '--y3': '-22px', '--s3': '1.04' }} />
      <div className="hbg-orb" style={{ width: 240, height: 240, top: '38%', right: '18%', background: 'radial-gradient(circle,rgba(167,139,250,.10),transparent 70%)', '--b': '65px', '--d': '17s', '--x1': '22px', '--y1': '18px', '--s1': '1.14', '--x2': '-12px', '--y2': '-22px', '--s2': '.90', '--x3': '18px', '--y3': '10px', '--s3': '1.06' }} />
      <div className="hbg-orb" style={{ width: 200, height: 200, top: '5%', right: '8%', background: 'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)', '--b': '50px', '--d': '14s', '--x1': '-18px', '--y1': '-14px', '--s1': '1.1', '--x2': '12px', '--y2': '18px', '--s2': '.92', '--x3': '-8px', '--y3': '-10px', '--s3': '1.05' }} />
      <div className="hbg-beam" style={{ top: '18%', '--w': '48%', '--dur': '7s', '--dl': '0s' }} />
      <div className="hbg-beam" style={{ top: '52%', '--w': '36%', '--dur': '9s', '--dl': '3.2s' }} />
      <div className="hbg-beam" style={{ top: '78%', '--w': '28%', '--dur': '11s', '--dl': '6.5s' }} />
      <div className="hbg-beam" style={{ top: '35%', '--w': '22%', '--dur': '13s', '--dl': '9s' }} />
      <div className="hbg-hex" style={{ '--sz': '72px', '--op': '.05', '--bop': '.1', top: '8%', right: '6%', '--fd': '24s', '--ty': '-30px', '--sd': '38s' }} />
      <div className="hbg-hex" style={{ '--sz': '46px', '--op': '.04', '--bop': '.08', bottom: '12%', left: '5%', '--fd': '19s', '--ty': '-20px', '--sd': '28s' }} />
      <div className="hbg-hex" style={{ '--sz': '30px', '--op': '.05', '--bop': '.09', top: '55%', right: '25%', '--fd': '15s', '--ty': '-14px', '--sd': '22s' }} />
      <div className="hbg-hex" style={{ '--sz': '20px', '--op': '.04', '--bop': '.07', top: '25%', left: '20%', '--fd': '12s', '--ty': '-10px', '--sd': '18s' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ① Tech News Ticker
   ───────────────────────────────────────────── */
function TechTicker() {
  const doubled = [...HEADLINES, ...HEADLINES];
  return (
    <div className="rounded-2xl border border-white/[.07] bg-white/[.025] backdrop-blur-xl overflow-hidden flex items-center h-10">
      {/* Label pill */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 border-r border-white/10 bg-indigo-500/10">
        <span className="pulse-dot" style={{ width: 5, height: 5 }} />
        <span className="text-[0.62rem] font-extrabold tracking-[0.14em] uppercase text-indigo-300 whitespace-nowrap">
          Tech Live
        </span>
      </div>
      {/* Track */}
      <div className="ticker-wrap flex-1 flex items-center overflow-hidden">
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <span key={i} className="ticker-item group"
              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(item.text)}`, '_blank')}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
              <span className="text-[0.62rem] font-bold tracking-widest uppercase opacity-90" style={{ color: item.color }}>
                {item.tag}
              </span>
              <span className="text-white/60 group-hover:text-white transition-colors">{item.text}</span>
              <span className="ticker-sep">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   ② Quick Stats Bar
   ───────────────────────────────────────────── */
function QuickStats({ attempts }) {
  const s = useMemo(() => {
    if (!attempts.length) return null;
    const pcts = attempts.map(a => a.percent);
    const avg = Math.round(pcts.reduce((t, v) => t + v, 0) / pcts.length);
    const best = Math.max(...pcts);
    let streak = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].percent >= 60) streak++; else break;
    }
    return { total: attempts.length, avg, best, streak };
  }, [attempts]);

  if (!s) return null;

  const cards = [
    { icon: '📋', label: 'Total tests', val: s.total, suf: '', color: '#a78bfa' },
    { icon: '📊', label: 'Average', val: s.avg, suf: '%', color: '#60a5fa' },
    { icon: '🏆', label: 'Best score', val: s.best, suf: '%', color: '#fbbf24' },
    { icon: '🔥', label: 'Pass streak', val: s.streak, suf: '×', color: '#f97316' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(({ icon, label, val, suf, color }) => (
        <div key={label}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 flex flex-col gap-2 count-in transition-transform hover:scale-[1.02]">
          <span className="text-2xl">{icon}</span>
          <span className="qs-val" style={{ color }}>{val}{suf}</span>
          <span className="text-[0.68rem] text-white/50 font-medium uppercase tracking-widest">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ③ Skill Radar Chart (pure SVG)
   ───────────────────────────────────────────── */
function RadarChart({ attempts, singleAttempt }) {
  const DOM = ['programming', 'tech', 'math', 'communication', 'business', 'helping'];
  const LBLS = ['Code', 'Tech', 'Math', 'Comms', 'Biz', 'Help'];
  const N = DOM.length;
  const CX = 105; const CY = 105; const R = 75;

  const scores = useMemo(() => {
    const target = singleAttempt || (attempts && attempts.length > 0 ? attempts[attempts.length - 1] : null);
    if (!target) {
      if (!attempts || !attempts.length) return DOM.map(() => 0);
      const tot = {}, cnt = {};
      attempts.forEach(a => Object.entries(a.domainScores || {}).forEach(([k, v]) => {
        tot[k] = (tot[k] || 0) + v; cnt[k] = (cnt[k] || 0) + 1;
      }));
      return DOM.map(d => cnt[d] ? Math.round(tot[d] / cnt[d]) : 0);
    }
    return DOM.map(d => target.domainScores ? (target.domainScores[d] || 0) : 0);
  }, [attempts, singleAttempt]);

  const angle = i => Math.PI * 2 * i / N - Math.PI / 2;
  const pt = (i, r) => [CX + r * Math.cos(angle(i)), CY + r * Math.sin(angle(i))];
  const poly = (frac) => DOM.map((_, i) => pt(i, R * frac).join(',')).join(' ');
  const data = scores.map((s, i) => pt(i, R * s / 100).join(',')).join(' ');
  const has = scores.some(s => s > 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg,#a78bfa,#6366f1)', display: 'inline-block' }} />
            Skill Distribution
          </h3>
          <p className="text-[10px] text-white/40 mt-0.5">{singleAttempt ? 'Scores for this specific attempt' : 'Average domain scores across all attempts'}</p>
        </div>
        {has && <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-medium">Live</span>}
      </div>

      <div className="flex justify-center">
        <svg width="210" height="210" viewBox="0 0 210 210">
          <defs>
            <linearGradient id="rgFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity=".45" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity=".12" />
            </linearGradient>
            <linearGradient id="rgStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
          {[.2, .4, .6, .8, 1].map(f => <polygon key={f} points={poly(f)} fill="none" stroke="rgba(99,102,241,.13)" strokeWidth="1" />)}
          {DOM.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(99,102,241,.16)" strokeWidth="1" />; })}
          {has && <>
            <polygon points={data} fill="url(#rgFill)" stroke="url(#rgStroke)" strokeWidth="1.8" />
            {scores.map((s, i) => { const [x, y] = pt(i, R * s / 100); return s > 0 ? <circle key={i} cx={x} cy={y} r="3.5" fill="#a78bfa" stroke="rgba(255,255,255,.25)" strokeWidth="1" /> : null; })}
          </>}
          {!has && <text x={CX} y={CY + 4} textAnchor="middle" fill="rgba(255,255,255,.22)" fontSize="10">Take a test to see radar</text>}
          {DOM.map((_, i) => { const [x, y] = pt(i, R + 18); return <text key={i} x={x} y={y + 4} textAnchor="middle" className="radar-lbl" fill={scores[i] > 0 ? '#a78bfa' : 'rgba(199,210,254,.38)'}>{LBLS[i]}</text>; })}
          {has && scores.map((s, i) => { if (!s) return null; const [x, y] = pt(i, R * s / 100 - 14); return <text key={i} x={x} y={y + 4} textAnchor="middle" fill="rgba(255,255,255,.72)" fontSize="8.5" fontWeight="600">{s}%</text>; })}
        </svg>
      </div>

      {has && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 justify-center">
          {DOM.map((d, i) => (
            <span key={d} className={`text-[0.72rem] ${scores[i] > 0 ? 'text-indigo-200' : 'text-white/30'}`}>
              {LBLS[i]}: <strong className={scores[i] > 0 ? 'text-white' : ''}>{scores[i]}%</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile completness widget removed as requested.

/* ─────────────────────────────────────────────
   ⑤ Career Roadmap Drawer
   ───────────────────────────────────────────── */
function RoadmapDrawer({ career, onClose }) {
  const steps = getRoadmap(career?.name || career?.title || '');

  useEffect(() => {
    const esc = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  return (
    <>
      <div className="rm-overlay" onClick={onClose} />
      <div className="rm-panel bg-[var(--color-surface)] border-l border-[var(--color-border-subtle)]">
        {/* Header */}
        <div className="py-5 px-6 shrink-0 bg-[var(--color-accent-soft)] border-b border-[var(--color-border-subtle)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.62rem] font-extrabold tracking-widest uppercase text-[var(--color-accent)] mb-1.5">
                Career roadmap
              </p>
              <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] leading-tight m-0">
                {career?.name || career?.title || 'Your path'}
              </h2>
              {career?.matchPercentage != null && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {career.matchPercentage}% match with your profile
                </p>
              )}
            </div>
            <button type="button" onClick={onClose}
              className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-surface-soft)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] flex items-center justify-center transition">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="rm-body">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, i) => (
              <div key={i} className="rm-step">
                <div className="rm-num border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{i + 1}</div>
                <div className="rm-content">
                  <p className="rm-title text-[var(--color-text-primary)]">{step.title}</p>
                  <p className="rm-desc text-[var(--color-text-muted)] line-clamp-3 hover:line-clamp-none transition-all">{step.desc}</p>
                  <div>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(step.yt)}`}
                      target="_blank" rel="noopener noreferrer" className="rm-btn bg-[var(--color-accent-soft)] border-[var(--color-border-subtle)] text-[var(--color-accent)] hover:bg-[var(--color-border-subtle)]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      YouTube
                    </a>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(step.g)}`}
                      target="_blank" rel="noopener noreferrer" className="rm-btn bg-[var(--color-accent-soft)] border-[var(--color-border-subtle)] text-[var(--color-accent)] hover:bg-[var(--color-border-subtle)]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                      Resources
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-3.5 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-border-subtle)]">
            <p className="text-[0.74rem] text-[var(--color-text-muted)] leading-relaxed m-0">
              <strong className="text-[var(--color-accent)]">Tip:</strong> Focus on one milestone at a time. 4–6 weeks per step. Consistency beats intensity every time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Home
   ───────────────────────────────────────────── */
export default function Home() {
  const { user } = useAuth();
  const [mode, setMode] = useState(MODES.overview);
  const [pendingAssessment, setPendingAssessment] = useState(null);
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [aptitudeAnswers, setAptitudeAnswers] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [activeTest, setActiveTest] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [roadmapCareer, setRoadmapCareer] = useState(null);

  const weekKey = useMemo(() => getWeekKey(new Date()), []);
  const weeklyAvailable = useMemo(() => canTakeWeeklyTest(attempts, weekKey), [attempts, weekKey]);
  const traitSignals = useMemo(() => {
    const historicalSignals = buildTraitSignalsFromAttempts(attempts);
    const latestRaisecAttempt = [...attempts].reverse().find((attempt) => attempt?.type === 'raisec');
    if (!latestRaisecAttempt) return historicalSignals;

    const raisecSignals = buildTraitSignalsFromRaisecScores(latestRaisecAttempt.domainScores);
    const mergedSignals = { ...historicalSignals };
    Object.entries(raisecSignals).forEach(([key, value]) => {
      mergedSignals[key] = Math.max(Number(mergedSignals[key]) || 0, Number(value) || 0);
    });
    return mergedSignals;
  }, [attempts]);
  const selectedCareer = useMemo(() => recommendations.find(r => r.id === selectedCareerId) || recommendations[0] || null, [recommendations, selectedCareerId]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const saved = loadAppState(user?.id) || {};

      let latestProfile = saved.profile || null;
      let latestAttempts = Array.isArray(saved.attempts) ? saved.attempts : [];
      let latestRecs = saved.recommendations || [];
      let latestAptitude = saved.aptitudeAnswers || null;

      try {
        const { userAPI, testAPI } = await import('../api/api');
        const [meRes, attRes] = await Promise.all([
          userAPI.getMe().catch(() => ({ data: null })),
          testAPI.getAttempts().catch(() => ({ data: null }))
        ]);

        if (meRes?.data) {
          latestProfile = { ...latestProfile, ...meRes.data };
          saved.profile = latestProfile;
        }
        if (attRes?.data && Array.isArray(attRes.data)) {
          latestAttempts = attRes.data.map(a => {
            let scores = {};
            try { scores = a.domainScoresJson ? JSON.parse(a.domainScoresJson) : {}; } catch (e) { }
            return { ...a, domainScores: scores };
          });
          saved.attempts = latestAttempts;
        }
      } catch (e) {
        console.log("Using local offline fallback for data");
      }

      if (isMounted) {
        if (latestProfile) setProfile(latestProfile);
        if (latestAptitude) setAptitudeAnswers(latestAptitude);
        if (latestRecs.length > 0) {
          setRecommendations(latestRecs);
          setSelectedCareerId(latestRecs[0]?.id || null);
        } else if (latestProfile && latestAptitude) {
          recompute(latestProfile, latestAptitude);
        } else if (latestProfile && latestAttempts.length > 0) {
          // Fallback compute if we only have attempts and profile
          recompute(latestProfile, []);
        }
        if (latestAttempts.length > 0) setAttempts(latestAttempts);
      }
    }

    if (user?.id) loadData();
    return () => { isMounted = false; };
  }, [user?.id]);

  useEffect(() => {
    // Only save if we actually have data, prevent overwriting with null on mount
    if (profile || attempts.length > 0) {
      saveAppState(user?.id, { profile, aptitudeAnswers, recommendations, attempts });
    }
  }, [user?.id, profile, aptitudeAnswers, recommendations, attempts]);

  const recompute = (np, na) => {
    const recs = getRecommendations(np, buildAptitudeScores(na || []), traitSignals);
    setRecommendations(recs); setSelectedCareerId(recs[0]?.id || null);
  };

  useEffect(() => {
    if (profile && aptitudeAnswers && traitSignals) {
      recompute(profile, aptitudeAnswers);
    }
  }, [traitSignals, profile, aptitudeAnswers]);

  const hydrateAttempt = (attempt) => {
    let scores = attempt?.domainScores || {};
    if ((!scores || Object.keys(scores).length === 0) && attempt?.domainScoresJson) {
      try {
        scores = JSON.parse(attempt.domainScoresJson);
      } catch {
        scores = {};
      }
    }
    return { ...attempt, domainScores: scores };
  };

  const finalizeAttempt = (attempt) => {
    const storedAttempt = hydrateAttempt(attempt);
    const next = [...attempts, storedAttempt];
    setAttempts(next);

    if (activeTest?.meta?.fromAssessment && pendingAssessment) {
      const { profile: p, aptitudeAnswers: a } = pendingAssessment;
      const historicalSignals = buildTraitSignalsFromAttempts(next);
      const raisecSignals = storedAttempt.type === 'raisec'
        ? buildTraitSignalsFromRaisecScores(storedAttempt.domainScores)
        : {};
      const mergedSignals = { ...historicalSignals };

      Object.entries(raisecSignals).forEach(([key, value]) => {
        mergedSignals[key] = Math.max(Number(mergedSignals[key]) || 0, Number(value) || 0);
      });

      const recs = getRecommendations(p, buildAptitudeScores(a), mergedSignals);
      setProfile(p); setAptitudeAnswers(a); setRecommendations(recs); setSelectedCareerId(recs[0]?.id || null); setPendingAssessment(null);
    }

    setMode(MODES.overview); setActiveTest(null);
  };

  const handleAssessmentSubmit = async ({ profile: p, aptitudeAnswers: a }) => {
    setPendingAssessment({ profile: p, aptitudeAnswers: a });
    setIsAnalyzing(true);
    try {
      const { raisecAPI, userAPI } = await import('../api/api');
      const streamLabel = getStreamsForGrade(p.grade).find((stream) => stream.value === p.stream)?.label || p.stream;
      const interestLabel = INTERESTS.find((item) => item.value === p.interest)?.label || p.interest;

      if (localStorage.getItem('careercompass:jwt')) {
        try {
          await userAPI.updateMe({
            name: p.name,
            grade: p.grade,
            stream: p.stream,
            interest: p.interest,
          });
        } catch {
          // Local auth or offline backend is allowed here.
        }
      }

      const res = await raisecAPI.getTest({
        grade: p.grade,
        stream: p.stream,
        interest: p.interest,
      });

      setActiveTest({
        title: `${p.grade === 'grad' ? 'Graduation' : `Class ${p.grade}`} Personalized Test`,
        subtitle: `30 questions from ${streamLabel} and 10 questions from ${interestLabel}.`,
        questions: res.data,
        meta: { type: 'assessment_test', fromAssessment: true }
      });
      setMode(MODES.raisec_test);
    } catch (e) {
      console.error("Failed to load personalized assessment.", e);
      setMode(MODES.assessment);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startCoreTest = () => {
    const t = TEST_CATALOG.find(x => x.id === 'coding_tech') || TEST_CATALOG[0];
    const questions = pickQuestions({ bank: TEST_BANK, domains: t.domains, count: t.questionCount, seed: `core_${Date.now()}` });
    setActiveTest({ title: t.name, subtitle: t.description, questions, meta: { type: 'test' } }); setMode(MODES.test);
  };

  const startWeeklyTest = () => {
    const questions = pickQuestions({ bank: TEST_BANK, domains: ['programming', 'math', 'communication', 'business', 'helping'], count: 10, seed: `weekly_${weekKey}` });
    setActiveTest({ title: 'Weekly Test', subtitle: 'One attempt per week. Your score influences the career decision logic.', questions, meta: { type: 'weekly', weekKey } }); setMode(MODES.weekly);
  };

  const onAttemptSaved = async (attempt) => {
    let storedAttempt = attempt;

    try {
      const { testAPI } = await import('../api/api');
      const payload = { ...attempt, domainScoresJson: JSON.stringify(attempt.domainScores || {}) };
      const res = await testAPI.saveAttempt(payload);
      if (res?.data) storedAttempt = hydrateAttempt(res.data);
    } catch (e) {
      console.log("Saved attempt offline");
    }

    finalizeAttempt(storedAttempt);
  };

  const handleRaisecAttemptComplete = async ({ questionIds, answers }) => {
    const { raisecAPI } = await import('../api/api');
    const res = await raisecAPI.submitTest({ questionIds, answers });
    if (!res?.data) {
      throw new Error('Backend did not return a scored RIASEC attempt.');
    }
    finalizeAttempt(res.data);
  };

  useEffect(() => {
    if (profile && aptitudeAnswers) recompute(profile, aptitudeAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  const resetAll = () => {
    clearAppState(user?.id);
    setPendingAssessment(null); setSelectedCareerId(null); setProfile(null); setAptitudeAnswers(null);
    setRecommendations([]); setAttempts([]); setActiveTest(null); setMode(MODES.overview);
  };

  const defaultProfile = { name: user?.name || 'Student', email: user?.email || '', grade: '12', stream: 'PCM', interest: 'tech', mobile: '', city: '', targetYear: '' };

  return (
    <>
      <style>{BG_CSS}</style>
      <AnimatedBackground />

      {/* Analysing overlay */}
      {isAnalyzing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(5,8,15,.88)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div className="hbg-spinner" />
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '0.9rem' }}>Preparing your personalized 40-question test...</p>
        </div>
      )}

      {/* Roadmap drawer */}
      {roadmapCareer && <RoadmapDrawer career={roadmapCareer} onClose={() => setRoadmapCareer(null)} />}

      <div className="h-content space-y-6 pb-16">

        {/* Hero */}
        <Hero hasProfile={Boolean(profile)} onStartAssessment={() => setMode(MODES.assessment)} onTakeTest={startCoreTest} onWeeklyTest={startWeeklyTest} weeklyAvailable={weeklyAvailable} />

        {/* ① Tech ticker — always visible */}
        <TechTicker />

        {/* ② Quick stats — visible once attempts exist */}
        {attempts.length > 0 && <QuickStats attempts={attempts} />}

        {/* Mode panels */}
        {mode === MODES.assessment && (
          <div className="animate-slideUp">
            <Assessment
              initialProfile={pendingAssessment?.profile || profile || defaultProfile}
              onSubmit={handleAssessmentSubmit}
              isLoading={isAnalyzing}
            />
          </div>
        )}

        {mode === MODES.raisec_test && (
          <div className="animate-slideUp">
            <RaisecTestRunner title={activeTest?.title} subtitle={activeTest?.subtitle} questions={activeTest?.questions || []}
              onCancel={() => { setPendingAssessment(null); setActiveTest(null); setMode(MODES.overview); }}
              onComplete={handleRaisecAttemptComplete} />
          </div>
        )}
        {(mode === MODES.test || mode === MODES.weekly) && (
          <div className="animate-slideUp">
            <TestRunner title={activeTest?.title} subtitle={activeTest?.subtitle} questions={activeTest?.questions || []} meta={activeTest?.meta}
              onCancel={() => { if (activeTest?.meta?.fromAssessment) setPendingAssessment(null); setActiveTest(null); setMode(MODES.overview); }}
              onComplete={onAttemptSaved} />
          </div>
        )}
        {mode === MODES.compare && <div className="animate-slideUp"><CareerCompare recommendations={recommendations} onBack={() => setMode(MODES.overview)} /></div>}

        {/* Overview grid */}
        {mode === MODES.overview && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start fade-stagger">

            {/* LEFT */}
            <div className="space-y-6">
              <TopMatchesCard recommendations={recommendations} selectedCareerId={selectedCareerId} attempts={attempts}
                onSelectCareer={setSelectedCareerId} onCompare={() => setMode(MODES.compare)} onOpenRoadmap={setRoadmapCareer} />

              <TrendingCareersCard />

              <KnowledgeCheck onTakeTest={startCoreTest} onWeeklyTest={startWeeklyTest} weeklyAvailable={weeklyAvailable} />
              <AttemptsTable attempts={attempts} />
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
              {/* Career decision */}
              <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span className="pulse-dot" />Career decision</h3>
                    <p className="text-sm text-white/50 mt-1">Based on assessment + marks/score signals.</p>
                  </div>
                  {recommendations.length > 0 && (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                      {recommendations.length} matches
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <Dashboard recommendations={recommendations} selectedCareerId={selectedCareerId} profile={profile || defaultProfile}
                    examAttempt={attempts.length ? attempts[attempts.length - 1] : null} onCompare={() => setMode(MODES.compare)} onStartOver={() => setMode(MODES.assessment)} />
                </div>
              </div>

              {/* ⑤ Roadmap CTA — when career selected */}
              {selectedCareer && (
                <button type="button" onClick={() => setRoadmapCareer(selectedCareer)}
                  className="btn-primary w-full flex items-center justify-between px-6 py-4 rounded-3xl border border-indigo-500/30 transition"
                  style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.16),rgba(139,92,246,.1))', textAlign: 'left' }}>
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>🗺️</span> View career roadmap
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Step-by-step guide for {selectedCareer.name || selectedCareer.title}
                    </p>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}

              <Scoreboard attempts={attempts} weeklyAvailable={weeklyAvailable} weekKey={weekKey} onClear={resetAll} />

              <div className="rounded-3xl border border-cyan-400/20 bg-cyan-500/5 backdrop-blur-xl p-6">
                <p className="text-cyan-300 font-semibold text-sm flex items-center gap-2">
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#67e8f9', boxShadow: '0 0 6px #67e8f9', display: 'inline-block' }} />
                  Weekly tip
                </p>
                <p className="text-white/65 mt-3 text-sm leading-relaxed">
                  Complete weekly tests consistently to improve the accuracy of your career and course recommendations.
                </p>
              </div>
            </div>

          </div>
        )}

        <footer className="text-center text-xs text-white/30 pt-4 flex items-center justify-center gap-2">
          <span className="pulse-dot" style={{ width: 5, height: 5, background: 'rgba(99,102,241,.5)', boxShadow: '0 0 6px rgba(99,102,241,.6)' }} />
          CareerCompass is a frontend demo. Recommendations are guidance, not guarantees.
        </footer>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Hero
   ───────────────────────────────────────────── */
function Hero({ hasProfile, onStartAssessment, onTakeTest, onWeeklyTest, weeklyAvailable }) {
  return (
    <div className="rounded-[32px] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] backdrop-blur-xl shadow-[var(--shadow-strong)] overflow-hidden">
      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-text-primary)]">
              <span className="pulse-dot" />AI-powered career guidance
            </p>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-tight">
              Find a career path that{' '}
              <span style={{ background: 'linear-gradient(135deg,#a78bfa 0%,#6366f1 50%,#818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                fits your strengths.
              </span>
            </h1>
            <p className="mt-4 text-[var(--color-text-muted)] leading-relaxed">
              Fill your profile and complete a quick aptitude check, then take the exam.
              Based on your score, we surface the best career with roadmaps and video links.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto items-stretch sm:items-start">
            <button type="button" onClick={onStartAssessment}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-400 hover:to-indigo-400 text-white font-semibold transition shadow-lg hover:shadow-indigo-500/30">
              {hasProfile ? '↺ Re-take assessment' : '✦ Start assessment'}
            </button>
            <button type="button" onClick={onTakeTest}
              className="px-5 py-3 rounded-2xl bg-[var(--color-surface-soft)] text-[var(--color-text-primary)] font-semibold border border-[var(--color-border-subtle)] transition hover:bg-[var(--color-border-subtle)]">
              ⚡ Take skill test
            </button>
            <button type="button" onClick={weeklyAvailable ? onWeeklyTest : undefined}
              className={`px-5 py-3 rounded-2xl font-semibold border transition ${weeklyAvailable ? 'bg-[var(--color-surface-soft)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)] hover:bg-[var(--color-border-subtle)]' : 'btn-weekly-done'}`}>
              {weeklyAvailable ? '📅 Start weekly test' : '✓ Weekly test completed'}
            </button>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniCard icon="🧪" title="Tests" desc="Core skill tests + weekly test flow" />
          <MiniCard icon="📊" title="Marks & score" desc="History table, averages, and best score" />
          <MiniCard icon="🎯" title="Career decision" desc="Deterministic logic using your signals" />
        </div>
      </div>
    </div>
  );
}

function MiniCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] p-5">
      <p className="text-xl mb-2">{icon}</p>
      <p className="text-[var(--color-text-primary)] font-semibold">{title}</p>
      <p className="text-sm text-[var(--color-text-muted)] mt-1">{desc}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TopMatchesCard (with Roadmap button)
   ───────────────────────────────────────────── */
function TopMatchesCard({ recommendations, selectedCareerId, attempts, onSelectCareer, onCompare, onOpenRoadmap }) {
  const activeRec = recommendations.find(r => r.id === selectedCareerId) || recommendations[0];
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45 mb-4">Top Matches</p>
      {recommendations.length === 0 ? (
        <p className="text-sm text-white/45 leading-relaxed">Complete the assessment to see your top career matches here.</p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {recommendations.slice(0, 3).map((rec, idx) => {
            const active = rec.id === selectedCareerId || (!selectedCareerId && idx === 0);
            return (
              <button key={rec.id} type="button" onClick={() => onSelectCareer(rec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-colors ${active ? 'bg-yellow-400/10 border-yellow-400/25' : 'bg-white/[.03] border-white/10 hover:bg-white/[.06]'}`}>
                <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${active ? 'bg-yellow-400 text-slate-900' : 'bg-white/10 text-white/50'}`}>{idx + 1}</span>
                <span className={`text-xs font-medium flex-1 truncate ${active ? 'text-white' : 'text-white/60'}`}>{rec.name || rec.title}</span>
                <span className={`text-xs font-bold flex-shrink-0 ${active ? 'text-yellow-400' : 'text-white/30'}`}>{rec.matchPercentage}%</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-2 mb-6">
        <button type="button" onClick={onCompare}
          className="btn-secondary flex-1 px-3 py-2.5 rounded-xl bg-white/8 text-white/80 border border-white/10 text-xs font-medium transition">
          ⇄ Compare
        </button>
        {activeRec && (
          <button type="button" onClick={() => onOpenRoadmap(activeRec)}
            className="btn-primary flex-shrink-0 px-3 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5">
            🗺️ Roadmap
          </button>
        )}
      </div>

      {recommendations.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <RadarChart attempts={attempts} singleAttempt={null} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KnowledgeCheck
   ───────────────────────────────────────────── */
function KnowledgeCheck({ onTakeTest, onWeeklyTest, weeklyAvailable }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">💻 Knowledge test</h3>
        <p className="text-sm text-white/55 mt-1">Check your coding + tech basics. Marks feed into your career decision.</p>
      </div>
      <div className="p-6 flex flex-col sm:flex-row gap-3">
        <button type="button" onClick={onTakeTest}
          className="btn-primary px-5 py-3 rounded-2xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition">
          ⚡ Start coding/tech test
        </button>
        <button type="button" onClick={weeklyAvailable ? onWeeklyTest : undefined}
          className={`px-5 py-3 rounded-2xl font-semibold border transition ${weeklyAvailable ? 'btn-secondary bg-white/10 text-white border-white/10' : 'btn-weekly-done'}`}>
          {weeklyAvailable ? '📅 Weekly test' : '✓ Weekly completed'}
        </button>
      </div>
      <div className="px-6 pb-6 grid grid-cols-3 gap-3">
        <MiniCard icon="⚙️" title="Coding" desc="DSA + OOP" />
        <MiniCard icon="🌐" title="Tech" desc="Web + product" />
        <MiniCard icon="🤝" title="Comms" desc="Team skills" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AttemptsTable
   ───────────────────────────────────────────── */
function AttemptsTable({ attempts }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><span className="pulse-dot" />Attempts</h3>
          <p className="text-sm text-white/55 mt-1">Tests, weekly tests, and marks history.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40">{attempts.length} total</span>
      </div>
      {attempts.length === 0 ? (
        <div className="p-10 text-center"><p className="text-3xl mb-3">📋</p><p className="text-white/45 text-sm">No attempts yet. Take a test to start tracking marks.</p></div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-white/35 text-xs uppercase tracking-wider">
                {['Type', 'Marks', 'Score', 'Domains', 'Week'].map(h => <th key={h} className="px-6 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {attempts.slice().reverse().map(a => {
                const sc = a.percent >= 70 ? '#68d391' : a.percent >= 50 ? '#fbbf24' : '#fc8181';
                return (
                  <tr key={a.id} className="tbl-row border-t border-white/10">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${a.type === 'weekly' ? 'bg-yellow-500/15 border border-yellow-500/25 text-yellow-300' : a.type === 'assessment_test' ? 'bg-violet-500/15 border border-violet-500/25 text-violet-300' : 'bg-indigo-500/15 border border-indigo-500/25 text-indigo-300'}`}>
                        {a.type === 'weekly' ? '📅' : a.type === 'assessment_test' ? '🎯' : '⚡'} {a.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 tabular-nums font-semibold text-white/75">{a.correct}/{a.total}</td>
                    <td className="px-6 py-4 tabular-nums font-bold" style={{ color: sc }}>{a.percent}%</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(a.domainScores || {}).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-white/50 tabular-nums">{k}: {v}%</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/35 text-xs">{a.weekKey || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Trending Careers Card
   ───────────────────────────────────────────── */
const TRENDING_CAREERS = [
  { emoji: '🤖', title: 'AI / ML Engineer', growth: '+45%', color: '#e879f9', tags: ['Python', 'TensorFlow', 'LLMs'] },
  { emoji: '🔐', title: 'Cybersecurity Analyst', growth: '+38%', color: '#22d3ee', tags: ['Networks', 'Ethical Hacking'] },
  { emoji: '📱', title: 'Full-Stack Developer', growth: '+31%', color: '#818cf8', tags: ['React', 'Node', 'SQL'] },
  { emoji: '📊', title: 'Data Scientist', growth: '+29%', color: '#34d399', tags: ['Statistics', 'Python', 'BI'] },
];

function TrendingCareersCard() {
  const [open, setOpen] = React.useState(null);
  return (
    <div className="rounded-3xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-2">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e879f9', boxShadow: '0 0 7px #e879f9', display: 'inline-block' }} />
          Trending Careers 2026
        </p>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">HOT 🔥</span>
      </div>
      <div className="space-y-3">
        {TRENDING_CAREERS.map((c, i) => (
          <button key={c.title} type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full group flex items-center gap-3 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] hover:border-pink-500/30 transition-all text-left">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${c.color}20`, border: `1px solid ${c.color}30` }}>
              {c.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate">{c.title}</h4>
              {open === i && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.tags.map(t => (
                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md border text-[var(--color-text-muted)] border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)]">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-bold shrink-0" style={{ color: c.color }}>{c.growth}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function pickQuestions({ bank, domains, count, seed }) {
  return seededShuffle(bank.filter(q => domains.includes(q.domain)), seed).slice(0, Math.min(count, bank.length));
}
function pickDomainsForInterest(interest) {
  return ({ tech: ['programming', 'tech', 'math'], design: ['communication', 'tech', 'programming'], business: ['business', 'communication', 'math'], health: ['helping', 'math', 'communication'], law: ['communication', 'business', 'helping'] })[interest] || ['programming', 'tech', 'communication'];
}
