import { BarChart3, Bell, Building2, Cog, Gauge, LayoutDashboard, SlidersHorizontal, Thermometer } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', icon: Thermometer },
  { to: '/controllers', label: 'Controllers', icon: SlidersHorizontal },
  { to: '/alarms', label: 'Alarms', icon: Bell },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/locations', label: 'Locations', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Cog },
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 border-r border-slate-800 bg-slate-950/80 px-4 py-6 backdrop-blur md:block">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="rounded-xl bg-app-primary/25 p-2">
          <Gauge size={18} className="text-app-primary" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">RMS Platform</p>
          <h1 className="text-lg font-semibold">ColdChain Control</h1>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800/70',
                isActive && 'bg-slate-800 font-semibold text-white',
              )
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
