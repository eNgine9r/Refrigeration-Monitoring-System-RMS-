import { Brush, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';

type ChartPoint = { ts: string; [key: string]: string | number };

export function TemperatureChart({ title, data, series }: { title: string; data: ChartPoint[]; series: Array<{ key: string; color: string; name: string }> }) {
  return (
    <Card className="h-[380px]">
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
          <XAxis dataKey="ts" minTickGap={36} tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="°C" />
          <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12 }} />
          {series.map((item) => (
            <Line key={item.key} type="monotone" dataKey={item.key} stroke={item.color} strokeWidth={2.4} dot={false} name={item.name} />
          ))}
          <Brush dataKey="ts" height={16} stroke="#64748b" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
