import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_MODE } from '@/services/api';

const USERS = [
  { name: 'demo.admin', role: 'Admin', status: 'Active' },
  { name: 'tech.kyiv', role: 'Technician', status: 'Active' },
  { name: 'audit.viewer', role: 'Viewer', status: 'Active' },
];

export function SettingsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Users & Roles</h2>
        <div className="space-y-2">
          {USERS.map((user) => (
            <div key={user.name} className="flex items-center justify-between rounded-xl border border-slate-700 px-3 py-2">
              <span>{user.name}</span>
              <div className="flex gap-2">
                <Badge variant="neutral">{user.role}</Badge>
                <Badge variant="success">{user.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">System Config</h2>
        <div className="space-y-3 text-sm">
          <p>Alarm debounce: <strong>120 sec</strong></p>
          <p>Polling profile: <strong>Adaptive 5-20 sec</strong></p>
          <p>Notification channels: <strong>Telegram, Email, Web</strong></p>
          <p>
            API mode: <Badge variant={API_MODE === 'mock' ? 'warning' : 'success'}>{API_MODE.toUpperCase()}</Badge>
          </p>
        </div>
      </Card>
    </div>
  );
}
