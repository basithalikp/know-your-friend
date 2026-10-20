'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { NeuCard } from './NeuCard';
import { NeuButton } from './NeuButton';

export interface NeuModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const NeuModal: React.FC<NeuModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <NeuCard
        variant="float"
        className={cn(
          'relative z-10 w-full max-w-lg p-6 sm:p-8 animate-in zoom-in-95 duration-200 border border-white/80',
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-gray-200/50 mb-4">
          <div>
            {title && <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>}
            {description && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{description}</p>}
          </div>
          <NeuButton
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </NeuButton>
        </div>
        <div className="space-y-4">{children}</div>
      </NeuCard>
    </div>
  );
};
