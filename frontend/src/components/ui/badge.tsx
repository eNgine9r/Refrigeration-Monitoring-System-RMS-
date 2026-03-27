import { cn } from '@/lib/utils';

type Props = {
  children: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
};

export function Badge({ children, variant = 'neutral' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold',
        variant === 'success' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        variant === 'danger' && 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
        variant === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100',
      )}
    >
      {children}
    </span>
  );
}
