'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  trigger?: boolean;
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({ trigger = true }) => {
  useEffect(() => {
    if (!trigger) return;

    // First burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#818cf8', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Second celebratory burst with delay
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#10b981', '#3b82f6'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#818cf8', '#f59e0b', '#ec4899'],
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [trigger]);

  return null;
};
