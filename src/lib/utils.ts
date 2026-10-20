import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
  
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base || 'friend'}-${randomSuffix}`;
}

export function getFriendshipTier(score: number, total: number) {
  if (total === 0) return { title: 'New Acquaintance', emoji: '👋', desc: 'No questions answered yet!' };
  const percentage = Math.round((score / total) * 100);

  if (percentage === 100) {
    return {
      title: 'Soulmate Status',
      emoji: '🔮',
      desc: 'You know them better than they know themselves! Unbelievable accuracy.',
      color: 'text-indigo-600',
    };
  } else if (percentage >= 80) {
    return {
      title: 'Day One Bestie',
      emoji: '🏆',
      desc: 'Certified ride-or-die. You know all their quirks and secrets.',
      color: 'text-emerald-600',
    };
  } else if (percentage >= 60) {
    return {
      title: 'Inner Circle Homie',
      emoji: '✨',
      desc: 'Solid connection! You definitely hang out and pay attention.',
      color: 'text-blue-600',
    };
  } else if (percentage >= 40) {
    return {
      title: 'Casual Acquaintance',
      emoji: '👀',
      desc: 'You guys have talked at a party, but maybe grab coffee soon?',
      color: 'text-amber-600',
    };
  } else {
    return {
      title: 'Did We Just Meet?',
      emoji: '💀',
      desc: 'Either you guessed blindly or they have some explaining to do.',
      color: 'text-rose-600',
    };
  }
}
