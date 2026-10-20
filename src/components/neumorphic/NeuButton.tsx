'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'pressed' | 'danger' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const NeuButton = forwardRef<HTMLButtonElement, NeuButtonProps>(
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
    const isDark = variant === 'dark';
    const isLong = size !== 'icon';

    const sizeStyles = {
      sm: 'btn-neu-sm',
      md: 'btn-neu-md',
      lg: 'btn-neu-lg',
      icon: 'btn-neu-icon',
    };

    const variantClasses: Record<string, string> = {
      default: '',
      primary: 'circle-primary',
      dark: '',
      danger: 'circle-danger',
      pressed: 'circle-pressed',
      ghost: 'circle-ghost',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          isDark ? 'circle_black' : 'circle',
          isLong && 'long',
          sizeStyles[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <span className="neu-btn-text">
          {isLoading && (
            <svg
              className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-current shrink-0"
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
        </span>
      </button>
    );
  }
);

NeuButton.displayName = 'NeuButton';
