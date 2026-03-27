import { Moon, Sun } from 'lucide-react';
import { API_MODE } from '@/services/api';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const THEME_KEY = 'rms_theme';

export function Topbar() {
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs text-slate-500">System Status</p>
        <p className="text-sm font-medium text-emerald-600">Operational · {API_MODE.toUpperCase()} MODE</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary">operator</Button>
        <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
