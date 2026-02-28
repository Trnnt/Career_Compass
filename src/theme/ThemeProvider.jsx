import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_KEY = 'careercompass:theme';
const ThemeContext = createContext(null);

function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  const root = document.documentElement;
  root.setAttribute('data-theme', t);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    let initial = 'light';
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_KEY) : null;
    if (stored === 'dark' || stored === 'light') {
      initial = stored;
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      initial = 'dark';
    }
    setTheme(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (!theme) return;
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

