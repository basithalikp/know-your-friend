'use client';

import React from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { AnswerItem, QuizQuestion } from '@/types/quiz';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AnswersBreakdownProps {
  questions: QuizQuestion[];
  breakdown: AnswerItem[];
  creatorName: string;
}

export const AnswersBreakdown: React.FC<AnswersBreakdownProps> = ({
  questions,
  breakdown,
  creatorName,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold text-gray-800 uppercase tracking-wider">
          Answer Breakdown
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          See what you got right or wrong
        </span>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => {
          const item = breakdown.find((b) => b.question_id === q.id);
          const userPickedIndex = item?.selected_index ?? -1;
          const correctIndex = item?.correct_index ?? -1;
          const isCorrect = item?.is_correct ?? false;

          return (
            <NeuCard key={q.id} variant="flat" className="p-5 sm:p-6 space-y-4">
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                    {q.question_text}
                  </h4>
                </div>

                <div className="shrink-0">
                  {isCorrect ? (
                    <NeuBadge variant="success" className="py-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Correct (+1)</span>
                    </NeuBadge>
                  ) : (
                    <NeuBadge variant="default" className="py-1 text-rose-600 border-rose-200">
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Missed</span>
                    </NeuBadge>
                  )}
                </div>
              </div>

              {/* Options status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  const wasUserPick = userPickedIndex === optIdx;
                  const wasCorrect = correctIndex === optIdx;

                  let borderAndBg = 'neu-small border-transparent text-gray-600 opacity-60';

                  if (wasCorrect) {
                    borderAndBg = 'neu-success-inset border-emerald-400/60 text-emerald-800 font-semibold opacity-100';
                  } else if (wasUserPick && !wasCorrect) {
                    borderAndBg = 'neu-pressed border-rose-400/50 text-rose-700 font-semibold opacity-100';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-2 transition-all ${borderAndBg}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold bg-white/50 shrink-0">
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>

                      <div className="shrink-0 text-[10px] font-bold uppercase">
                        {wasCorrect && wasUserPick && (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Your Pick ✓
                          </span>
                        )}
                        {wasCorrect && !wasUserPick && (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {creatorName}&apos;s Pick
                          </span>
                        )}
                        {!wasCorrect && wasUserPick && (
                          <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">
                            Your Pick ✕
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </NeuCard>
          );
        })}
      </div>
    </div>
  );
};
