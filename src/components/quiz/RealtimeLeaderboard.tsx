'use client';

import React, { useEffect, useState } from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { QuizSubmission } from '@/types/quiz';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Medal, Clock, Users, User, Radio } from 'lucide-react';

interface RealtimeLeaderboardProps {
  quizId: string;
  initialSubmissions: QuizSubmission[];
}

export const RealtimeLeaderboard: React.FC<RealtimeLeaderboardProps> = ({
  quizId,
  initialSubmissions,
}) => {
  const [submissions, setSubmissions] = useState<QuizSubmission[]>(initialSubmissions);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    setSubmissions(initialSubmissions);

    const supabase = createClient();
    if (!supabase) return;

    // Subscribe to Supabase Realtime for live score updates
    const channel = supabase
      .channel(`submissions:${quizId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'quiz_submissions',
          filter: `quiz_id=eq.${quizId}`,
        },
        (payload) => {
          const newSubmission = payload.new as QuizSubmission;
          setSubmissions((prev) => {
            // Check if already in list
            if (prev.some((s) => s.id === newSubmission.id)) return prev;
            const updated = [newSubmission, ...prev];
            return updated.sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
            });
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [quizId, initialSubmissions]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-extrabold text-sm shadow-sm border border-amber-300">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-sm shadow-sm border border-slate-300">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-extrabold text-sm shadow-sm border border-amber-200">
          🥉
        </span>
      );
    }
    return (
      <span className="w-8 h-8 rounded-xl neu-pressed text-gray-500 flex items-center justify-center font-bold text-xs">
        #{rank}
      </span>
    );
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <NeuCard variant="float" className="w-full p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-neu-small">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Friend Leaderboard
              {isLive && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                  <Radio className="w-3 h-3" />
                  Live
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">
              {submissions.length} {submissions.length === 1 ? 'friend' : 'friends'} attempted
            </p>
          </div>
        </div>

        <NeuBadge variant="accent">
          <Users className="w-3.5 h-3.5" />
          <span>{submissions.length}</span>
        </NeuBadge>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="text-center py-10 neu-pressed rounded-2xl p-6 text-gray-500 space-y-2">
          <Medal className="w-8 h-8 mx-auto text-gray-400 stroke-1" />
          <p className="text-sm font-semibold">No submissions recorded yet.</p>
          <p className="text-xs text-gray-400">Share your quiz link to see who scores highest!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <div
                key={sub.id || index}
                className={`neu-small rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-all ${
                  isTopThree ? 'border border-rose-100 bg-white/40' : ''
                }`}
              >
                {/* Rank & User Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {getRankBadge(rank)}

                  {sub.user_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.user_avatar}
                      alt={sub.user_name}
                      className="w-9 h-9 rounded-xl object-cover border border-white shadow-sm shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl neu-pressed flex items-center justify-center text-gray-500 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">
                      {sub.user_name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(sub.submitted_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Score Tag */}
                <div className="flex items-baseline gap-1 neu-pressed px-3 py-1.5 rounded-xl shrink-0">
                  <span className="text-base sm:text-lg font-black text-rose-600">
                    {sub.score}
                  </span>
                  <span className="text-xs font-semibold text-gray-400">
                    /{sub.total_questions}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </NeuCard>
  );
};
