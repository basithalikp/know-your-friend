import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'pressed' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-4 py-2 text-xs rounded-xl font-medium',
      md: 'px-6 py-3 text-sm rounded-2xl font-semibold',
      lg: 'px-8 py-4 text-base rounded-2xl font-bold tracking-wide',
      icon: 'p-3 rounded-2xl flex items-center justify-center',
    };

    const variantStyles = {
      default:
        'neu-small text-gray-700 hover:shadow-neu-flat active:shadow-neu-pressed active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400/40',
      primary:
        'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-neu-small hover:shadow-neu-flat active:scale-[0.98] border border-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
      pressed:
        'neu-pressed text-indigo-600 font-semibold focus:outline-none',
      danger:
        'neu-small text-rose-600 hover:bg-rose-50/50 active:shadow-neu-pressed focus:ring-2 focus:ring-rose-400/40',
      ghost:
        'text-gray-600 hover:neu-small active:shadow-neu-pressed focus:outline-none',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 select-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

NeuButton.displayName = 'NeuButton';
