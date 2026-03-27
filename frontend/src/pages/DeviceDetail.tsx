import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { TemperatureChart } from '@/components/TemperatureChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { devicesApi } from '@/services/api';

export function DeviceDetailPage() {
  const { id } = useParams();
  const deviceId = Number(id);
  const qc = useQueryClient();
  const [register, setRegister] = useState('100');
  const [value, setValue] = useState('1');

  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list });
  const historyQuery = useQuery({
    queryKey: ['device-history', deviceId],
    queryFn: () => devicesApi.history(deviceId, 1440),
    enabled: Number.isFinite(deviceId),
  });

  const writeMutation = useMutation({
    mutationFn: () => devicesApi.writeRegister(deviceId, Number(register), Number(value)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  if (devicesQuery.isLoading || historyQuery.isLoading) return <Skeleton className="h-80 w-full" />;
  if (devicesQuery.isError || historyQuery.isError) return <p className="text-rose-600">Failed to load device details.</p>;

  const device = devicesQuery.data?.find((item) => item.id === deviceId);
  if (!device) return <p className="text-rose-600">Device not found.</p>;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold">{device.name}</h2>
        <p className="text-sm text-slate-500">Current temperature: {Number(device.latest_values?.temperature ?? 0).toFixed(1)} °C</p>
      </Card>

      <TemperatureChart title="Temperature History" data={historyQuery.data ?? []} />

      <Card>
        <h3 className="mb-3 text-base font-semibold">Control Panel</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input value={register} onChange={(e) => setRegister(e.target.value)} placeholder="Register" />
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
          <Button onClick={() => writeMutation.mutate()} disabled={writeMutation.isPending}>
            {writeMutation.isPending ? 'Writing...' : 'Write Register'}
          </Button>
        </div>
        {writeMutation.isError ? <p className="mt-2 text-sm text-rose-600">Failed to write register.</p> : null}
      </Card>
    </div>
  );
}
