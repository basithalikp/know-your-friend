'use client';

import React from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { NeuAvatar } from '@/components/neumorphic/NeuAvatar';
import { AnswerItem, QuizQuestion } from '@/types/quiz';
import { CheckCircle2, XCircle, MessageSquareQuote } from 'lucide-react';

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
          const remarkText = item?.remarks || q.remarks;

          return (
            <NeuCard key={q.id} variant="flat" className="p-5 sm:p-6 space-y-4">
              {/* Question header with Large Avatar Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
                  {q.avatar ? (
                    <div className="p-2 rounded-2xl neu-pressed bg-slate-100/70 border border-white/60 shadow-inner shrink-0">
                      <NeuAvatar avatar={q.avatar} size="lg" variant="float" />
                    </div>
                  ) : (
                    <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
                      Question {idx + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                      {q.question_text}
                    </h4>
                  </div>
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

              {/* Options status (Card Tiles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {q.options.map((opt, optIdx) => {
                  const wasUserPick = userPickedIndex === optIdx;
                  const wasCorrect = correctIndex === optIdx;
                  const optionAvatar = q.option_avatars?.[optIdx];

                  let borderAndBg = 'neu-small border-transparent text-gray-600 opacity-60';

                  if (wasCorrect) {
                    borderAndBg = 'neu-success-inset border-emerald-400/60 text-emerald-800 font-semibold opacity-100';
                  } else if (wasUserPick && !wasCorrect) {
                    borderAndBg = 'neu-pressed border-rose-400/50 text-rose-700 font-semibold opacity-100';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-4 rounded-2xl text-xs sm:text-sm flex flex-col items-center justify-between gap-3 text-center transition-all ${borderAndBg}`}
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold bg-white/60 shadow-sm shrink-0">
                          {['A', 'B', 'C', 'D'][optIdx]}
                        </span>
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

                      {optionAvatar && (
                        <div className="py-1">
                          <NeuAvatar avatar={optionAvatar} size="card" variant="flat" />
                        </div>
                      )}

                      <span className="font-semibold text-gray-800 break-words leading-tight">
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Creator Remarks / Commentary Bubble */}
              {remarkText && (
                <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-rose-50/90 border border-rose-200/60 flex items-start gap-3 shadow-sm animate-in fade-in">
                  <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <MessageSquareQuote className="w-4 h-4" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-800">
                    <p className="font-bold text-rose-950 mb-0.5">
                      {creatorName}&apos;s Remarks:
                    </p>
                    <p className="italic text-gray-700 font-medium leading-relaxed">
                      &ldquo;{remarkText}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </NeuCard>
          );
        })}
      </div>
    </div>
  );
};
