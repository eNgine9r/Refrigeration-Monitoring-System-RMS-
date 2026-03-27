import type { Alarm } from '@/types/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function AlarmList({ alarms, onAcknowledge }: { alarms: Alarm[]; onAcknowledge: (alarmId: number) => void }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Active Alarms</h3>
        <span className="text-xs text-slate-400">{alarms.length} active</span>
      </div>
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="rounded-xl border border-slate-700 bg-slate-800/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{alarm.message}</p>
              <Badge variant={alarm.severity >= 3 ? 'danger' : 'warning'}>P{alarm.severity}</Badge>
            </div>
            <p className="mb-3 text-xs text-slate-400">Device #{alarm.device_id}</p>
            <Button variant="secondary" className="w-full" onClick={() => onAcknowledge(alarm.id)}>
              Acknowledge
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
