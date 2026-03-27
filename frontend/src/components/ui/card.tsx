import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('glass rounded-2xl p-5 shadow-card transition hover:border-slate-600', className)}>{children}</div>;
}
