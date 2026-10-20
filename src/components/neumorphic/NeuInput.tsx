import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-gray-600 tracking-wide ml-1">
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-4 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'neu-pressed w-full rounded-2xl px-5 py-3.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-400/40 border border-transparent focus:border-indigo-300/30',
              icon && 'pl-11',
              error && 'ring-2 ring-rose-400/50 border-rose-300',
              className
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-rose-500 font-medium ml-1">{error}</span>}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
