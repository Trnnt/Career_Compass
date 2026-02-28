import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Monitor, Cpu, Code, Database, Globe, GraduationCap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme();

  // Floating background icons configuration
  const floatingIcons = [
    { Icon: BookOpen, top: '10%', left: '8%', delay: 0, size: 64 },
    { Icon: Monitor, top: '20%', right: '10%', delay: 1.5, size: 72 },
    { Icon: Cpu, bottom: '15%', left: '12%', delay: 2.2, size: 56 },
    { Icon: Code, bottom: '25%', right: '8%', delay: 0.8, size: 60 },
    { Icon: Database, top: '40%', left: '4%', delay: 3, size: 50 },
    { Icon: Globe, top: '60%', right: '4%', delay: 1.8, size: 80 },
    { Icon: GraduationCap, top: '5%', right: '40%', delay: 2.5, size: 55 },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-14 overflow-hidden bg-[var(--bg-page)] text-[var(--color-text-primary)]">

      {/* Animated Background Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingIcons.map((item, i) => (
          <motion.div
            key={i}
            initial={{ y: 0, opacity: 0 }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: item.delay,
              ease: "easeInOut"
            }}
            className="absolute text-indigo-600/30 dark:text-indigo-300/20"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
          >
            <item.Icon size={item.size} strokeWidth={1.5} />
          </motion.div>
        ))}
      </div>

      {/* Theme Toggle Button removed as requested */}

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl rounded-[28px] bg-[var(--color-surface-soft)] backdrop-blur-xl shadow-[var(--shadow-strong)] overflow-hidden"
      >
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-all"
          title="Toggle Theme"
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="px-8 pt-8 pb-6">
          <p className="text-sm font-semibold tracking-widest text-[var(--color-text-muted)] uppercase">CareerCompass</p>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mt-1">Welcome</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Sign in to continue, or create an account to save your marks and weekly test history.
          </p>
        </div>
        <div className="px-8 py-7">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
}

