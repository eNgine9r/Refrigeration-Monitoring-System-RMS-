import { Bell, Moon, Search, Sun } from 'lucide-react';
import { API_MODE } from '@/services/api';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const THEME_KEY = 'rms_theme';

export function Topbar() {
  const { logout } = useAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/70 px-6 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-app-success" />
        <p className="text-sm text-slate-300">System online · {API_MODE.toUpperCase()} mode</p>
      </div>

      <div className="hidden items-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/70 px-3 py-1.5 md:flex">
        <Search size={14} className="text-slate-400" />
        <input className="bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500" placeholder="Search device, location, alarm..." />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" aria-label="Notifications">
          <Bell size={16} />
        </Button>
        <Button variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <Button variant="secondary">demo.operator</Button>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
