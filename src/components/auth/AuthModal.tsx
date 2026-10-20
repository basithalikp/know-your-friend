'use client';

import React, { useState } from 'react';
import { NeuModal } from '@/components/neumorphic/NeuModal';
import { NeuInput } from '@/components/neumorphic/NeuInput';
import { NeuButton } from '@/components/neumorphic/NeuButton';
import { createClient } from '@/lib/supabase/client';
import { Mail, Lock, User, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setPassword('');
  };

  const handleModeChange = (newMode: 'signin' | 'signup' | 'magic') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError('Supabase connection not initialized. Please check credentials.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              name: fullName.trim(),
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          setSuccessMsg('Account created and signed in successfully!');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 1000);
        } else {
          setSuccessMsg(
            'Check your email for the confirmation link to complete registration!'
          );
        }
      } else if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onClose();
            if (onSuccess) onSuccess();
          }, 800);
        }
      } else if (mode === 'magic') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.href,
          },
        });

        if (otpError) {
          setError(otpError.message);
        } else {
          setSuccessMsg('Magic login link sent to your email! Click it to sign in instantly.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            window.location.pathname
          )}`,
        },
      });

      if (oauthError) {
        if (oauthError.message.includes('not enabled') || oauthError.message.includes('Unsupported provider')) {
          setError(
            'Google OAuth is not enabled in your Supabase project dashboard. Use Email + Password below instead!'
          );
        } else {
          setError(oauthError.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <NeuModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'signup'
          ? 'Create Account'
          : mode === 'magic'
          ? 'Magic Link Login'
          : 'Welcome Back'
      }
      description={
        mode === 'signup'
          ? 'Sign up to create and save your personalized quizzes'
          : mode === 'magic'
          ? 'Get a passwordless login link delivered to your inbox'
          : 'Sign in to access your quizzes and track friend scores'
      }
    >
      {/* Mode Toggle Switcher */}
      <div className="flex items-center gap-1.5 p-1 neu-pressed rounded-2xl mb-4">
        <NeuButton
          type="button"
          size="sm"
          variant={mode === 'signin' ? 'primary' : 'ghost'}
          onClick={() => handleModeChange('signin')}
          className="flex-1 py-1.5 text-xs font-bold"
        >
          Sign In
        </NeuButton>
        <NeuButton
          type="button"
          size="sm"
          variant={mode === 'signup' ? 'primary' : 'ghost'}
          onClick={() => handleModeChange('signup')}
          className="flex-1 py-1.5 text-xs font-bold"
        >
          Sign Up
        </NeuButton>
        <NeuButton
          type="button"
          size="sm"
          variant={mode === 'magic' ? 'primary' : 'ghost'}
          onClick={() => handleModeChange('magic')}
          className="flex-1 py-1.5 text-xs font-bold"
        >
          Magic Link
        </NeuButton>
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {mode === 'signup' && (
          <NeuInput
            label="Full Name"
            placeholder="e.g. Alex Rivera"
            icon={<User className="w-4 h-4 text-gray-400" />}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        )}

        <NeuInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="w-4 h-4 text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode !== 'magic' && (
          <NeuInput
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4 text-gray-400" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}

        <NeuButton
          variant="primary"
          size="lg"
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full mt-2"
        >
          {mode === 'signup' ? (
            <span>Create Account</span>
          ) : mode === 'magic' ? (
            <span>Send Magic Link</span>
          ) : (
            <span>Sign In</span>
          )}
        </NeuButton>
      </form>

      {/* Google OAuth (Optional Divider) */}
      <div className="pt-4 border-t border-gray-200/50 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px bg-gray-200 flex-1" />
          <span className="text-[11px] font-bold text-gray-400 uppercase">Or Continue With</span>
          <div className="h-px bg-gray-200 flex-1" />
        </div>

        <NeuButton
          variant="default"
          onClick={handleGoogleSignIn}
          className="w-full text-xs font-semibold py-3"
          title="Sign in with Google if enabled in Supabase"
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
          <span>Continue with Google</span>
        </NeuButton>
      </div>
    </NeuModal>
  );
};
