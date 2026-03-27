import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { devicesApi } from '@/services/api';

export function ControllersPage() {
  const [selectedModel, setSelectedModel] = useState<'Carel iJF' | 'Dixell XR60' | 'Eliwell IDPlus'>('Carel iJF');
  const [tab, setTab] = useState<'overview' | 'parameters' | 'io' | 'alarms'>('overview');
  const devicesQuery = useQuery({ queryKey: ['devices'], queryFn: devicesApi.list, refetchInterval: 10000 });

  const controllerDevices = (devicesQuery.data ?? []).filter((d) => d.controller_model === selectedModel);
  const sample = controllerDevices[0];

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap gap-2">
        {(['Carel iJF', 'Dixell XR60', 'Eliwell IDPlus'] as const).map((model) => (
          <button key={model} className={`rounded-2xl px-4 py-2 text-sm ${model === selectedModel ? 'bg-app-primary text-white' : 'bg-slate-800 text-slate-300'}`} onClick={() => setSelectedModel(model)}>
            {model}
          </button>
        ))}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{selectedModel} Controller Simulator</h2>
          <Badge variant="success">Connected</Badge>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-black p-6 text-center">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-500">Temperature Display</p>
          <p className="font-mono text-5xl text-emerald-400">{Number(sample?.latest_values?.temperature ?? -18).toFixed(1)}°C</p>
          <p className="mt-2 text-sm text-slate-400">Setpoint: {Number(sample?.latest_values?.setpoint ?? -18).toFixed(1)}°C</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex gap-2">
          {(['overview', 'parameters', 'io', 'alarms'] as const).map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`rounded-xl px-3 py-2 text-sm ${tab === item ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {item === 'io' ? 'Inputs/Outputs' : item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {tab === 'overview' && <p className="text-sm text-slate-300">Compressor state, fan state and defrost schedule are currently healthy for {controllerDevices.length} linked devices.</p>}
        {tab === 'parameters' && <p className="text-sm text-slate-300">Realtime setpoint: {Number(sample?.latest_values?.setpoint ?? -18).toFixed(1)}°C · Differential: 2.0°C · Anti-short-cycle: 180s.</p>}
        {tab === 'io' && <p className="text-sm text-slate-300">Digital Input 1: Door Closed · Relay 1: Compressor ON · Relay 2: Defrost OFF.</p>}
        {tab === 'alarms' && <p className="text-sm text-slate-300">No critical controller-level alarms at this moment. Historical events are available in Alarm Center.</p>}
      </Card>
    </div>
  );
}
