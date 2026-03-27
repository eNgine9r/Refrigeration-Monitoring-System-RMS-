import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { devicesApi, API_MODE } from '@/services/api';

const DEMO_USERS = [
  { username: 'demo.admin', role: 'admin', status: 'active' },
  { username: 'tech.north', role: 'technician', status: 'active' },
  { username: 'viewer.audit', role: 'viewer', status: 'active' },
];

export function SettingsPage() {
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Device Fleet</h2>
        <p className="mb-3 text-sm text-slate-500">Configured controllers: {devicesQuery.data?.length ?? 0}</p>
        <ul className="space-y-2 text-sm">
          {(devicesQuery.data ?? []).slice(0, 5).map((device) => (
            <li key={device.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span>{device.name}</span>
              <span className="text-xs text-slate-500">Addr {device.modbus_address}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Users & Roles</h2>
        <ul className="space-y-2 text-sm">
          {DEMO_USERS.map((user) => (
            <li key={user.username} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
              <span>{user.username}</span>
              <span className="text-xs uppercase text-slate-500">{user.role}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="md:col-span-2">
        <h2 className="mb-2 text-lg font-semibold">System Configuration</h2>
        <p className="text-sm text-slate-500">Current API mode: {API_MODE}. In mock mode, telemetry and alarms are generated locally with realistic fluctuations.</p>
      </Card>
    </div>
  );
}
