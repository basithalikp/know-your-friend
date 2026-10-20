'use client';

import React, { useState, useEffect } from 'react';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import { getFriendshipTier } from '@/lib/utils';
import { ConfettiEffect } from '@/components/shared/Confetti';
import { Trophy, Award } from 'lucide-react';

interface ScoreCelebrationProps {
  score: number;
  total: number;
  creatorName: string;
}

export const ScoreCelebration: React.FC<ScoreCelebrationProps> = ({
  score,
  total,
  creatorName,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const tier = getFriendshipTier(score, total);
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    let current = 0;
    const duration = 1000;
    const stepTime = Math.max(Math.floor(duration / Math.max(score, 1)), 50);

    const timer = setInterval(() => {
      current += 1;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <NeuCard variant="float" className="text-center p-8 sm:p-12 space-y-6 relative overflow-hidden">
      <ConfettiEffect trigger={score > 0} />

      {/* Floating Trophy Icon */}
      <div className="w-20 h-20 mx-auto rounded-3xl neu-flat flex items-center justify-center border border-white/80">
        <span className="text-4xl">{tier.emoji}</span>
      </div>

      {/* Score Big Display */}
      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Your Accuracy
        </span>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-6xl sm:text-7xl font-black text-gray-900 tracking-tight">
            {displayScore}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-400">
            /{total}
          </span>
        </div>
        <p className="text-sm font-semibold text-rose-600">
          {percentage}% Match with {creatorName}
        </p>
      </div>

      {/* Friendship Tier Badge */}
      <div className="space-y-2 max-w-md mx-auto pt-2">
        <NeuBadge
          variant="accent"
          className="text-sm px-4 py-1.5 font-bold tracking-wide shadow-sm"
        >
          <Award className="w-4 h-4 text-rose-600" />
          <span>{tier.title}</span>
        </NeuBadge>
        <p className="text-sm text-gray-600 font-medium leading-relaxed">
          {tier.desc}
        </p>
      </div>
    </NeuCard>
  );
};
