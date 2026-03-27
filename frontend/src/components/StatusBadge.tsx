import { Badge } from '@/components/ui/badge';

export function StatusBadge({ lastSeenAt }: { lastSeenAt: string | null }) {
  if (!lastSeenAt) return <Badge variant="danger">Offline</Badge>;
  const ageMs = Date.now() - new Date(lastSeenAt).getTime();
  if (ageMs > 90_000) return <Badge variant="warning">Stale</Badge>;
  return <Badge variant="success">Online</Badge>;
}
