import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register({ name, email, password, role });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            required
            placeholder="e.g. Neeraj"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={4}
            placeholder="Create a password"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/35 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition"
          />
          <p className="text-xs text-white/40 mt-2">Demo app: password is stored locally in your browser.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="w-full px-5 py-3 rounded-xl bg-indigo-500 text-white font-semibold hover:bg-indigo-600 disabled:opacity-60 transition"
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-300 hover:text-indigo-200 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}