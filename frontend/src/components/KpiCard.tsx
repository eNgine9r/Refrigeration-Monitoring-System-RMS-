import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  trend: number;
  color: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const isUp = trend >= 0;
  const colorClass = {
    blue: 'text-blue-300 bg-blue-500/15',
    green: 'text-emerald-300 bg-emerald-500/15',
    amber: 'text-amber-300 bg-amber-500/15',
    rose: 'text-rose-300 bg-rose-500/15',
  }[color];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <span className={`rounded-xl p-2 ${colorClass}`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
        {isUp ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-rose-400" />}
        <span>{Math.abs(trend).toFixed(1)}% vs yesterday</span>
      </div>
    </Card>
  );
}
