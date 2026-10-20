'use client';

import React, { useState } from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuRadioOption } from '@/components/neumorphic/NeuRadioOption';
import { NeuProgressBar } from '@/components/neumorphic/NeuProgressBar';
import { NeuAvatar } from '@/components/neumorphic/NeuAvatar';
import { QuizQuestion } from '@/types/quiz';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface QuizStepperProps {
  questions: QuizQuestion[];
  creatorName: string;
  isSubmitting?: boolean;
  onSubmit: (answers: { question_id: string; selected_index: number }[]) => void;
}

export const QuizStepper: React.FC<QuizStepperProps> = ({
  questions,
  creatorName,
  isSubmitting = false,
  onSubmit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const currentSelection = selectedAnswers[currentQuestion.id];

  const handleSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Complete submission
      const formatted = questions.map((q) => ({
        question_id: q.id,
        selected_index: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));
      onSubmit(formatted);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const hasSelected = currentSelection !== undefined;
  const isLastQuestion = currentIndex === total - 1;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <NeuProgressBar current={currentIndex + 1} total={total} />

      {/* Main Question Card */}
      <NeuCard variant="float" className="relative p-6 sm:p-10 space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 neu-small px-3 py-1 rounded-xl">
            {creatorName}&apos;s Challenge
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Large Question Avatar Showcase Card */}
        {currentQuestion.avatar && (
          <div className="flex flex-col items-center justify-center pt-2 pb-1">
            <div className="p-3 sm:p-4 rounded-3xl neu-pressed bg-slate-100/60 border border-white/60 shadow-inner flex flex-col items-center">
              <NeuAvatar
                avatar={currentQuestion.avatar}
                size="2xl"
                variant="float"
                className="shadow-lg"
              />
              <span className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {currentQuestion.avatar.style} &bull; {currentQuestion.avatar.seed}
              </span>
            </div>
          </div>
        )}

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug tracking-tight text-center">
          {currentQuestion.question_text}
        </h2>

        {/* 4 Choices Grid (Large Option Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {currentQuestion.options.map((optionText, idx) => (
            <NeuRadioOption
              key={idx}
              index={idx}
              label={optionText}
              avatar={currentQuestion.option_avatars?.[idx]}
              layout="card"
              isSelected={currentSelection === idx}
              onClick={() => handleSelect(idx)}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
          <NeuButton
            variant="ghost"
            onClick={handleBack}
            disabled={currentIndex === 0 || isSubmitting}
            className="text-gray-500 disabled:opacity-20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </NeuButton>

          <NeuButton
            variant={isLastQuestion ? 'primary' : 'default'}
            onClick={handleNext}
            disabled={!hasSelected || isSubmitting}
            isLoading={isSubmitting && isLastQuestion}
            className="min-w-[140px]"
          >
            {isLastQuestion ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Quiz</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </NeuButton>
        </div>
      </NeuCard>
    </div>
  );
};
