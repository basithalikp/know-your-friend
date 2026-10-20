import React from 'react';
import { cn } from '@/lib/utils';

interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'small' | 'float' | 'pressed';
  children: React.ReactNode;
}

export const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  ({ className, variant = 'flat', children, ...props }, ref) => {
    const variantStyles = {
      flat: 'neu-flat rounded-3xl p-6 sm:p-8',
      small: 'neu-small rounded-2xl p-4 sm:p-5',
      float: 'neu-float rounded-4xl p-8 sm:p-10',
      pressed: 'neu-pressed rounded-2xl p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300 relative',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeuCard.displayName = 'NeuCard';
