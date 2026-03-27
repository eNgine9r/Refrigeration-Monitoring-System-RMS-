import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { TemperatureChart } from '@/components/TemperatureChart';
import { devicesApi, alarmsApi } from '@/services/api';

export function AnalyticsPage() {
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list });
  const alarmsQuery = useQuery({ queryKey: ['alarms'], queryFn: alarmsApi.list });

  const selected = (devicesQuery.data ?? []).slice(0, 4);
  const historyQueries = useQueries({ queries: selected.map((d) => ({ queryKey: ['analytics-history', d.id], queryFn: () => devicesApi.history(d.id, 1440) })) });

  const comparisonData = useMemo(() => {
    const map: Record<string, { ts: string; [k: string]: string | number }> = {};
    historyQueries.forEach((q, idx) => {
      const device = selected[idx];
      (q.data ?? []).forEach((p) => {
        const ts = new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        map[ts] = map[ts] ?? { ts };
        map[ts][device.name] = p.value;
      });
    });
    return Object.values(map).slice(-100);
  }, [historyQueries, selected]);

  const alarmFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    (alarmsQuery.data ?? []).forEach((alarm) => {
      counts[alarm.alarm_type] = (counts[alarm.alarm_type] ?? 0) + 1;
    });
    return counts;
  }, [alarmsQuery.data]);

  return (
    <div className="space-y-4">
      <TemperatureChart title="Device Comparison (24h)" data={comparisonData} series={selected.map((d, i) => ({ key: d.name, name: d.name, color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'][i] }))} />
      <Card>
        <h3 className="mb-3 text-lg font-semibold">Alarm Frequency</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(alarmFrequency).map(([type, count]) => (
            <div key={type} className="rounded-xl border border-slate-700 p-3">
              <p className="text-xs text-slate-400">{type}</p>
              <p className="text-2xl font-semibold">{count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
