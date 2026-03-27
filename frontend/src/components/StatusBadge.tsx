import { Badge } from '@/components/ui/badge';
import type { DeviceStatus } from '@/types/api';

export function StatusBadge({ status }: { status: DeviceStatus }) {
  if (status === 'online') return <Badge variant="success">ONLINE</Badge>;
  if (status === 'alarm') return <Badge variant="danger">ALARM</Badge>;
  return <Badge variant="warning">OFFLINE</Badge>;
}
