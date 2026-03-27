import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Refrigerator, Thermometer, WifiOff } from 'lucide-react';
import { AlarmList } from '@/components/AlarmList';
import { DeviceStatusTile } from '@/components/DeviceStatusTile';
import { KpiCard } from '@/components/KpiCard';
import { TemperatureChart } from '@/components/TemperatureChart';
import { Skeleton } from '@/components/ui/skeleton';
import { alarmsApi, devicesApi } from '@/services/api';

export function DashboardPage() {
  const qc = useQueryClient();
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 10_000 });
  const activeAlarmsQuery = useQuery({ queryKey: ['alarms', 'active'], queryFn: alarmsApi.active, refetchInterval: 10_000 });

  const topDevices = (devicesQuery.data ?? []).slice(0, 3);
  const historyQueries = useQueries({
    queries: topDevices.map((device) => ({ queryKey: ['device-history', device.id, 'dashboard'], queryFn: () => devicesApi.history(device.id, 240) })),
  });

  const ackMutation = useMutation({
    mutationFn: (alarmId: number) => alarmsApi.acknowledge(alarmId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['alarms'] });
      void qc.invalidateQueries({ queryKey: ['alarms', 'active'] });
    },
  });

  const summary = useMemo(() => {
    const devices = devicesQuery.data ?? [];
    const active = activeAlarmsQuery.data ?? [];
    const offline = devices.filter((device) => device.status === 'offline').length;
    const avg = devices.length ? devices.reduce((acc, d) => acc + Number(d.latest_values?.temperature ?? 0), 0) / devices.length : 0;

    return {
      total: devices.length,
      alarms: active.length,
      offline,
      avg: avg.toFixed(1),
    };
  }, [activeAlarmsQuery.data, devicesQuery.data]);

  const chart = useMemo(() => {
    const points: Record<string, { ts: string; [key: string]: string | number }> = {};

    historyQueries.forEach((query, index) => {
      const device = topDevices[index];
      (query.data ?? []).filter((point) => point.field === 'temperature').forEach((point) => {
        const ts = new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        points[ts] = points[ts] ?? { ts };
        points[ts][device.name] = point.value;
      });
    });

    return Object.values(points).slice(-96);
  }, [historyQueries, topDevices]);

  if (devicesQuery.isLoading || activeAlarmsQuery.isLoading) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Total Devices" value={`${summary.total}`} icon={Refrigerator} color="blue" trend={3.2} />
        <KpiCard title="Active Alarms" value={`${summary.alarms}`} icon={AlertTriangle} color="rose" trend={-1.4} />
        <KpiCard title="Offline Devices" value={`${summary.offline}`} icon={WifiOff} color="amber" trend={0.8} />
        <KpiCard title="Average Temp" value={`${summary.avg}°C`} icon={Thermometer} color="green" trend={0.4} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TemperatureChart
            title="Global Temperature Trend · Last 24h"
            data={chart}
            series={topDevices.map((device, index) => ({ key: device.name, name: device.name, color: ['#3b82f6', '#22c55e', '#f59e0b'][index] }))}
          />
        </div>
        <AlarmList alarms={activeAlarmsQuery.data ?? []} onAcknowledge={(id) => ackMutation.mutate(id)} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Device Status Grid</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(devicesQuery.data ?? []).map((device) => (
            <DeviceStatusTile key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
}
