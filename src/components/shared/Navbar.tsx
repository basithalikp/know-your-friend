'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { AuthModal } from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';
import { Sparkles, User, LogOut, PlusCircle, LogIn } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const Navbar: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <>
      <header className="sticky top-4 z-40 w-full max-w-5xl mx-auto px-4 sm:px-6">
        <div className="neu-flat rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 flex items-center justify-between border border-white/80 backdrop-blur-md">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 shadow-neu-small flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-gray-800 flex items-center gap-1.5">
                Know Your Friend
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700">
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
                    <User className="w-4 h-4 text-rose-600" />
                  )}
                  <span className="text-xs font-semibold text-gray-700 max-w-[120px] truncate hidden md:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Friend'}
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
                onClick={() => setAuthModalOpen(true)}
                className="text-xs font-semibold text-gray-700"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-600" />
                <span>Sign In / Sign Up</span>
              </NeuButton>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </>
  );
};
