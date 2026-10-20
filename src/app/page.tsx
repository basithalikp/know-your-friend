import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { NeuCard } from '@/components/neumorphic/NeuCard';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { NeuBadge } from '@/components/neumorphic/NeuBadge';
import {
  Sparkles,
  ShieldCheck,
  Trophy,
  Zap,
  ArrowRight,
  Heart,
  HelpCircle,
  Play,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neu-bg pb-24">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 neu-small px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-indigo-700 border border-white/80">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Powered by Google Gemini 2.5 & Supabase</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            How Well Do Your Friends{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
              Really Know You?
            </span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Generate personalized, witty trivia questions about your habits, food cravings, and quirks in seconds. Challenge your friends to a strictly{' '}
            <span className="text-gray-900 font-bold underline decoration-indigo-400">one-attempt</span> showdown.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/create" className="w-full sm:w-auto">
            <NeuButton variant="primary" size="lg" className="w-full sm:w-auto text-base">
              <Sparkles className="w-5 h-5" />
              <span>Create Your Quiz Free</span>
              <ArrowRight className="w-4 h-4" />
            </NeuButton>
          </Link>

          <Link href="/q/alex-trivia-demo" className="w-full sm:w-auto">
            <NeuButton variant="default" size="lg" className="w-full sm:w-auto text-base">
              <Play className="w-4 h-4 text-indigo-600" />
              <span>Play Demo Quiz</span>
            </NeuButton>
          </Link>
        </div>

        {/* Tactile Preview Card */}
        <div className="pt-8 max-w-2xl mx-auto">
          <NeuCard variant="float" className="text-left p-6 sm:p-8 space-y-5 border border-white/90">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  AI
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Sample Question Preview</p>
                  <p className="text-[11px] text-gray-400">Tactile Soft UI Design</p>
                </div>
              </div>
              <NeuBadge variant="accent">Comfort Food & Cravings</NeuBadge>
            </div>

            <p className="text-base sm:text-lg font-bold text-gray-900">
              &quot;What is Alex&apos;s go-to comfort meal after an exhausting day?&quot;
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="neu-small rounded-2xl p-4 text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>A. Extra-cheesy deep dish pizza</span>
                <span className="w-4 h-4 rounded-full neu-pressed" />
              </div>
              <div className="neu-accent-inset rounded-2xl p-4 text-xs sm:text-sm font-bold text-indigo-700 flex items-center justify-between border border-indigo-300">
                <span>B. Spicy ramen with extra egg</span>
                <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>
              <div className="neu-small rounded-2xl p-4 text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>C. Late-night street tacos</span>
                <span className="w-4 h-4 rounded-full neu-pressed" />
              </div>
              <div className="neu-small rounded-2xl p-4 text-xs sm:text-sm font-semibold text-gray-700 flex items-center justify-between">
                <span>D. Double bacon cheeseburger</span>
                <span className="w-4 h-4 rounded-full neu-pressed" />
              </div>
            </div>
          </NeuCard>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Designed for Authentic Friendship Debates
          </h2>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Everything you need for an addictive, cheat-proof social challenge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <NeuCard variant="flat" className="p-6 sm:p-8 space-y-4 hover:shadow-neu-float transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 neu-small flex items-center justify-center text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Gemini 2.5 Flash Engine</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Generate questions about quirks, travel pet peeves, and emergency reactions with instant JSON schema precision.
            </p>
          </NeuCard>

          {/* Card 2 */}
          <NeuCard variant="flat" className="p-6 sm:p-8 space-y-4 hover:shadow-neu-float transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 neu-small flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Single-Attempt Anti-Cheat</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Answers are kept server-side only. Google Auth + DB unique constraint ensures each friend gets exactly ONE shot.
            </p>
          </NeuCard>

          {/* Card 3 */}
          <NeuCard variant="flat" className="p-6 sm:p-8 space-y-4 hover:shadow-neu-float transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 neu-small flex items-center justify-center text-amber-600">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Live Realtime Scoreboard</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Watch your friends take the quiz in real time! Ranked leaderboards and friendship tiers like Soulmate vs Day One Bestie.
            </p>
          </NeuCard>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">
        <NeuCard variant="float" className="p-8 sm:p-14 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Ready to Put Your Friends to the Test?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
              It takes less than 2 minutes to generate and share your personalized quiz link.
            </p>
          </div>

          <Link href="/create">
            <NeuButton variant="primary" size="lg" className="text-base px-8 py-4">
              <Sparkles className="w-5 h-5" />
              <span>Create Your Quiz Now</span>
            </NeuButton>
          </Link>
        </NeuCard>
      </section>
    </div>
  );
}
