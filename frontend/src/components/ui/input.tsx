import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('w-full rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500', className)} {...props} />;
}
