import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeCtx { theme: Theme; toggle: () => void; isDark: boolean }

const Ctx = createContext<ThemeCtx>({ theme: 'light', toggle: () => {}, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return (sessionStorage.getItem('aduana-theme') as Theme) || 'light'; } catch { return 'light'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { sessionStorage.setItem('aduana-theme', theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return <Ctx.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
