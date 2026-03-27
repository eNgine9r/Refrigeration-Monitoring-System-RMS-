import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { alarmsApi } from '@/services/api';

export function AlarmsPage() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'LOW'>('ALL');

  const alarmsQuery = useQuery({ queryKey: ['alarms'], queryFn: alarmsApi.list, refetchInterval: 20_000 });

  const filtered = useMemo(() => {
    const alarms = alarmsQuery.data ?? [];
    return alarms.filter((alarm) => {
      const statusPass = statusFilter === 'ALL' || alarm.status === statusFilter;
      const severityPass =
        severityFilter === 'ALL' || (severityFilter === 'HIGH' ? alarm.severity >= 3 : alarm.severity < 3);
      return statusPass && severityPass;
    });
  }, [alarmsQuery.data, severityFilter, statusFilter]);

  if (alarmsQuery.isLoading) return <Skeleton className="h-80 w-full" />;
  if (alarmsQuery.isError) return <p className="text-rose-600">Failed to load alarms.</p>;

  return (
    <Card>
      <div className="mb-4 flex flex-wrap gap-2">
        <select className="rounded-xl border px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <select className="rounded-xl border px-3 py-2 text-sm" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}>
          <option value="ALL">All severity</option>
          <option value="HIGH">High (P3+)</option>
          <option value="LOW">Low (P1-P2)</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="pb-2">Device</th>
              <th className="pb-2">Type</th>
              <th className="pb-2">Severity</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alarm) => (
              <tr key={alarm.id} className="border-b border-slate-100">
                <td className="py-3">#{alarm.device_id}</td>
                <td className="py-3">{alarm.alarm_type}</td>
                <td className="py-3">P{alarm.severity}</td>
                <td className="py-3">{alarm.status}</td>
                <td className="py-3">{new Date(alarm.started_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
