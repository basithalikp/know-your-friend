'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { RealtimeLeaderboard } from '@/components/quiz/RealtimeLeaderboard';
import { CopyLinkButton } from '@/components/shared/CopyLinkButton';
import { getQuizForTaker } from '@/actions/getQuiz';
import { getLeaderboard } from '@/actions/getLeaderboard';
import { Quiz, QuizSubmission } from '@/types/quiz';
import { Trophy, Play, PlusCircle } from 'lucide-react';

export default function LeaderboardClient({ slug }: { slug: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    async function loadData() {
      setLoading(true);
      const quizRes = await getQuizForTaker(slug);

      if (quizRes.quiz) {
        setQuiz(quizRes.quiz);
        const lbRes = await getLeaderboard(quizRes.quiz.id, slug);
        setSubmissions(lbRes.submissions);
      }
      setLoading(false);
    }

    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neu-bg flex items-center justify-center">
        <div className="neu-flat rounded-3xl p-8 animate-pulse flex flex-col items-center gap-3">
          <Trophy className="w-8 h-8 text-indigo-400" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/q/${slug}` : '';

  return (
    <div className="min-h-screen bg-neu-bg pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 neu-small px-3 py-1 rounded-full text-xs font-bold text-indigo-600 mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Scoreboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {quiz ? quiz.title : 'Quiz Leaderboard'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Realtime rankings of all friends who attempted this challenge.
          </p>
        </div>

        {/* Quick action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 neu-flat rounded-2xl p-4 border border-white/70">
          <div className="flex items-center gap-2">
            <CopyLinkButton url={shareUrl} />
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/q/${slug}`}>
              <NeuButton variant="primary" size="sm">
                <Play className="w-3.5 h-3.5" />
                <span>Take Quiz</span>
              </NeuButton>
            </Link>
            <Link href="/create">
              <NeuButton variant="default" size="sm">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Make Your Own</span>
              </NeuButton>
            </Link>
          </div>
        </div>

        {/* Realtime Leaderboard */}
        {quiz && (
          <RealtimeLeaderboard quizId={quiz.id} initialSubmissions={submissions} />
        )}
      </main>
    </div>
  );
}
