import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Alarm } from '@/types/api';

export function AlarmList({ alarms }: { alarms: Alarm[] }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">Active Alarms</h3>
        <span className="text-xs text-slate-500">{alarms.length} alarms</span>
      </div>
      <div className="space-y-3">
        {alarms.length === 0 ? <p className="text-sm text-slate-500">No active alarms.</p> : null}
        {alarms.map((alarm) => (
          <div key={alarm.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium">{alarm.message}</p>
              <p className="text-xs text-slate-500">Device #{alarm.device_id}</p>
            </div>
            <Badge variant={alarm.severity >= 3 ? 'danger' : 'warning'}>P{alarm.severity}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
