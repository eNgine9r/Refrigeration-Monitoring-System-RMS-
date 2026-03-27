import { Card } from '@/components/ui/card';

export function SettingsPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="mb-2 text-lg font-semibold">Device Management</h2>
        <p className="text-sm text-slate-500">Use backend APIs to create/update devices, register maps, thresholds and polling intervals.</p>
      </Card>
      <Card>
        <h2 className="mb-2 text-lg font-semibold">User & Access Management</h2>
        <p className="text-sm text-slate-500">Manage Admin / Technician / Viewer roles and JWT security policies.</p>
      </Card>
      <Card className="md:col-span-2">
        <h2 className="mb-2 text-lg font-semibold">System Configuration</h2>
        <p className="text-sm text-slate-500">Set alarm debounce strategy, integrations (Telegram/Email/Webhooks), and backup settings.</p>
      </Card>
    </div>
  );
}
