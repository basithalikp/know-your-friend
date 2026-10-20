import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'pressed';
  children: React.ReactNode;
}

export const NeuBadge: React.FC<NeuBadgeProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'neu-small text-gray-700 border border-white/60',
    accent: 'bg-rose-50/80 text-rose-700 border border-rose-200/50 shadow-sm',
    success: 'bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 shadow-sm',
    warning: 'bg-amber-50/80 text-amber-700 border border-amber-200/50 shadow-sm',
    pressed: 'neu-pressed text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
