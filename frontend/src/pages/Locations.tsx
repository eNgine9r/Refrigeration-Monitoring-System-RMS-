import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { devicesApi } from '@/services/api';

export function LocationsPage() {
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 10000 });

  const grouped = useMemo(() => {
    const map: Record<string, typeof devicesQuery.data> = {};
    (devicesQuery.data ?? []).forEach((device) => {
      map[device.location] = [...(map[device.location] ?? []), device];
    });
    return map;
  }, [devicesQuery.data]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Object.entries(grouped).map(([location, devices]) => (
        <Card key={location}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{location}</h3>
            <Badge variant="neutral">{devices?.length ?? 0} devices</Badge>
          </div>
          <div className="space-y-2">
            {devices?.map((device) => (
              <Link key={device.id} to={`/devices/${device.id}`} className="flex items-center justify-between rounded-xl border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800/70">
                <span>{device.name}</span>
                <Badge variant={device.status === 'online' ? 'success' : device.status === 'alarm' ? 'danger' : 'warning'}>{device.status}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
