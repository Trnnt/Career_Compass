import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, loadSession, loginUser, loginTeacher, loginAdmin, registerUser, saveSession } from './auth';
import { loadOwnerSession, ownerLogin, ownerLogout } from './ownerAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = loadSession();
    if (session?.user) {
      setUser(session.user);
    } else {
      const oSession = loadOwnerSession();
      if (oSession) setUser({ id: 'owner', name: 'Admin', email: oSession.email, role: 'admin' });
    }
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      register: async (payload) => {
        const u = registerUser(payload);
        setUser(u);
        saveSession({ user: u });
        return u;
      },
      login: async (payload) => {
        const u = loginUser(payload);
        setUser(u);
        saveSession({ user: u });
        return u;
      },
      loginTeacher: async (payload) => {
        const u = loginTeacher(payload);
        setUser(u);
        saveSession({ user: u });
        return u;
      },
      loginAdmin: async (payload) => {
        const u = loginAdmin(payload);
        setUser(u);
        saveSession({ user: u });
        return u;
      },
      loginOwner: async (payload) => {
        const oSession = ownerLogin(payload);
        const u = { id: 'owner', name: 'Admin', email: oSession.email, role: 'admin' };
        setUser(u);
        // Do not call saveSession here; ownerAuth manages its own token.
        return u;
      },
      logout: async () => {
        setUser(null);
        clearSession();
        ownerLogout();
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

