'use client';

import React, { useState } from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuRadioOption } from '@/components/neumorphic/NeuRadioOption';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { StagedQuestion } from '@/types/quiz';
import { Sparkles, RefreshCw, Plus, AlertCircle, Edit3 } from 'lucide-react';

interface QuestionGeneratorCardProps {
  creatorName: string;
  previousQuestions: string[];
  onAddQuestion: (question: StagedQuestion) => void;
}

export const QuestionGeneratorCard: React.FC<QuestionGeneratorCardProps> = ({
  creatorName,
  previousQuestions,
  onAddQuestion,
}) => {
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState(
    `What is ${creatorName || "my"} ultimate go-to meal after an exhausting day?`
  );
  const [options, setOptions] = useState<string[]>([
    'Extra-cheesy deep dish pizza',
    'Spicy ramen with extra egg',
    'Late-night street tacos with lime',
    'Double bacon burger and fries',
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [category, setCategory] = useState<string>('comfort food and cravings');
  const [error, setError] = useState<string | null>(null);

  const generateNewQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: creatorName || 'I',
          previousQuestions,
          topicCategory: category,
        }),
      });

      const data = await res.json();
      if (data.question && Array.isArray(data.options)) {
        setQuestionText(data.question);
        setOptions(data.options);
        setCorrectIndex(0); // reset selection to first by default
        if (data.suggestedCategory) {
          setCategory(data.suggestedCategory);
        }
      } else {
        setError('Could not generate question. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (idx: number, newText: string) => {
    const updated = [...options];
    updated[idx] = newText;
    setOptions(updated);
  };

  const handleAdd = () => {
    if (!questionText.trim()) {
      setError('Please provide question text.');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      setError('All 4 options must have text.');
      return;
    }
    if (correctIndex < 0 || correctIndex > 3) {
      setError('Please tap one option to mark your true answer!');
      return;
    }

    onAddQuestion({
      id: `staged-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      question_text: questionText.trim(),
      options: options.map((o) => o.trim()),
      correct_option_index: correctIndex,
      suggested_category: category,
    });

    // Auto-generate next question
    generateNewQuestion();
  };

  return (
    <NeuCard variant="float" className="w-full relative overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">AI Question Generator</h3>
            <p className="text-xs text-gray-500">Pick which option is truly you!</p>
          </div>
        </div>

        <NeuBadge variant="accent" className="capitalize">
          {category}
        </NeuBadge>
      </div>

      {/* Editable Question Box */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Question (Editable)</span>
          </label>
        </div>
        <div className="neu-pressed rounded-2xl p-4 sm:p-5 border border-white/60">
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={loading}
            rows={2}
            className="w-full bg-transparent outline-none text-base sm:text-lg font-semibold text-gray-800 resize-none placeholder:text-gray-400"
            placeholder="Type or edit your question..."
          />
        </div>
      </div>

      {/* 4 Interactive Options */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Answer Choices (Tap to select your true answer)
          </span>
          <span className="text-xs text-indigo-600 font-semibold">
            {correctIndex >= 0 ? `Option ${['A', 'B', 'C', 'D'][correctIndex]} selected` : 'Select one'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, idx) => (
            <NeuRadioOption
              key={idx}
              index={idx}
              label={opt}
              editable={true}
              onTextChange={(newText) => handleOptionChange(idx, newText)}
              isCreatorAnswer={correctIndex === idx}
              onClick={() => setCorrectIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-rose-600 neu-small p-3 rounded-xl border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-200/50">
        <NeuButton
          variant="default"
          onClick={generateNewQuestion}
          disabled={loading}
          isLoading={loading}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Reroll with Gemini</span>
        </NeuButton>

        <NeuButton
          variant="primary"
          onClick={handleAdd}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Quiz</span>
        </NeuButton>
      </div>
    </NeuCard>
  );
};
