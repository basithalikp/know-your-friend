'use client';

import React from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { NeuAvatar } from '@/components/neumorphic/NeuAvatar';
import { StagedQuestion } from '@/types/quiz';
import { Trash2, ArrowUp, ArrowDown, CheckCircle2 } from 'lucide-react';

interface QuestionQueueListProps {
  questions: StagedQuestion[];
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export const QuestionQueueList: React.FC<QuestionQueueListProps> = ({
  questions,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  if (questions.length === 0) {
    return (
      <NeuCard variant="flat" className="text-center py-10 border-dashed border-2 border-gray-300">
        <p className="text-sm font-semibold text-gray-500">
          No questions added yet. Use the AI generator above to craft your first question!
        </p>
      </NeuCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Staged Questions ({questions.length})
        </h4>
        <span className="text-xs text-gray-500 font-medium">
          Ready for your friends
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const correctOption = q.options[q.correct_option_index] || '';
          const letters = ['A', 'B', 'C', 'D'];

          return (
            <NeuCard
              key={q.id}
              variant="flat"
              className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-rose-200"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {q.avatar ? (
                  <NeuAvatar avatar={q.avatar} size="sm" variant="float" />
                ) : (
                  <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-rose-600 text-white text-xs font-bold shrink-0 shadow-sm">
                    {idx + 1}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-gray-800 break-words mb-1.5">
                    {q.question_text}
                  </p>

                    <div className="flex flex-wrap items-center gap-2">
                    <NeuBadge variant="success" className="text-[11px] py-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>
                        Answer: {letters[q.correct_option_index]} ({correctOption})
                      </span>
                    </NeuBadge>
                    {q.suggested_category && (
                      <NeuBadge variant="default" className="text-[11px] py-0.5 text-gray-500 capitalize">
                        {q.suggested_category}
                      </NeuBadge>
                    )}
                  </div>
                  {q.remarks && (
                    <p className="mt-2 text-xs text-rose-700 bg-rose-50/70 rounded-xl px-3 py-1.5 border border-rose-100 flex items-start gap-1.5 italic">
                      <span className="font-semibold not-italic">💬 Remarks:</span>
                      <span>&ldquo;{q.remarks}&rdquo;</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <NeuButton
                  variant="ghost"
                  size="icon"
                  disabled={idx === 0}
                  onClick={() => onMoveUp(idx)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </NeuButton>

                <NeuButton
                  variant="ghost"
                  size="icon"
                  disabled={idx === questions.length - 1}
                  onClick={() => onMoveDown(idx)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-700 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </NeuButton>

                <NeuButton
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(idx)}
                  className="w-8 h-8 rounded-xl text-gray-400 hover:text-rose-600"
                  title="Remove question"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </NeuButton>
              </div>
            </NeuCard>
          );
        })}
      </div>
    </div>
  );
};
