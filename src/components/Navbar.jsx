import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useTheme } from "../theme/ThemeProvider";
import { getStreamsForGrade, INTERESTS } from "../data/careers";
import { loadAppState, saveAppState } from "../utils/storage";

/* ─────────────────────────────────────────────
   Styles
   ───────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');

  .nb-root {
    --accent:       #4FC3F7;
    --accent-dim:   rgba(79,195,247,0.15);
    --accent-glow:  rgba(79,195,247,0.3);
    --gold:         #F6C90E;
    --surface:      rgba(10,16,28,0.72);
    --surface-hov:  rgba(79,195,247,0.07);
    --border:       rgba(99,179,237,0.14);
    --border-hov:   rgba(99,179,237,0.32);
    --text:         #E8F0FE;
    --muted:        #7B8DB0;
    --dim:          #3D4F6B;
    --pdrop-bg:     rgba(8,13,24,0.97);
    --mobile-bg:    rgba(10,16,28,0.96);
    font-family: 'Raleway', sans-serif;
  }
  .nb-root.is-light {
    --accent:       #0288D1;
    --accent-dim:   rgba(2,136,209,0.1);
    --accent-glow:  rgba(2,136,209,0.2);
    --surface:      rgba(255,255,255,0.85);
    --surface-hov:  rgba(2,136,209,0.08);
    --border:       rgba(0,0,0,0.08);
    --border-hov:   rgba(0,0,0,0.15);
    --text:         #0F172A;
    --muted:        #475569;
    --dim:          #94A3B8;
    --pdrop-bg:     rgba(255,255,255,0.98);
    --mobile-bg:    rgba(255,255,255,0.98);
  }

  /* ── Fixed bar ── */
  .nb-bar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    padding: 12px 12px;
    transition: padding 0.3s ease;
  }
  .nb-bar.scrolled { padding: 8px 12px; }
  @media (min-width: 640px) {
    .nb-bar         { padding: 14px 20px; }
    .nb-bar.scrolled { padding: 8px 20px; }
  }

  /* ── Pill container ── */
  .nb-pill {
    width: 100%; max-width: 1280px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surface);
    backdrop-filter: blur(20px) saturate(1.6);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 10px 18px;
    box-shadow: 0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
    transition: border-color 0.3s, box-shadow 0.3s;
    position: relative;
    /* overflow:hidden removed so dropdown can escape */
    overflow: visible;
    flex-wrap: wrap; gap: 12px;
  }
  .nb-pill::before {
    content: '';
    position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
    background: linear-gradient(90deg,
      rgba(79,195,247,0.04) 0%,
      transparent 40%,
      rgba(246,201,14,0.02) 100%
    );
  }
  .nb-bar.scrolled .nb-pill {
    border-color: rgba(99,179,237,0.22);
    box-shadow: 0 8px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05);
  }

  /* Progress line */
  .nb-progress {
    position: absolute; bottom: 0; left: 0;
    height: 2px; pointer-events: none;
    background: linear-gradient(90deg, var(--accent), var(--gold));
    box-shadow: 0 0 12px var(--accent-glow);
    transition: width 0.15s ease;
    border-radius: 0 0 16px 16px;
  }

  /* ── Logo ── */
  .nb-logo {
    display: flex; align-items: center; gap: 9px;
    text-decoration: none; flex-shrink: 0;
  }
  .nb-logo-icon {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), #0288D1);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.95rem;
    box-shadow: 0 0 16px var(--accent-glow);
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .nb-logo:hover .nb-logo-icon {
    box-shadow: 0 0 26px var(--accent-glow);
    transform: rotate(-6deg) scale(1.08);
  }
  .nb-logo-text {
    font-family: 'Raleway', sans-serif;
    display: inline-flex; align-items: baseline;
    font-size: 1.9rem; font-weight: 900;
    letter-spacing: -0.02em; line-height: 1;
  }
  .nb-logo-text .brand-main   { color: var(--text); }
  .nb-logo-text .brand-accent {
    background: linear-gradient(135deg, #68d4ff 0%, #2aa7e2 80%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  @media (max-width: 640px) { .nb-logo-text { font-size: 1.3rem; } }

  /* ── Nav actions row ── */
  .nb-actions { display: flex; align-items: center; gap: 6px; }

  /* ── Nav link ── */
  .nb-link {
    position: relative;
    display: inline-flex; align-items: center;
    padding: 7px 13px; border-radius: 9px;
    font-size: 0.845rem; font-weight: 500; color: var(--muted);
    text-decoration: none; cursor: pointer; border: none;
    background: transparent;
    transition: color 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .nb-link:hover { color: var(--text); background: var(--surface-hov); }
  .nb-link.active { color: var(--accent); }
  .nb-link.active::after {
    content: '';
    position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
    width: 16px; height: 2px; border-radius: 2px;
    background: var(--accent);
    box-shadow: 0 0 8px var(--accent-glow);
  }

  /* ── Divider ── */
  .nb-divider {
    width: 1px; height: 18px;
    background: var(--border); flex-shrink: 0;
    margin: 0 4px;
  }

  /* ── Theme toggle ── */
  .nb-theme-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: 9px;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); font-size: 0.8rem; font-family: 'DM Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }
  .nb-theme-btn:hover { border-color: var(--border-hov); color: var(--text); background: var(--surface-hov); }
  .nb-theme-icon { width: 18px; height: 18px; position: relative; flex-shrink: 0; }
  .nb-theme-icon svg { position: absolute; inset: 0; transition: opacity 0.25s, transform 0.35s; }
  .nb-theme-icon .sun  { opacity: 1; transform: rotate(0deg) scale(1); }
  .nb-theme-icon .moon { opacity: 0; transform: rotate(-90deg) scale(0.6); }
  .nb-theme-btn.is-dark .nb-theme-icon .sun  { opacity: 0; transform: rotate(90deg) scale(0.6); }
  .nb-theme-btn.is-dark .nb-theme-icon .moon { opacity: 1; transform: rotate(0deg) scale(1); }
  .nb-theme-label { display: none; }
  @media (min-width: 640px) { .nb-theme-label { display: inline; } }

  /* ── CTA ── */
  .nb-cta {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent), #0288D1);
    color: #fff; font-size: 0.845rem; font-weight: 600;
    font-family: 'Raleway', sans-serif;
    text-decoration: none; border: none; cursor: pointer;
    box-shadow: 0 0 22px rgba(79,195,247,0.28);
    transition: all 0.22s; white-space: nowrap;
  }
  .nb-cta:hover  { transform: translateY(-2px); box-shadow: 0 0 34px rgba(79,195,247,0.45); }
  .nb-cta:active { transform: translateY(0); }

  /* ── Sign-out button ── */
  .nb-logout {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 9px;
    background: transparent; border: 1px solid var(--border);
    color: var(--muted); font-size: 0.83rem; font-weight: 500;
    font-family: 'Raleway', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .nb-logout:hover { border-color: rgba(252,129,129,0.35); color: #FC8181; background: rgba(252,129,129,0.07); }

  /* ══════════════════════════════════════
     USER CHIP  (clickable)
     ══════════════════════════════════════ */
  .nb-user {
    display: flex; align-items: center; gap: 8px;
    padding: 4px 10px 4px 4px;
    background: var(--surface-hov); border: 1px solid var(--border);
    border-radius: 40px; cursor: pointer; position: relative;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    user-select: none; flex-shrink: 0;
  }
  .nb-user:hover {
    border-color: var(--border-hov);
    background: rgba(79,195,247,0.1);
  }
  .nb-user.chip-open {
    border-color: var(--accent);
    background: rgba(79,195,247,0.1);
    box-shadow: 0 0 0 3px rgba(79,195,247,0.12);
  }

  .nb-avatar {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), #0288D1);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; color: #fff; letter-spacing: 0;
    box-shadow: 0 0 10px rgba(79,195,247,0.25);
  }

  .nb-username {
    font-size: 0.8rem; color: var(--muted); max-width: 90px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    transition: color 0.2s;
  }
  .nb-user:hover .nb-username,
  .nb-user.chip-open .nb-username { color: var(--text); }

  .nb-chip-caret {
    width: 13px; height: 13px; flex-shrink: 0;
    color: var(--dim); transition: transform 0.22s, color 0.2s;
  }
  .nb-user:hover .nb-chip-caret          { color: var(--muted); }
  .nb-user.chip-open .nb-chip-caret      { transform: rotate(180deg); color: var(--accent); }

  /* ══════════════════════════════════════
     PROFILE DROPDOWN PANEL
     ══════════════════════════════════════ */
  .nb-pdrop-wrap {
    position: absolute; top: calc(100% + 12px); right: 0;
    z-index: 300;
  }
  .nb-pdrop {
    width: 340px;
    background: var(--pdrop-bg);
    border: 1px solid rgba(79,195,247,0.18);
    border-radius: 20px;
    box-shadow:
      0 0 0 1px rgba(79,195,247,0.05),
      0 32px 80px rgba(0,0,0,0.7);
    backdrop-filter: blur(28px);
    overflow: hidden;
    animation: pdropIn 0.22s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes pdropIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @media (max-width: 640px) {
    .nb-pdrop { width: calc(100vw - 36px); }
  }

  /* Panel header */
  .nb-pd-head {
    display: flex; align-items: center; gap: 13px;
    padding: 16px 18px 15px;
    background: linear-gradient(135deg,
      rgba(79,195,247,0.07) 0%,
      rgba(79,195,247,0.02) 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .nb-pd-av {
    width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), #0288D1);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.05rem; font-weight: 700; color: #fff;
    box-shadow: 0 0 16px rgba(79,195,247,0.3);
  }
  .nb-pd-info { min-width: 0; flex: 1; }
  .nb-pd-name  { font-size: 0.9rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nb-pd-email { font-size: 0.74rem; color: var(--muted); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nb-pd-badge {
    flex-shrink: 0;
    font-size: 0.63rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 20px;
    background: rgba(79,195,247,0.1); border: 1px solid rgba(79,195,247,0.2);
    color: var(--accent);
  }

  /* Panel form body */
  .nb-pd-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 13px; }
  .nb-pd-sect-label {
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--dim);
    padding-bottom: 2px;
  }

  /* Field */
  .nb-pf  { display: flex; flex-direction: column; gap: 4px; }
  .nb-pfl { font-size: 0.68rem; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); }
  .nb-pfi {
    width: 100%; padding: 8px 11px; border-radius: 9px; box-sizing: border-box;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
    color: var(--text); font-size: 0.83rem; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .nb-pfi::placeholder { color: var(--dim); }
  .nb-pfi:focus { border-color: rgba(79,195,247,0.5); box-shadow: 0 0 0 2.5px rgba(79,195,247,0.12); }
  .nb-pfi option { background: var(--surface); color: var(--text); }

  .nb-pgrid2 { display: grid; grid-template-columns: 1fr 1fr;     gap: 10px; }
  .nb-pgrid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }

  /* Actions */
  .nb-pd-actions { display: flex; align-items: center; gap: 8px; padding-top: 2px; }
  .nb-pd-save {
    flex: 1; padding: 9px 0; border-radius: 9px;
    background: linear-gradient(135deg, var(--accent), #0288D1);
    color: #fff; font-size: 0.84rem; font-weight: 600;
    font-family: 'Raleway', sans-serif; border: none; cursor: pointer;
    box-shadow: 0 0 16px rgba(79,195,247,0.22);
    transition: opacity 0.18s, transform 0.18s;
  }
  .nb-pd-save:hover  { opacity: 0.88; transform: translateY(-1px); }
  .nb-pd-save:active { transform: translateY(0); opacity: 1; }
  .nb-pd-cancel {
    padding: 9px 14px; border-radius: 9px; cursor: pointer;
    background: transparent; border: 1px solid rgba(255,255,255,0.1);
    color: var(--muted); font-size: 0.84rem; font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
  }
  .nb-pd-cancel:hover { color: var(--text); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }

  /* Saved toast */
  .nb-pd-toast {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: 9px;
    background: rgba(72,187,120,0.1); border: 1px solid rgba(72,187,120,0.22);
    color: #68d391; font-size: 0.82rem; font-weight: 500;
    animation: pdropIn 0.2s ease;
  }

  /* ── Mobile hamburger ── */
  .nb-hamburger {
    display: none; flex-direction: column; gap: 4px;
    width: 32px; height: 32px; padding: 6px; border-radius: 8px;
    background: transparent; border: 1px solid var(--border);
    cursor: pointer; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  .nb-hamburger:hover { background: var(--surface-hov); border-color: var(--border-hov); }
  .nb-hamburger span {
    display: block; width: 16px; height: 1.5px;
    background: var(--muted); border-radius: 2px;
    transition: all 0.25s cubic-bezier(0.16,1,0.3,1);
    transform-origin: center;
  }
  .nb-hamburger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg);  background: var(--accent); }
  .nb-hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nb-hamburger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); background: var(--accent); }

  @media (max-width: 640px) {
    .nb-desktop   { display: none !important; }
    .nb-hamburger { display: flex; }
    .nb-pdrop-wrap { right: -12px; }
  }

  /* ── Mobile dropdown ── */
  .nb-mobile-menu {
    position: absolute; top: calc(100% + 10px); left: 0; right: 0;
    background: var(--mobile-bg); backdrop-filter: blur(20px);
    border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
    animation: nbMenuIn 0.22s cubic-bezier(0.16,1,0.3,1);
    z-index: 10; box-shadow: 0 16px 50px rgba(0,0,0,0.5);
  }
  @keyframes nbMenuIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }
  .nb-mobile-item {
    display: flex; align-items: center; gap: 10px;
    padding: 13px 18px; text-decoration: none; border: none;
    background: transparent; width: 100%;
    font-size: 0.9rem; font-weight: 500; color: var(--muted);
    font-family: 'Raleway', sans-serif; cursor: pointer;
    transition: all 0.15s; text-align: left;
    border-bottom: 1px solid var(--border);
  }
  .nb-mobile-item:last-child { border-bottom: none; }
  .nb-mobile-item:hover  { background: var(--surface-hov); color: var(--text); }
  .nb-mobile-item.active { color: var(--accent); background: rgba(79,195,247,0.05); }
  .nb-mobile-item.cta    { color: var(--accent); font-weight: 600; }
  .nb-mobile-item.danger:hover { color: #FC8181; background: rgba(252,129,129,0.07); }
  .nb-mobile-icon { font-size: 1rem; flex-shrink: 0; width: 20px; text-align: center; }
`;

/* ─────────────────────────────────────────────
   SVG icons
   ───────────────────────────────────────────── */
const SunIcon = () => (
  <svg className="sun" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />  <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /> <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);
const MoonIcon = () => (
  <svg className="moon" width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CaretIcon = () => (
  <svg className="nb-chip-caret" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─────────────────────────────────────────────
   Tiny form-field helpers (only used in panel)
   ───────────────────────────────────────────── */
const Fi = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="nb-pf">
    <span className="nb-pfl">{label}</span>
    <input
      type={type} value={value} placeholder={placeholder || label}
      onChange={e => onChange(e.target.value)}
      className="nb-pfi"
    />
  </div>
);
const Fs = ({ label, value, onChange, options }) => (
  <div className="nb-pf">
    <span className="nb-pfl">{label}</span>
    <select value={value} onChange={e => onChange(e.target.value)} className="nb-pfi" style={{ cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

/* ─────────────────────────────────────────────
   Profile dropdown panel
   ───────────────────────────────────────────── */
function ProfileDropdown({ user, onClose }) {
  const existing = loadAppState(user?.id) || {};
  const sp = existing.profile || {};

  const [form, setForm] = useState({
    name: sp.name || user?.name || '',
    email: sp.email || user?.email || '',
    mobile: sp.mobile || '',
    city: sp.city || '',
    grade: sp.grade || '12',
    stream: sp.stream || 'science',
    interest: sp.interest || 'tech',
    targetYear: sp.targetYear || '',
    department: sp.department || 'Management',
    subject: sp.subject || 'Computer Science',
  });
  const [saved, setSaved] = useState(false);

  const set = key => val => setForm(f => ({ ...f, [key]: val }));
  const streamOpts = getStreamsForGrade(form.grade);
  const initial = (form.name || user?.email || 'U')[0].toUpperCase();

  const handleSave = () => {
    saveAppState(user?.id, { ...existing, profile: { ...sp, ...form } });
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1400);
  };

  return (
    <div className="nb-pdrop-wrap">
      <div className="nb-pdrop">

        {/* ── Header ── */}
        <div className="nb-pd-head">
          <div className="nb-pd-av">{initial}</div>
          <div className="nb-pd-info">
            <p className="nb-pd-name">{form.name || 'Student'}</p>
            <p className="nb-pd-email">{form.email || 'No email set'}</p>
          </div>
          <span className="nb-pd-badge">
            {user?.role ? user.role.toUpperCase() : 'STUDENT'}
          </span>
        </div>

        {/* ── Form ── */}
        <div className="nb-pd-body">
          <p className="nb-pd-sect-label">Edit profile</p>

          <div className="nb-pgrid2">
            <Fi label="Full name" value={form.name} onChange={set('name')} />
            <Fi label="Mobile" value={form.mobile} onChange={set('mobile')} placeholder="+91 …" />
          </div>

          <div className="nb-pgrid2">
            <Fi label="Email" type="email" value={form.email} onChange={set('email')} />
            <Fi label="City" value={form.city} onChange={set('city')} />
          </div>

          {user?.role === 'admin' ? (
            <div className="nb-pgrid2">
              <Fs label="Department" value={form.department} onChange={set('department')}
                options={[
                  { value: 'Management', label: 'Management' },
                  { value: 'IT Operations', label: 'IT Operations' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Administration', label: 'Administration' }
                ]} />
            </div>
          ) : user?.role === 'teacher' ? (
            <div className="nb-pgrid2">
              <Fs label="Subject Specialty" value={form.subject} onChange={set('subject')}
                options={[
                  { value: 'Computer Science', label: 'Computer Science' },
                  { value: 'Mathematics', label: 'Mathematics' },
                  { value: 'Physics', label: 'Physics' },
                  { value: 'Chemistry', label: 'Chemistry' },
                  { value: 'Biology', label: 'Biology' },
                  { value: 'English', label: 'English' }
                ]} />
            </div>
          ) : (
            <>
              <div className="nb-pgrid2">
                <Fi label="Target year" value={form.targetYear} onChange={set('targetYear')} placeholder="2025" />
                <Fs label="Interest" value={form.interest} onChange={set('interest')}
                  options={INTERESTS.map(i => ({ value: i.value, label: i.label }))} />
              </div>

              <div className="nb-pgrid3">
                <Fs label="Grade" value={form.grade}
                  onChange={v => {
                    const ns = getStreamsForGrade(v)[0]?.value || 'science';
                    setForm(f => ({ ...f, grade: v, stream: ns }));
                  }}
                  options={[
                    { value: '10', label: 'Class 10' },
                    { value: '12', label: 'Class 12' },
                    { value: 'grad', label: 'Graduation' },
                  ]}
                />
                <Fs label="Stream" value={form.stream} onChange={set('stream')}
                  options={streamOpts.map(s => ({ value: s.value, label: s.label }))} />
                <Fs label="Interest" value={form.interest} onChange={set('interest')}
                  options={INTERESTS.map(i => ({ value: i.value, label: i.label }))} />
              </div>
            </>
          )}

          {saved ? (
            <div className="nb-pd-toast">
              <CheckIcon /> Profile saved!
            </div>
          ) : (
            <div className="nb-pd-actions">
              <button type="button" className="nb-pd-cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="nb-pd-save" onClick={handleSave}>Save changes</button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────── */
export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const menuRef = useRef(null);   // pill — for mobile outside-click
  const profileRef = useRef(null);   // user chip + panel — for profile outside-click

  /* ── Scroll tracking ── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(docH > 0 ? Math.min((y / docH) * 100, 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ── Close mobile menu on outside click ── */
  useEffect(() => {
    if (!mobileOpen) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMobileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [mobileOpen]);

  /* ── Close profile panel on outside click ── */
  useEffect(() => {
    if (!profileOpen) return;
    const h = e => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  const isActive = path => location.pathname === path;

  const storedProfile = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem(`careercompass:v1:${user?.id?.toLowerCase()}`) || '{}')?.profile) : null;
  const displayName = storedProfile?.name || user?.name || user?.email || 'Student';
  const initial = displayName[0].toUpperCase();

  const handleLogout = async () => {
    setMobileOpen(false);
    setProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <style>{css}</style>
      <div className={`nb-root ${!isDark ? 'is-light' : ''}`}>
        <nav className={`nb-bar${scrolled ? ' scrolled' : ''}`}>
          <div className="nb-pill" ref={menuRef}>

            {/* Scroll progress */}
            <div className="nb-progress" style={{ width: `${scrollPct}%` }} />

            {/* ── Logo ── */}
            <Link to="/" className="nb-logo">
              <div className="nb-logo-icon">🧭</div>
              <span className="nb-logo-text">
                <span className="brand-main">Career</span>
                <span className="brand-accent">Compass</span>
              </span>
            </Link>

            {/* ── Desktop actions ── */}
            <div className="nb-actions nb-desktop">

              {/* Theme toggle */}
              <button type="button"
                className={`nb-theme-btn${isDark ? ' is-dark' : ''}`}
                onClick={toggleTheme} aria-label="Toggle theme">
                <div className="nb-theme-icon"><SunIcon /><MoonIcon /></div>
                <span className="nb-theme-label">{isDark ? 'Dark' : 'Light'}</span>
              </button>

              <div className="nb-divider" />

              {/* Links */}
              {user?.role !== 'admin' && user?.role !== 'teacher' && (
                <Link to="/" className={`nb-link${isActive('/') ? ' active' : ''}`}>Home</Link>
              )}

              {!isAuthenticated ? (
                <>
                  <Link to="/login" className={`nb-link${isActive('/login') ? ' active' : ''}`}>Sign in</Link>
                  <div className="nb-divider" />
                  <Link to="/register" className="nb-cta">Get started →</Link>
                </>
              ) : (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className={`nb-link${isActive('/admin') ? ' active' : ''}`}>Admin Panel</Link>
                  )}
                  {user?.role === 'teacher' && (
                    <Link to="/teacher" className={`nb-link${isActive('/teacher') ? ' active' : ''}`}>Teacher Panel</Link>
                  )}
                  <div className="nb-divider" />

                  {/* ── Clickable user chip ── */}
                  <div ref={profileRef} style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`nb-user${profileOpen ? ' chip-open' : ''}`}
                      onClick={() => setProfileOpen(o => !o)}
                      aria-label="Open profile settings"
                      aria-expanded={profileOpen}
                      aria-haspopup="true"
                    >
                      <div className="nb-avatar">{initial}</div>
                      <span className="nb-username">{displayName}</span>
                      <CaretIcon />
                    </button>

                    {profileOpen && (
                      <ProfileDropdown user={user} onClose={() => setProfileOpen(false)} />
                    )}
                  </div>

                  <button type="button" className="nb-logout" onClick={handleLogout}>
                    Sign out
                  </button>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button type="button"
              className={`nb-hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu" aria-expanded={mobileOpen}>
              <span /><span /><span />
            </button>

            {/* ── Mobile dropdown ── */}
            {mobileOpen && (
              <div className="nb-mobile-menu">
                {user?.role !== 'admin' && user?.role !== 'teacher' && (
                  <Link to="/" className={`nb-mobile-item${isActive('/') ? ' active' : ''}`}>
                    <span className="nb-mobile-icon">🏠</span> Home
                  </Link>
                )}



                <button type="button" className="nb-mobile-item"
                  onClick={() => { toggleTheme(); setMobileOpen(false); }}>
                  <span className="nb-mobile-icon">{isDark ? '☀️' : '🌙'}</span>
                  Switch to {isDark ? 'light' : 'dark'} mode
                </button>

                {!isAuthenticated ? (
                  <>
                    <Link to="/login" className={`nb-mobile-item${isActive('/login') ? ' active' : ''}`}>
                      <span className="nb-mobile-icon">🔑</span> Sign in
                    </Link>
                    <Link to="/register" className="nb-mobile-item cta">
                      <span className="nb-mobile-icon">✦</span> Create account
                    </Link>
                  </>
                ) : (
                  <>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className={`nb-mobile-item${isActive('/admin') ? ' active' : ''}`}>
                        <span className="nb-mobile-icon">🛡️</span> Admin Panel
                      </Link>
                    )}
                    {user?.role === 'teacher' && (
                      <Link to="/teacher" className={`nb-mobile-item${isActive('/teacher') ? ' active' : ''}`}>
                        <span className="nb-mobile-icon">📚</span> Teacher Panel
                      </Link>
                    )}
                    {/* Mobile: tap username to open profile panel */}
                    <button type="button" className="nb-mobile-item"
                      onClick={() => { setMobileOpen(false); setProfileOpen(true); }}>
                      <span className="nb-mobile-icon">👤</span>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                        {displayName}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted)' }}>
                        Edit profile →
                      </span>
                    </button>
                    <button type="button" className="nb-mobile-item danger" onClick={handleLogout}>
                      <span className="nb-mobile-icon">🚪</span> Sign out
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </nav>
      </div>
    </>
  );
}
