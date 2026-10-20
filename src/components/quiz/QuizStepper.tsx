'use client';

import React, { useState } from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuRadioOption } from '@/components/neumorphic/NeuRadioOption';
import { NeuProgressBar } from '@/components/neumorphic/NeuProgressBar';
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
      <NeuCard variant="float" className="relative p-6 sm:p-10 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 neu-small px-3 py-1 rounded-xl">
            {creatorName}&apos;s Challenge
          </span>
          <span className="text-xs font-semibold text-gray-400">
            {currentIndex + 1} of {total}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug tracking-tight">
          {currentQuestion.question_text}
        </h2>

        {/* 4 Choices */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((optionText, idx) => (
            <NeuRadioOption
              key={idx}
              index={idx}
              label={optionText}
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
