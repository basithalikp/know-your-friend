import { AvatarConfig, DiceBearStyle } from '@/types/quiz';

/**
 * Returns a standardized DiceBear avatar SVG URL.
 * Radius is set to 50 for smooth rounded aesthetics, and background is transparent
 * to seamlessly adapt to the neumorphic container background.
 */
export function getDiceBearUrl(avatar?: AvatarConfig, fallbackSeed = 'friend'): string {
  const style: DiceBearStyle = avatar?.style || 'fun-emoji';
  const seed = encodeURIComponent(avatar?.seed || fallbackSeed);
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&radius=50&backgroundColor=transparent`;
}

/**
 * Fallback mapping function that assigns intelligent DiceBear styles and seeds
 * to questions and options if AI generation is skipped or times out.
 */
export function inferFallbackAvatar(
  text: string,
  category?: string
): AvatarConfig {
  const lower = (text + ' ' + (category || '')).toLowerCase();

  // 1. Food / beverages / objects / tools / sports
  if (
    lower.includes('pizza') ||
    lower.includes('ramen') ||
    lower.includes('taco') ||
    lower.includes('burger') ||
    lower.includes('coffee') ||
    lower.includes('snack') ||
    lower.includes('meal') ||
    lower.includes('eat') ||
    lower.includes('drink') ||
    lower.includes('food') ||
    lower.includes('bike') ||
    lower.includes('car') ||
    lower.includes('book')
  ) {
    let seed = 'cupHot';
    if (lower.includes('pizza') || lower.includes('burger') || lower.includes('food')) seed = 'heart';
    if (lower.includes('coffee') || lower.includes('drink')) seed = 'cupHot';
    if (lower.includes('book') || lower.includes('read')) seed = 'book';
    if (lower.includes('car') || lower.includes('travel')) seed = 'car';
    return { style: 'icons', seed };
  }

  // 2. Gaming / tech / robots / automation
  if (
    lower.includes('game') ||
    lower.includes('tech') ||
    lower.includes('tab') ||
    lower.includes('phone') ||
    lower.includes('bot') ||
    lower.includes('code') ||
    lower.includes('computer')
  ) {
    return { style: 'bottts', seed: 'pixel' };
  }

  // 3. Work / college / routine / overthinking
  if (
    lower.includes('work') ||
    lower.includes('study') ||
    lower.includes('college') ||
    lower.includes('routine') ||
    lower.includes('alarm') ||
    lower.includes('focus')
  ) {
    return { style: 'notionists', seed: 'overthinker' };
  }

  // 4. Looks / fashion / childhood / people / friends
  if (
    lower.includes('childhood') ||
    lower.includes('style') ||
    lower.includes('outfit') ||
    lower.includes('dating') ||
    lower.includes('romantic') ||
    lower.includes('crush')
  ) {
    return { style: 'lorelei', seed: 'cheerful' };
  }

  // 5. Hot takes / opinions / peeves / reactions
  if (
    lower.includes('peeve') ||
    lower.includes('opinion') ||
    lower.includes('hate') ||
    lower.includes('love') ||
    lower.includes('argue') ||
    lower.includes('take')
  ) {
    return { style: 'thumbs', seed: 'confused' };
  }

  // 6. Abstract / deep-talk / mystery
  if (
    lower.includes('dream') ||
    lower.includes('future') ||
    lower.includes('secret') ||
    lower.includes('fear') ||
    lower.includes('panic')
  ) {
    return { style: 'shapes', seed: 'midnight' };
  }

  // Default to fun-emoji
  return { style: 'fun-emoji', seed: 'crying-laughing' };
}
