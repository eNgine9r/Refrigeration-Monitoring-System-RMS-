import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Device } from '@/types/api';

export function DeviceStatusTile({ device }: { device: Device }) {
  const temp = Number(device.latest_values?.temperature ?? 0);

  return (
    <Link to={`/devices/${device.id}`}>
      <Card className="cursor-pointer hover:-translate-y-0.5">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold">{device.name}</h4>
          <Badge variant={device.status === 'online' ? 'success' : device.status === 'alarm' ? 'danger' : 'warning'}>{device.status.toUpperCase()}</Badge>
        </div>
        <p className="text-2xl font-semibold">{temp.toFixed(1)}°C</p>
        <p className="mt-1 text-xs text-slate-400">{device.location}</p>
      </Card>
    </Link>
  );
}
