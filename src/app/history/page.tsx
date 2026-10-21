'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { CopyLinkButton } from '@/components/shared/CopyLinkButton';
import { AuthModal } from '@/components/auth/AuthModal';
import { getUserQuizzes, UserQuizSummary } from '@/actions/getUserQuizzes';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  History,
  PlusCircle,
  ExternalLink,
  Trophy,
  HelpCircle,
  Calendar,
  Users,
  LogIn,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function HistoryPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<UserQuizSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const res = await getUserQuizzes();
    if (res.error) {
      setError(res.error);
    } else {
      setQuizzes(res.quizzes);
    }
    setLoading(false);
  };

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setAuthLoading(false);
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthLoading(false);
      if (data.user) {
        loadData();
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadData();
      } else {
        setQuizzes([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neu-bg pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/50 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 neu-small px-3 py-1 rounded-full text-xs font-bold text-rose-600 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Creator Dashboard</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              My Quiz History
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View your published friendship challenges, monitor responses, and share links.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <NeuButton
              variant="default"
              size="sm"
              onClick={() => startTransition(loadData)}
              disabled={loading || isPending}
              className="flex-1 sm:flex-none"
              title="Refresh quiz list"
            >
              <RefreshCw className={`w-4 h-4 ${loading || isPending ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </NeuButton>

            <Link href="/create" className="flex-1 sm:flex-none">
              <NeuButton variant="primary" size="sm" className="w-full">
                <PlusCircle className="w-4 h-4" />
                <span>Create New Quiz</span>
              </NeuButton>
            </Link>
          </div>
        </div>

        {/* Unauthenticated View */}
        {!authLoading && !user && (
          <NeuCard variant="float" className="text-center py-16 px-6 max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 mx-auto rounded-3xl neu-small flex items-center justify-center text-rose-500 bg-rose-50">
              <LogIn className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Sign in to view your quizzes</h2>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Sign in with your email or Google account to view the history of quizzes you have created.
              </p>
            </div>
            <NeuButton
              variant="primary"
              size="lg"
              onClick={() => setAuthModalOpen(true)}
              className="mx-auto text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sign Up</span>
            </NeuButton>
          </NeuCard>
        )}

        {/* Database or Fetch Error */}
        {user && error && (
          <NeuCard variant="flat" className="p-5 border border-rose-200 bg-rose-50/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-rose-800">Unable to load quiz history</p>
              <p className="text-rose-700 mt-1">{error}</p>
              <p className="text-xs text-rose-600 mt-2 font-mono">
                Make sure you have run the schema migration in your Supabase SQL Editor.
              </p>
            </div>
          </NeuCard>
        )}

        {/* Loading Skeleton */}
        {user && loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <NeuCard key={i} variant="flat" className="p-6 animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </NeuCard>
            ))}
          </div>
        )}

        {/* Empty State */}
        {user && !loading && !error && quizzes.length === 0 && (
          <NeuCard variant="flat" className="text-center py-16 px-6 space-y-5 border-dashed border-2 border-gray-300">
            <div className="w-16 h-16 mx-auto rounded-3xl neu-small flex items-center justify-center text-gray-400">
              <HelpCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">No quizzes found</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                You haven&apos;t created any quizzes yet. Generate personal AI trivia and challenge your friends!
              </p>
            </div>
            <Link href="/create">
              <NeuButton variant="primary" size="md">
                <PlusCircle className="w-4 h-4" />
                <span>Create Your First Quiz</span>
              </NeuButton>
            </Link>
          </NeuCard>
        )}

        {/* Quiz History List */}
        {user && !loading && quizzes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Your Quizzes ({quizzes.length})</span>
              <span>Status & Responses</span>
            </div>

            {quizzes.map((q) => {
              const quizUrl = typeof window !== 'undefined' ? `${window.location.origin}/q/${q.slug}` : `/q/${q.slug}`;
              const formattedDate = q.created_at
                ? new Date(q.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently';

              return (
                <NeuCard
                  key={q.id}
                  variant="flat"
                  className="p-5 sm:p-6 transition-all hover:border-rose-200 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 hover:text-rose-600 transition-colors">
                          <Link href={`/q/${q.slug}`}>{q.title}</Link>
                        </h3>
                        <NeuBadge variant={q.status === 'published' ? 'success' : 'default'}>
                          {q.status}
                        </NeuBadge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {formattedDate}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-700">
                          <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
                          {q.questionCount} {q.questionCount === 1 ? 'question' : 'questions'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <Users className="w-3.5 h-3.5 text-emerald-500" />
                          {q.submissionCount} {q.submissionCount === 1 ? 'friend attempted' : 'friends attempted'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <Link href={`/q/${q.slug}/leaderboard`}>
                        <NeuButton variant="default" size="sm" title="View Scoreboard">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          <span className="hidden sm:inline">Leaderboard</span>
                        </NeuButton>
                      </Link>

                      <Link href={`/q/${q.slug}`}>
                        <NeuButton variant="default" size="sm" title="Open Quiz Page">
                          <ExternalLink className="w-4 h-4 text-rose-600" />
                          <span className="hidden sm:inline">Play</span>
                        </NeuButton>
                      </Link>
                    </div>
                  </div>

                  {/* Share Link Row */}
                  <div className="neu-pressed rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 border border-white/60">
                    <span className="text-xs font-mono text-gray-600 truncate max-w-[280px] sm:max-w-md">
                      {quizUrl}
                    </span>
                    <CopyLinkButton url={quizUrl} variant="primary" />
                  </div>
                </NeuCard>
              );
            })}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}
