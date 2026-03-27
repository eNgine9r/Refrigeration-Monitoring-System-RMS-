import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DeviceStatusTile } from '@/components/DeviceStatusTile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { devicesApi } from '@/services/api';

export function DevicesPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'online' | 'offline' | 'alarm'>('all');
  const [sortByTemp, setSortByTemp] = useState<'asc' | 'desc'>('desc');

  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 10_000 });

  const filtered = useMemo(() => {
    const list = devicesQuery.data ?? [];
    return list
      .filter((device) => device.name.toLowerCase().includes(query.toLowerCase()) || device.location.toLowerCase().includes(query.toLowerCase()))
      .filter((device) => status === 'all' || device.status === status)
      .sort((a, b) => {
        const at = Number(a.latest_values?.temperature ?? 0);
        const bt = Number(b.latest_values?.temperature ?? 0);
        return sortByTemp === 'asc' ? at - bt : bt - at;
      });
  }, [devicesQuery.data, query, sortByTemp, status]);

  if (devicesQuery.isLoading) return <Skeleton className="h-60 w-full" />;

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by device or location"
          className="min-w-52 flex-1 rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="alarm">Alarm</option>
        </select>
        <Button variant="secondary" onClick={() => setSortByTemp(sortByTemp === 'asc' ? 'desc' : 'asc')}>
          <ArrowUpDown size={14} className="mr-1" /> Temp {sortByTemp}
        </Button>
        <Button variant={view === 'table' ? 'default' : 'ghost'} onClick={() => setView('table')}>
          <List size={14} />
        </Button>
        <Button variant={view === 'grid' ? 'default' : 'ghost'} onClick={() => setView('grid')}>
          <LayoutGrid size={14} />
        </Button>
      </Card>

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((device) => (
            <DeviceStatusTile key={device.id} device={device} />
          ))}
        </div>
      ) : (
        <Card>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="pb-2">Name</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Temperature</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Last update</th>
                <th className="pb-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id} className="border-b border-slate-800">
                  <td className="py-3 font-medium">{device.name}</td>
                  <td>{device.location}</td>
                  <td>{Number(device.latest_values?.temperature ?? 0).toFixed(1)}°C</td>
                  <td>
                    <Badge variant={device.status === 'online' ? 'success' : device.status === 'alarm' ? 'danger' : 'warning'}>{device.status.toUpperCase()}</Badge>
                  </td>
                  <td>{device.last_seen_at ? new Date(device.last_seen_at).toLocaleTimeString() : 'N/A'}</td>
                  <td>
                    <Link to={`/devices/${device.id}`} className="text-blue-300 hover:underline">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
