import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';

export function Topbar() {
  const { logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-xs text-slate-500">System Status</p>
        <p className="text-sm font-medium text-emerald-600">Operational</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary">admin</Button>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
