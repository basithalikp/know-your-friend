'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { QuizStepper } from '@/components/quiz/QuizStepper';
import { ScoreCelebration } from '@/components/quiz/ScoreCelebration';
import { AnswersBreakdown } from '@/components/quiz/AnswersBreakdown';
import { RealtimeLeaderboard } from '@/components/quiz/RealtimeLeaderboard';
import { getQuizForTaker } from '@/actions/getQuiz';
import { submitQuizAttempt } from '@/actions/submitQuiz';
import { getLeaderboard } from '@/actions/getLeaderboard';
import { createClient } from '@/lib/supabase/client';
import { Quiz, QuizSubmission, AnswerItem } from '@/types/quiz';
import { Sparkles, ShieldAlert, PlusCircle, ArrowRight, UserCheck } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function TakeQuizClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [takerName, setTakerName] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Completed State
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [breakdown, setBreakdown] = useState<AnswerItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<QuizSubmission[]>([]);

  useEffect(() => {
    if (!slug) return;

    async function loadQuizData() {
      setLoading(true);
      const res = await getQuizForTaker(slug);

      if (res.error || !res.quiz) {
        setError(res.error || 'Quiz not found');
        setLoading(false);
        return;
      }

      setQuiz(res.quiz);

      // Check user session and submissions
      const supabase = createClient();
      if (supabase) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          setTakerName(currentUser.user_metadata?.full_name || 'Friend');

          // Check if already attempted
          const { data: existingSub } = await supabase
            .from('quiz_submissions')
            .select('*')
            .eq('quiz_id', res.quiz.id)
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (existingSub) {
            setSubmission(existingSub as QuizSubmission);
            setBreakdown((existingSub.answers as AnswerItem[]) || []);
          }
        }
      }

      // Fetch leaderboard
      const lbRes = await getLeaderboard(res.quiz.id, slug);
      setLeaderboard(lbRes.submissions);

      setLoading(false);
    }

    loadQuizData();
  }, [slug]);

  const handleGoogleSignIn = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
    } else {
      alert('Supabase credentials not configured in .env.local yet. You can enter your name below to play!');
    }
  };

  const handleStartQuiz = () => {
    if (!takerName.trim()) {
      alert('Please enter your name or sign in with Google to start!');
      return;
    }
    setHasStarted(true);
  };

  const handleSubmitQuiz = async (answers: { question_id: string; selected_index: number }[]) => {
    if (!quiz) return;
    setIsSubmitting(true);

    const res = await submitQuizAttempt({
      quizId: quiz.id,
      slug: quiz.slug,
      takerName: user?.user_metadata?.full_name || takerName.trim(),
      answers,
      userId: user?.id,
      userAvatar: user?.user_metadata?.avatar_url,
    });

    setIsSubmitting(false);

    if (res.error && !res.alreadySubmitted) {
      alert(res.error);
      return;
    }

    if (res.submission) {
      setSubmission(res.submission);
      setBreakdown(res.breakdown || (res.submission.answers as AnswerItem[]) || []);

      // Refresh leaderboard
      const lbRes = await getLeaderboard(quiz.id, slug);
      setLeaderboard(lbRes.submissions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neu-bg flex flex-col items-center justify-center p-6">
        <div className="neu-flat rounded-3xl p-8 flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-indigo-200" />
          <div className="h-4 w-40 bg-gray-300 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-neu-bg">
        <Navbar />
        <div className="max-w-md mx-auto px-4 pt-20 text-center">
          <NeuCard variant="float" className="space-y-4">
            <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-800">Quiz Not Found</h2>
            <p className="text-sm text-gray-600">
              This quiz link may be incorrect, expired, or still in draft mode.
            </p>
            <Link href="/create">
              <NeuButton variant="primary" className="w-full">
                Create Your Own Quiz
              </NeuButton>
            </Link>
          </NeuCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neu-bg pb-20">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* State A: Quiz Already Completed / Results Mode */}
        {submission ? (
          <div className="space-y-8">
            <ScoreCelebration
              score={submission.score}
              total={submission.total_questions}
              creatorName={quiz.creator_name}
            />

            <AnswersBreakdown
              questions={quiz.questions || []}
              breakdown={breakdown}
              creatorName={quiz.creator_name}
            />

            <RealtimeLeaderboard quizId={quiz.id} initialSubmissions={leaderboard} />

            <NeuCard variant="flat" className="text-center p-6 space-y-3">
              <h4 className="text-base font-bold text-gray-800">
                Want to see what your friends know about YOU?
              </h4>
              <p className="text-xs sm:text-sm text-gray-500">
                Create your own 1-attempt AI quiz in under 60 seconds.
              </p>
              <Link href="/create">
                <NeuButton variant="primary" size="lg" className="mx-auto">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create My Own Quiz</span>
                </NeuButton>
              </Link>
            </NeuCard>
          </div>
        ) : !hasStarted ? (
          /* State B: Pre-Quiz Gatekeeper (Auth / Identity + Single Attempt Warning) */
          <NeuCard variant="float" className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 neu-small flex items-center justify-center text-indigo-600 border border-white">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="neu-small px-3 py-1 rounded-full text-xs font-bold text-indigo-600">
                One-Attempt Friend Challenge
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {quiz.title}
              </h1>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                <strong className="text-gray-800">{quiz.creator_name}</strong> created this quiz to test your friendship. You only get{' '}
                <strong className="text-indigo-600">ONE single attempt</strong>!
              </p>
            </div>

            {/* User identification */}
            <div className="max-w-sm mx-auto space-y-4 pt-2">
              {user ? (
                <div className="neu-pressed rounded-2xl p-4 flex items-center gap-3 border border-white/60">
                  {user.user_metadata?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.user_metadata.avatar_url}
                      alt={takerName}
                      className="w-10 h-10 rounded-xl object-cover border border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      {takerName.charAt(0)}
                    </div>
                  )}
                  <div className="text-left min-w-0">
                    <p className="text-xs text-gray-400 font-semibold">Playing as</p>
                    <p className="text-sm font-bold text-gray-800 truncate">{takerName}</p>
                  </div>
                  <UserCheck className="w-5 h-5 text-emerald-600 ml-auto" />
                </div>
              ) : (
                <div className="space-y-3">
                  <NeuButton
                    variant="default"
                    onClick={handleGoogleSignIn}
                    className="w-full text-xs font-semibold py-3.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google to Claim Attempt</span>
                  </NeuButton>

                  <div className="flex items-center gap-2 my-2">
                    <div className="h-px bg-gray-300 flex-1" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Or play with name</span>
                    <div className="h-px bg-gray-300 flex-1" />
                  </div>

                  <NeuInput
                    placeholder="Enter your name..."
                    value={takerName}
                    onChange={(e) => setTakerName(e.target.value)}
                  />
                </div>
              )}

              <NeuButton
                variant="primary"
                size="lg"
                onClick={handleStartQuiz}
                disabled={!takerName.trim()}
                className="w-full"
              >
                <span>Begin One-Time Attempt</span>
                <ArrowRight className="w-4 h-4" />
              </NeuButton>
            </div>
          </NeuCard>
        ) : (
          /* State C: Active Interactive Quiz Stepper */
          <div className="space-y-4">
            <QuizStepper
              questions={quiz.questions || []}
              creatorName={quiz.creator_name}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitQuiz}
            />
          </div>
        )}
      </main>
    </div>
  );
}
