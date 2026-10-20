import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  className?: string;
}

export const NeuProgressBar: React.FC<NeuProgressBarProps> = ({
  current,
  total,
  showLabel = true,
  className,
}) => {
  const percentage = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className={cn('w-full flex flex-col gap-2', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
          <span>Question {current} of {total}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className="w-full h-3.5 neu-pressed rounded-full p-0.5 overflow-hidden border border-white/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-neu-small transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
