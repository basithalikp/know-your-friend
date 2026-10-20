'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { NeuModal } from '@/components/neumorphic/NeuModal';
import { QuestionGeneratorCard } from '@/components/quiz/QuestionGeneratorCard';
import { QuestionQueueList } from '@/components/quiz/QuestionQueueList';
import { CopyLinkButton } from '@/components/shared/CopyLinkButton';
import { StagedQuestion } from '@/types/quiz';
import { publishQuiz } from '@/actions/publishQuiz';
import { createClient } from '@/lib/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Sparkles, Send, CheckCircle, ExternalLink } from 'lucide-react';

export default function CreateQuizPage() {
  const router = useRouter();
  const [creatorName, setCreatorName] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<StagedQuestion[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<{ slug: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if Supabase user is logged in
  useEffect(() => {
    const supabase = createClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user?.user_metadata?.full_name) {
          const name = data.user.user_metadata.full_name;
          setCreatorName(name);
          setQuizTitle(`How Well Do You Really Know ${name.split(' ')[0]}?`);
        }
      });
    }
  }, []);

  const handleNameChange = (val: string) => {
    setCreatorName(val);
    if (!quizTitle || quizTitle.startsWith('How Well Do You Really Know')) {
      setQuizTitle(`How Well Do You Really Know ${val ? val.split(' ')[0] : 'Me'}?`);
    }
  };

  const handleAddQuestion = (q: StagedQuestion) => {
    setQuestions((prev) => [...prev, q]);
    setError(null);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === questions.length - 1) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handlePublish = async () => {
    if (!creatorName.trim()) {
      setError('Please enter your name to personalize your quiz!');
      return;
    }
    if (questions.length === 0) {
      setError('Please stage at least 1 question using the AI generator!');
      return;
    }

    setIsPublishing(true);
    setError(null);

    const res = await publishQuiz({
      creatorName: creatorName.trim(),
      title: quizTitle.trim() || `How Well Do You Know ${creatorName}?`,
      questions,
    });

    setIsPublishing(false);

    if (res.error) {
      setError(res.error);
    } else if (res.slug) {
      const fullUrl = `${window.location.origin}/q/${res.slug}`;
      setPublishResult({
        slug: res.slug,
        url: fullUrl,
      });
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Header Hero */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 neu-small px-3 py-1 rounded-full text-xs font-bold text-indigo-600 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Quiz Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Create Your Friend Challenge
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
            Use Gemini AI to generate personal trivia questions, designate your true answers, and share a 1-attempt challenge with your friends!
          </p>
        </div>

        {/* Step 1: Creator Details */}
        <NeuCard variant="flat" className="space-y-4">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm">
              1
            </span>
            <span>Your Info & Quiz Title</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput
              label="Your Name"
              placeholder="e.g. Alex Rivera"
              value={creatorName}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <NeuInput
              label="Quiz Title"
              placeholder="e.g. How Well Do You Really Know Alex?"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>
        </NeuCard>

        {/* Step 2: AI Question Generator */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 px-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm">
              2
            </span>
            <span>Generate & Review Questions</span>
          </h2>

          <QuestionGeneratorCard
            creatorName={creatorName}
            previousQuestions={questions.map((q) => q.question_text)}
            onAddQuestion={handleAddQuestion}
          />
        </div>

        {/* Step 3: Staged Questions Review */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 px-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-sm">
              3
            </span>
            <span>Quiz Review ({questions.length} Staged)</span>
          </h2>

          <QuestionQueueList
            questions={questions}
            onRemove={handleRemoveQuestion}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Step 4: Publish Trigger Bar */}
        <NeuCard variant="float" className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">Ready to Challenge Your Friends?</h3>
            <p className="text-xs sm:text-sm text-gray-500">
              {questions.length >= 3
                ? `Great job! You have staged ${questions.length} questions.`
                : `We recommend at least 3 questions (currently ${questions.length}).`}
            </p>
          </div>

          <NeuButton
            variant="primary"
            size="lg"
            onClick={handlePublish}
            disabled={isPublishing || questions.length === 0}
            isLoading={isPublishing}
            className="w-full sm:w-auto"
          >
            <Send className="w-4 h-4" />
            <span>Publish Quiz & Get Link</span>
          </NeuButton>
        </NeuCard>
      </main>

      {/* Publish Success Modal */}
      {publishResult && (
        <NeuModal
          isOpen={true}
          onClose={() => setPublishResult(null)}
          title="🎉 Your Quiz is Live!"
          description="Share this one-attempt challenge link with your friends to see who knows you best."
        >
          <div className="space-y-5 text-center py-2">
            {/* QR Code Container */}
            <div className="inline-block p-4 neu-flat rounded-2xl border border-white/80">
              <QRCodeSVG
                value={publishResult.url}
                size={160}
                bgColor="#eef2f6"
                fgColor="#1f2937"
                level="Q"
              />
            </div>

            {/* Direct Link Recessed Box */}
            <div className="neu-pressed rounded-2xl p-3 flex items-center justify-between gap-2 border border-white/60">
              <span className="text-xs sm:text-sm font-mono text-gray-700 truncate max-w-[280px]">
                {publishResult.url}
              </span>
              <CopyLinkButton url={publishResult.url} variant="primary" />
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Take my "How Well Do You Know Me?" quiz! One attempt only: ${publishResult.url}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-small px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 hover:shadow-neu-flat flex items-center gap-1.5 transition-all"
              >
                <span>WhatsApp</span>
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Take my "How Well Do You Know Me?" quiz! One attempt only: ${publishResult.url}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-small px-4 py-2 rounded-xl text-xs font-bold text-sky-600 hover:shadow-neu-flat flex items-center gap-1.5 transition-all"
              >
                <span>Share on X</span>
              </a>
            </div>

            {/* Navigate to Taker Experience */}
            <div className="pt-4 border-t border-gray-200/50 flex flex-col sm:flex-row gap-2.5">
              <NeuButton
                variant="default"
                onClick={() => router.push(`/q/${publishResult.slug}`)}
                className="w-full flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Quiz Page</span>
              </NeuButton>
              <NeuButton
                variant="primary"
                onClick={() => router.push(`/q/${publishResult.slug}/leaderboard`)}
                className="w-full flex-1"
              >
                <span>View Live Scoreboard</span>
              </NeuButton>
            </div>
          </div>
        </NeuModal>
      )}
    </div>
  );
}
