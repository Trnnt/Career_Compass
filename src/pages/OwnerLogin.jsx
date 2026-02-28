import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  getOwnerEmail,
  getOwnerSecurityState,
  isOwnerAuthenticated,
  loadOwnerSecretKey,
  ownerLogin,
} from '../auth/ownerAuth';

export default function OwnerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [mode, setMode] = useState('credentials');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const security = useMemo(() => getOwnerSecurityState(), [busy, error]);
  const secretConfigured = useMemo(() => Boolean(loadOwnerSecretKey()), []);

  if (isOwnerAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      ownerLogin({
        email,
        password,
        secretKey,
        useSecretKey: mode === 'secret',
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || 'Owner login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-14">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_30px_120px_rgba(0,0,0,0.6)] overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-white/10">
          <p className="text-sm text-white/60">CareerCompass Owner Access</p>
          <h1 className="text-2xl font-semibold text-white mt-1">Owner Login</h1>
          <p className="text-sm text-white/60 mt-2">
            Admin panel is protected and only the owner account can access it.
          </p>
        </div>
        <div className="px-8 py-7 space-y-4">
          <div className="flex gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode('credentials')}
              className={`flex-1 rounded-full px-3 py-1 border ${
                mode === 'credentials'
                  ? 'border-indigo-400 bg-indigo-500/20 text-white'
                  : 'border-white/10 text-white/60'
              }`}
            >
              Credentials
            </button>
            <button
              type="button"
              onClick={() => setMode('secret')}
              className={`flex-1 rounded-full px-3 py-1 border ${
                mode === 'secret'
                  ? 'border-emerald-400 bg-emerald-500/20 text-white'
                  : 'border-white/10 text-white/60'
              }`}
            >
              Secret key
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'credentials' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Owner email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder={getOwnerEmail()}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
                />
              </div>
            )}
            {mode === 'credentials' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Owner password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  placeholder="Owner password"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
                />
              </div>
            )}
            {mode === 'secret' && (
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">Secret key</label>
                <input
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  type="password"
                  required
                  placeholder={secretConfigured ? 'Enter secret key' : 'Set secret key in admin panel'}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                />
                <p className="text-xs text-white/50 mt-2">
                  Use the secret key when you prefer quick access without retyping owner credentials.
                </p>
              </div>
            )}

            {security.isLocked ? (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                Owner login is temporarily locked due to failed attempts.
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy || security.isLocked}
              className="w-full px-5 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-60 transition"
            >
              {busy ? 'Verifying...' : 'Enter admin panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
