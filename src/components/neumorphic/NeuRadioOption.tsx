import React from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCircle2, XCircle } from 'lucide-react';

export interface NeuRadioOptionProps {
  label: string;
  index: number;
  isSelected?: boolean;
  isCorrect?: boolean | null; // null: normal quiz taker selection, true: correct in breakdown, false: wrong in breakdown
  isCreatorAnswer?: boolean; // when creator is picking the correct answer
  disabled?: boolean;
  editable?: boolean;
  onTextChange?: (newText: string) => void;
  onClick?: () => void;
  className?: string;
}

export const NeuRadioOption: React.FC<NeuRadioOptionProps> = ({
  label,
  index,
  isSelected = false,
  isCorrect = null,
  isCreatorAnswer = false,
  disabled = false,
  editable = false,
  onTextChange,
  onClick,
  className,
}) => {
  const letters = ['A', 'B', 'C', 'D'];
  const letter = letters[index] || `${index + 1}`;

  // Styling logic
  let stateStyles = 'neu-small hover:shadow-neu-flat border border-white/50 text-gray-700';

  if (isCorrect === true) {
    stateStyles = 'neu-success-inset border-emerald-400/50 text-emerald-800 font-semibold';
  } else if (isCorrect === false && isSelected) {
    stateStyles = 'neu-pressed border-rose-400/50 text-rose-700 font-semibold';
  } else if (isSelected || isCreatorAnswer) {
    stateStyles = 'neu-accent-inset border-indigo-400/50 text-indigo-700 font-semibold';
  }

  return (
    <div
      onClick={() => {
        if (!disabled && onClick) onClick();
      }}
      className={cn(
        'group relative flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer select-none',
        disabled && 'cursor-default pointer-events-none opacity-80',
        stateStyles,
        className
      )}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <span
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold transition-all shrink-0',
            isSelected || isCreatorAnswer
              ? 'bg-indigo-600 text-white shadow-sm'
              : isCorrect === true
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'neu-pressed text-gray-500 group-hover:text-gray-700'
          )}
        >
          {letter}
        </span>

        {editable ? (
          <input
            type="text"
            value={label}
            onChange={(e) => onTextChange && onTextChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-transparent outline-none text-sm sm:text-base text-gray-800 font-medium"
            placeholder={`Option ${letter}`}
          />
        ) : (
          <span className="text-sm sm:text-base break-words flex-1 text-left">
            {label}
          </span>
        )}
      </div>

      {/* Indicator icon */}
      <div className="shrink-0 flex items-center">
        {isCorrect === true && (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in fade-in zoom-in" />
        )}
        {isCorrect === false && isSelected && (
          <XCircle className="w-5 h-5 text-rose-500 animate-in fade-in zoom-in" />
        )}
        {isCorrect === null && (isSelected || isCreatorAnswer) && (
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
        {isCorrect === null && !isSelected && !isCreatorAnswer && (
          <div className="w-5 h-5 rounded-full neu-pressed border border-white/40" />
        )}
      </div>
    </div>
  );
};
