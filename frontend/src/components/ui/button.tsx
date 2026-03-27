import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'danger' | 'ghost';
};

export function Button({ className, variant = 'default', ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'default' && 'bg-app-primary text-white hover:bg-blue-400',
        variant === 'secondary' && 'bg-slate-700 text-slate-100 hover:bg-slate-600',
        variant === 'danger' && 'bg-app-danger text-white hover:bg-red-400',
        variant === 'ghost' && 'bg-transparent text-slate-300 hover:bg-slate-700/60',
        className,
      )}
      {...props}
    />
  );
}
