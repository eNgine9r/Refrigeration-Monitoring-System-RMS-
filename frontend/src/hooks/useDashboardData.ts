import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alarmsApi, devicesApi } from '@/services/api';

export function useDashboardData() {
  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: devicesApi.list,
    refetchInterval: 15_000,
  });

  const alarmsQuery = useQuery({
    queryKey: ['alarms', 'active'],
    queryFn: alarmsApi.active,
    refetchInterval: 15_000,
  });

  const summary = useMemo(() => {
    const devices = devicesQuery.data ?? [];
    const offlineCount = devices.filter((device) => {
      if (!device.last_seen_at) return true;
      const ageMs = Date.now() - new Date(device.last_seen_at).getTime();
      return ageMs > 90_000;
    }).length;

    return {
      totalDevices: devices.length,
      activeAlarms: alarmsQuery.data?.length ?? 0,
      offlineDevices: offlineCount,
    };
  }, [alarmsQuery.data, devicesQuery.data]);

  return { devicesQuery, alarmsQuery, summary };
}
