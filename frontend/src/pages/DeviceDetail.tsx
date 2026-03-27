import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotateCcw, Snowflake, ToggleLeft, ToggleRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { TemperatureChart } from '@/components/TemperatureChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { alarmsApi, devicesApi } from '@/services/api';

export function DeviceDetailPage() {
  const { id } = useParams();
  const deviceId = Number(id);
  const qc = useQueryClient();
  const [range, setRange] = useState<1440 | 10080>(1440);
  const [register, setRegister] = useState('101');
  const [value, setValue] = useState('-180');

  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 8000 });
  const historyQuery = useQuery({ queryKey: ['device-history', deviceId, range], queryFn: () => devicesApi.history(deviceId, range), enabled: Number.isFinite(deviceId) });
  const alarmsQuery = useQuery({ queryKey: ['alarms'], queryFn: alarmsApi.list, refetchInterval: 15000 });

  const writeMutation = useMutation({ mutationFn: () => devicesApi.writeRegister(deviceId, Number(register), Number(value)), onSuccess: () => void qc.invalidateQueries({ queryKey: ['devices'] }) });
  const actionMutation = useMutation({ mutationFn: (action: 'on' | 'off' | 'defrost' | 'reset_alarm') => devicesApi.action(deviceId, action), onSuccess: () => void qc.invalidateQueries({ queryKey: ['devices'] }) });

  if (devicesQuery.isLoading || historyQuery.isLoading || alarmsQuery.isLoading) return <Skeleton className="h-96 w-full" />;

  const device = devicesQuery.data?.find((d) => d.id === deviceId);
  if (!device) return <p className="text-rose-400">Device not found.</p>;

  const alarmHistory = (alarmsQuery.data ?? []).filter((alarm) => alarm.device_id === deviceId);
  const chartData = (historyQuery.data ?? []).map((point) => ({ ts: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temperature: point.value }));

  const parameters = useMemo(
    () => [
      { key: 'Temperature Register', value: device.register_map.temperature?.address },
      { key: 'Setpoint', value: device.latest_values?.setpoint },
      { key: 'Modbus Address', value: device.modbus_address },
      { key: 'Polling Interval', value: `${device.polling_interval_sec}s` },
    ],
    [device],
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{device.name}</h1>
            <p className="text-sm text-slate-400">Last update: {device.last_seen_at ? new Date(device.last_seen_at).toLocaleString() : 'N/A'}</p>
          </div>
          <Badge variant={device.status === 'online' ? 'success' : device.status === 'alarm' ? 'danger' : 'warning'}>{device.status.toUpperCase()}</Badge>
        </div>
      </Card>

      <Card className="flex items-center gap-2">
        <Button variant={range === 1440 ? 'default' : 'secondary'} onClick={() => setRange(1440)}>
          24h
        </Button>
        <Button variant={range === 10080 ? 'default' : 'secondary'} onClick={() => setRange(10080)}>
          7d
        </Button>
      </Card>

      <TemperatureChart title="Temperature Trend" data={chartData} series={[{ key: 'temperature', name: device.name, color: '#3b82f6' }]} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 text-lg font-semibold">Parameters</h3>
          <div className="space-y-2">
            {parameters.map((param) => (
              <div key={param.key} className="flex items-center justify-between rounded-xl border border-slate-700 px-3 py-2">
                <span className="text-sm text-slate-400">{param.key}</span>
                <span className="font-medium">{String(param.value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Input value={register} onChange={(e) => setRegister(e.target.value)} />
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
            <Button onClick={() => writeMutation.mutate()}>{writeMutation.isPending ? 'Saving...' : 'Write'}</Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold">Control Panel</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => actionMutation.mutate('on')}>
              <ToggleRight size={14} className="mr-1" /> ON
            </Button>
            <Button variant="secondary" onClick={() => actionMutation.mutate('off')}>
              <ToggleLeft size={14} className="mr-1" /> OFF
            </Button>
            <Button variant="secondary" onClick={() => actionMutation.mutate('defrost')}>
              <Snowflake size={14} className="mr-1" /> Defrost
            </Button>
            <Button variant="danger" onClick={() => actionMutation.mutate('reset_alarm')}>
              <RotateCcw size={14} className="mr-1" /> Reset alarm
            </Button>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Alarm History</h3>
        <div className="space-y-2">
          {alarmHistory.map((alarm) => (
            <div key={alarm.id} className="rounded-xl border border-slate-700 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{alarm.message}</p>
                <Badge variant={alarm.status === 'ACTIVE' ? 'danger' : alarm.status === 'ACKNOWLEDGED' ? 'warning' : 'success'}>{alarm.status}</Badge>
              </div>
              <p className="text-xs text-slate-400">{new Date(alarm.started_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
