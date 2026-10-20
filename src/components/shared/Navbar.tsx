'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, User, LogOut, PlusCircle } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    const supabase = createClient();
    if (!supabase) {
      alert('Supabase credentials not configured in .env.local yet. Running in offline preview mode!');
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <header className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4 sm:px-6">
      <div className="neu-flat rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between border border-white/80 backdrop-blur-md">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 shadow-neu-small flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-gray-800 flex items-center gap-1.5">
              Know Your Friend
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                AI
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/create">
            <NeuButton variant="primary" size="sm" className="hidden sm:inline-flex">
              <PlusCircle className="w-4 h-4" />
              <span>Create Quiz</span>
            </NeuButton>
          </Link>

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 neu-small px-3 py-1.5 rounded-xl border border-white/50">
                {user.user_metadata?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'User'}
                    className="w-6 h-6 rounded-full border border-white object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-indigo-600" />
                )}
                <span className="text-xs font-semibold text-gray-700 max-w-[100px] truncate hidden md:inline">
                  {user.user_metadata?.full_name?.split(' ')[0] || 'Friend'}
                </span>
              </div>
              <NeuButton
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 rounded-xl text-gray-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
              </NeuButton>
            </div>
          ) : (
            <NeuButton
              variant="default"
              size="sm"
              onClick={handleSignInWithGoogle}
              className="text-xs font-semibold text-gray-700"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>Google Sign In</span>
            </NeuButton>
          )}
        </div>
      </div>
    </header>
  );
};
