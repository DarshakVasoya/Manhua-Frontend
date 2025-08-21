"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggleTheme: () => void; }
const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  useEffect(()=>{ const stored = localStorage.getItem('theme'); if(stored==='light'||stored==='dark') setTheme(stored as Theme); },[]);
  useEffect(()=>{ document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme); },[theme]);
  const toggleTheme = () => setTheme(t=> t==='dark' ? 'light' : 'dark');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export function useTheme(){ const ctx = useContext(ThemeContext); if(!ctx) throw new Error('useTheme must be used inside ThemeProvider'); return ctx; }
