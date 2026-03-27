import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Brush } from 'recharts';
import { Card } from '@/components/ui/card';
import type { HistoryPoint } from '@/types/api';

type Props = {
  title: string;
  data: HistoryPoint[];
};

export function TemperatureChart({ title, data }: Props) {
  const transformed = data
    .filter((point) => point.field === 'temperature')
    .map((point) => ({
      ts: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: point.value,
    }));

  return (
    <Card className="h-[360px]">
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={transformed}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="ts" minTickGap={32} />
          <YAxis domain={['auto', 'auto']} unit="°C" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.5} dot={false} />
          <Brush dataKey="ts" height={18} stroke="#64748b" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
