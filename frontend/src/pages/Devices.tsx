import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { devicesApi } from '@/services/api';

export function DevicesPage() {
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 15_000 });

  if (devicesQuery.isLoading) return <Skeleton className="h-56 w-full" />;
  if (devicesQuery.isError) return <p className="text-rose-600">Failed to load devices.</p>;

  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Devices</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
              <th className="pb-2">Name</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Temperature</th>
              <th className="pb-2">Last Update</th>
            </tr>
          </thead>
          <tbody>
            {devicesQuery.data?.map((device) => (
              <tr key={device.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-3">
                  <Link className="font-medium text-blue-600 hover:underline" to={`/devices/${device.id}`}>
                    {device.name}
                  </Link>
                </td>
                <td className="py-3">
                  <StatusBadge lastSeenAt={device.last_seen_at} />
                </td>
                <td className="py-3">{Number(device.latest_values?.temperature ?? 0).toFixed(1)} °C</td>
                <td className="py-3">{device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
