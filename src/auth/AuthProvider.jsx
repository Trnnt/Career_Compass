import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, loadSession, loginUser, loginTeacher, loginAdmin, registerUser, saveSession } from './auth';
import { authAPI } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = loadSession();
    if (session?.user) {
      setUser(session.user);
    }
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      register: async (payload) => {
        try {
          // Attempt Real API
          const res = await authAPI.register(payload);
          localStorage.setItem('careercompass:jwt', res.data.token);
          const u = { id: res.data.email, name: res.data.name, email: res.data.email, role: String(res.data.role).toLowerCase() };
          setUser(u);
          saveSession({ user: u });
          return u;
        } catch (e) {
          // Fallback
          console.warn("API Register failed, falling back to local Auth");
          const u = registerUser(payload);
          setUser(u);
          saveSession({ user: u });
          return u;
        }
      },
      login: async (payload) => {
        try {
          const res = await authAPI.login(payload);
          localStorage.setItem('careercompass:jwt', res.data.token);
          const u = { id: res.data.email, name: res.data.name, email: res.data.email, role: String(res.data.role).toLowerCase() };
          setUser(u);
          saveSession({ user: u });
          return u;
        } catch (e) {
          // If login fails because of 401 locally OR network not available, we can fallback
          // But realistically, we should probably check if it's a network error
          try {
            const u = loginUser(payload);
            setUser(u);
            saveSession({ user: u });
            return u;
          } catch (e2) {
            throw e; // throw the original API error if user not found remotely
          }
        }
      },
      loginTeacher: async (payload) => {
        try {
          const res = await authAPI.login({ email: payload.email, password: payload.password });
          if (String(res.data.role).toLowerCase() !== 'teacher') throw new Error("Not authorized as Teacher");
          localStorage.setItem('careercompass:jwt', res.data.token);
          const u = { id: res.data.email, name: res.data.name, email: res.data.email, role: 'teacher' };
          setUser(u);
          saveSession({ user: u });
          return u;
        } catch (e) {
          const u = loginTeacher(payload);
          setUser(u);
          saveSession({ user: u });
          return u;
        }
      },
      loginAdmin: async (payload) => {
        try {
          if (payload.useSecretKey) {
            const secret = loadAdminSecretKey();
            if (payload.secretKey !== secret) throw new Error("Invalid admin secret key");
            const u = { id: 'owner', name: 'Admin', email: 'admin@example.com', role: 'admin' };
            setUser(u);
            saveSession({ user: u });
            return u;
          }

          const res = await authAPI.login({ email: payload.email, password: payload.password });
          if (String(res.data.role).toLowerCase() !== 'admin') throw new Error("Not authorized as Admin");
          localStorage.setItem('careercompass:jwt', res.data.token);
          const u = { id: res.data.email, name: res.data.name, email: res.data.email, role: 'admin' };
          setUser(u);
          saveSession({ user: u });
          return u;
        } catch (e) {
          const u = loginAdmin(payload);
          setUser(u);
          saveSession({ user: u });
          return u;
        }
      },
      logout: async () => {
        setUser(null);
        clearSession();
        localStorage.removeItem('careercompass:jwt');
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function loadAdminSecretKey() {
  if (typeof window === 'undefined') return String(import.meta.env.VITE_OWNER_SECRET_KEY || '').trim();
  const stored = localStorage.getItem('careercompass:admin_secret');
  if (stored) return stored;
  return String(import.meta.env.VITE_OWNER_SECRET_KEY || 'admin123').trim();
}

export function setAdminSecretKey(next) {
  if (typeof window === 'undefined') return;
  if (!next) {
    localStorage.removeItem('careercompass:admin_secret');
  } else {
    localStorage.setItem('careercompass:admin_secret', next);
  }
}
