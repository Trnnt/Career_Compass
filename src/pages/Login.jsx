import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { TEACHER_EMAILS } from '../data/teachers';
import { Sun as IconSun, Moon as IconMoon, BookOpen, Monitor, Cpu, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../theme/ThemeProvider';

// Background Particles Component
function TechCanvas({ isDark }) {
  const iconProps = { size: 32, strokeWidth: 1.5, opacity: isDark ? 0.15 : 0.3, color: isDark ? '#ffffff' : '#4f46e5' };

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div initial={{ y: -50, x: -50, rotate: 0 }} animate={{ y: '100vh', x: '20vw', rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute top-10 left-10">
        <BookOpen {...iconProps} />
      </motion.div>
      <motion.div initial={{ y: '100vh', x: '80vw', rotate: 0 }} animate={{ y: -50, x: '50vw', rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }} className="absolute bottom-10 right-10">
        <Monitor {...iconProps} size={48} />
      </motion.div>
      <motion.div initial={{ y: '50vh', x: -50, rotate: 0 }} animate={{ y: '20vh', x: '100vw', rotate: 360 }} transition={{ duration: 45, repeat: Infinity, ease: 'linear' }} className="absolute top-[40%] left-0">
        <Cpu {...iconProps} />
      </motion.div>
      <motion.div initial={{ y: -50, x: '70vw', rotate: 0 }} animate={{ y: '100vh', x: '40vw', rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: 'linear' }} className="absolute top-0 right-[20%]">
        <Code {...iconProps} size={40} />
      </motion.div>
    </div>
  );
}

export default function Login() {
  const { login, loginTeacher, loginAdmin, loginOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [role, setRole] = useState(location.state?.role || 'student'); // 'student', 'teacher', or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [useSecretKey, setUseSecretKey] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { isDark } = useTheme();

  // Dynamic theme and role-based colors
  const theme = {
    dark: {
      bg: '#0f1117',
      text: '#ffffff',
      meshA: 'rgba(99, 102, 241, 0.15)',
      meshB: 'rgba(168, 85, 247, 0.15)',
      meshC: 'rgba(16, 185, 129, 0.1)'
    },
    light: {
      bg: '#f8fafc',
      text: '#0f172a',
      meshA: 'rgba(99, 102, 241, 0.15)',
      meshB: 'rgba(168, 85, 247, 0.15)',
      meshC: 'rgba(16, 185, 129, 0.1)'
    },
  };
  const t = isDark ? theme.dark : theme.light;

  const roleConfig = {
    student: {
      id: 'student',
      name: 'Student',
      accent: '#6366f1', // indigo-500
      glow: isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.3)',
      description: 'Access your learning dashboard',
    },
    teacher: {
      id: 'teacher',
      name: 'Teacher',
      accent: '#22c55e', // green-500
      glow: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(21, 128, 61, 0.3)',
      description: 'Manage classes and students',
    },
    admin: {
      id: 'admin',
      name: 'Admin',
      accent: '#ef4444', // red-500
      glow: isDark ? 'rgba(239, 68, 68, 0.4)' : 'rgba(185, 28, 28, 0.3)',
      description: 'Platform configuration and oversight',
    },
  };
  const roleCfg = roleConfig[role];
  const roleAccent = roleCfg.accent;
  const roleGlow = roleCfg.glow;

  // Auto-fill demo credentials
  useEffect(() => {
    if (role === 'admin' && !useSecretKey) {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmail('teacher@school.com');
      setPassword('teacher123');
    } else if (role === 'student') {
      setEmail('');
      setPassword('');
    }
  }, [role, useSecretKey]);

  // Inject dynamic styles
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.id = 'login-dynamic-styles';
    styleTag.innerHTML = `
      .lgn-form-container {
        width: 100%;
        display: flex; flex-direction: column; gap: 24px;
        animation: lgnFadeIn 0.4s ease-out both;
      }
      @keyframes lgnFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, [t]);


  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (role === 'teacher') {
        await loginTeacher({ email, password });
        navigate('/teacher', { replace: true });
      } else if (role === 'admin') {
        if (useSecretKey) {
          await loginAdmin({ secretKey, useSecretKey: true });
        } else {
          await loginAdmin({ email, password });
        }
        navigate('/admin', { replace: true });
      } else {
        await login({ email, password });
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lgn-form-container" style={{ fontFamily: "'Inter', sans-serif" }}>


      {/* Role tabs styling matches the user screenshot */}
      <div className="flex p-1.5 rounded-2xl" style={{ background: isDark ? '#1a1c23' : '#e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        {Object.values(roleConfig).map((r) => {
          const isActive = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => { setRole(r.id); setError(''); }}
              className={`flex-1 py-3 text-[15px] font-bold rounded-xl transition-all duration-300 ${isActive ? 'text-white shadow-lg' : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
              style={{
                background: isActive ? r.accent : 'transparent',
              }}
            >
              {r.name}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {role === 'admin' && (
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5 mb-4">
            <button
              type="button"
              onClick={() => setUseSecretKey(false)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              style={{ background: !useSecretKey ? (isDark ? '#2a2c38' : '#cbd5e1') : 'transparent', color: !useSecretKey ? t.text : '#94a3b8' }}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setUseSecretKey(true)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors"
              style={{ background: useSecretKey ? (isDark ? '#2a2c38' : '#cbd5e1') : 'transparent', color: useSecretKey ? t.text : '#94a3b8' }}
            >
              Secret Key
            </button>
          </div>
        )}

        {role === 'admin' && useSecretKey ? (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium" style={{ color: t.text }}>Secret Key</label>
            <input
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              type="password"
              required
              placeholder="Enter admin secret key"
              className="w-full px-4 py-4 rounded-xl outline-none transition-all duration-200 font-medium"
              style={{
                background: isDark ? '#282a36' : '#ffffff',
                color: t.text,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'}`,
                boxShadow: isDark ? 'auto' : '0 2px 4px rgba(0,0,0,0.02)'
              }}
              onFocus={(e) => { e.target.style.borderColor = roleAccent; }}
              onBlur={(e) => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'; }}
            />
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="block text-[15px] font-medium" style={{ color: t.text }}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder={role === 'teacher' ? "teacher@school.com" : role === 'admin' ? "admin@example.com" : "student@example.com"}
                className="w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 font-medium text-[15px]"
                style={{
                  background: isDark ? '#292b36' : '#ffffff',
                  color: t.text,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: isDark ? 'auto' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => { e.target.style.borderColor = roleAccent; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)'; }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[15px] font-medium" style={{ color: t.text }}>Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-4 rounded-2xl outline-none transition-all duration-200 font-bold text-lg tracking-widest"
                style={{
                  background: isDark ? '#292b36' : '#ffffff',
                  color: t.text,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)'}`,
                  boxShadow: isDark ? 'auto' : '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onFocus={(e) => { e.target.style.borderColor = roleAccent; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.1)'; }}
              />
            </div>
          </>
        )}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-4 py-4 rounded-2xl text-white font-bold text-[17px] hover:opacity-90 disabled:opacity-60 transition-all active:scale-[0.98]"
          style={{ background: roleAccent, boxShadow: `0 8px 24px ${roleGlow}` }}
        >
          {busy ? 'Verifying...' : `Sign in as ${role === 'admin' && useSecretKey ? 'Admin (Key)' : roleCfg.name}`}
        </button>
      </form>

      {role === 'student' && (
        <div className="mt-6 text-center">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' }} />
            <span className="text-[13px] font-medium" style={{ color: isDark ? '#4B5563' : '#94A3B8' }}>
              New to CareerCompass?
            </span>
            <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)' }} />
          </div>
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-[15px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
              border: `1.5px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.25)'}`,
              color: isDark ? '#a5b4fc' : '#4f46e5',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Create new account
          </Link>
        </div>
      )}
    </div>
  );
}