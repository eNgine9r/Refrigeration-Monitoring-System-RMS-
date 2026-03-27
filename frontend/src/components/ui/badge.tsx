import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
};

export function Badge({ children, variant = 'neutral' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        variant === 'success' && 'bg-emerald-500/20 text-emerald-300',
        variant === 'warning' && 'bg-amber-500/20 text-amber-300',
        variant === 'danger' && 'bg-rose-500/20 text-rose-300',
        variant === 'neutral' && 'bg-slate-700/70 text-slate-200',
      )}
    >
      {children}
    </span>
  );
}
