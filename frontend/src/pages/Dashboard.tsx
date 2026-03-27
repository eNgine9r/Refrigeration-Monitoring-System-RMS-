import { useQuery } from '@tanstack/react-query';
import { AlarmList } from '@/components/AlarmList';
import { SummaryCard } from '@/components/SummaryCard';
import { TemperatureChart } from '@/components/TemperatureChart';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import { devicesApi } from '@/services/api';

export function DashboardPage() {
  const { summary, devicesQuery, alarmsQuery } = useDashboardData();
  const firstDeviceId = devicesQuery.data?.[0]?.id;

  const historyQuery = useQuery({
    queryKey: ['dashboard-history', firstDeviceId],
    queryFn: () => devicesApi.history(firstDeviceId ?? 0, 1440),
    enabled: Boolean(firstDeviceId),
    refetchInterval: 60_000,
  });

  const loading = devicesQuery.isLoading || alarmsQuery.isLoading;
  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (devicesQuery.isError || alarmsQuery.isError) {
    return <p className="text-rose-600">Failed to load dashboard data.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total Devices" value={summary.totalDevices} subtitle="Connected refrigeration controllers" />
        <SummaryCard title="Active Alarms" value={summary.activeAlarms} subtitle="Needs immediate action" />
        <SummaryCard title="Offline Devices" value={summary.offlineDevices} subtitle="No recent telemetry" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TemperatureChart title="Temperature (Last 24h)" data={historyQuery.data ?? []} />
        </div>
        <AlarmList alarms={alarmsQuery.data ?? []} />
      </div>
    </div>
  );
}
