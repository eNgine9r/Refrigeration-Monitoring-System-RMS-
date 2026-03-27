import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { alarmsApi, devicesApi } from '@/services/api';
import type { Alarm } from '@/types/api';

export function AlarmsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Alarm | null>(null);
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'>('ALL');
  const [severity, setSeverity] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');
  const [deviceFilter, setDeviceFilter] = useState<number | 'ALL'>('ALL');

  const alarmsQuery = useQuery({ queryKey: ['alarms'], queryFn: alarmsApi.list, refetchInterval: 10000 });
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list });

  const ackMutation = useMutation({ mutationFn: (id: number) => alarmsApi.acknowledge(id), onSuccess: () => void qc.invalidateQueries({ queryKey: ['alarms'] }) });
  const resolveMutation = useMutation({ mutationFn: (id: number) => alarmsApi.resolve(id), onSuccess: () => void qc.invalidateQueries({ queryKey: ['alarms'] }) });

  const filtered = useMemo(() => {
    return (alarmsQuery.data ?? []).filter((alarm) => {
      const statusPass = status === 'ALL' || alarm.status === status;
      const severityPass = severity === 'ALL' || (severity === 'HIGH' ? alarm.severity >= 4 : severity === 'MED' ? alarm.severity === 3 : alarm.severity <= 2);
      const devicePass = deviceFilter === 'ALL' || alarm.device_id === deviceFilter;
      return statusPass && severityPass && devicePass;
    });
  }, [alarmsQuery.data, deviceFilter, severity, status]);

  if (alarmsQuery.isLoading || devicesQuery.isLoading) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2">
        <select className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
          <option value="ALL">All severity</option>
          <option value="HIGH">High</option>
          <option value="MED">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm" value={String(deviceFilter)} onChange={(e) => setDeviceFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}>
          <option value="ALL">All devices</option>
          {(devicesQuery.data ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </Card>

      <Card>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="pb-2">Severity</th>
              <th className="pb-2">Device</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Timestamp</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alarm) => (
              <tr key={alarm.id} className="border-b border-slate-800">
                <td className="py-3">P{alarm.severity}</td>
                <td>#{alarm.device_id}</td>
                <td>{alarm.alarm_type}</td>
                <td>
                  <Badge variant={alarm.status === 'ACTIVE' ? 'danger' : alarm.status === 'ACKNOWLEDGED' ? 'warning' : 'success'}>{alarm.status}</Badge>
                </td>
                <td>{new Date(alarm.started_at).toLocaleString()}</td>
                <td className="space-x-2">
                  <Button variant="ghost" onClick={() => setSelected(alarm)}>
                    Details
                  </Button>
                  <Button variant="secondary" onClick={() => ackMutation.mutate(alarm.id)}>
                    Ack
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Alarm #{selected.id}</h3>
              <Button variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            <p className="mb-2 text-sm">{selected.message}</p>
            <p className="mb-4 text-xs text-slate-400">{selected.details}</p>
            <div className="mb-4 space-y-1 text-xs text-slate-400">
              <p>Started: {new Date(selected.started_at).toLocaleString()}</p>
              <p>Updated: {new Date(selected.updated_at).toLocaleString()}</p>
              <p>Resolved: {selected.resolved_at ? new Date(selected.resolved_at).toLocaleString() : 'Not resolved'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => ackMutation.mutate(selected.id)}>
                Acknowledge
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  resolveMutation.mutate(selected.id);
                  setSelected(null);
                }}
              >
                Resolve
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
