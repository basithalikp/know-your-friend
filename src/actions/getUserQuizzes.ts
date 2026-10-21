'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Quiz } from '@/types/quiz';

export interface UserQuizSummary {
  id: string;
  title: string;
  slug: string;
  created_at: string;
  status: 'published' | 'draft';
  questionCount: number;
  submissionCount: number;
}

export async function getUserQuizzes(): Promise<{ quizzes: UserQuizSummary[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return { quizzes: [], error: 'Database connection not available.' };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { quizzes: [], error: 'Not authenticated' };
    }

    // Query quizzes created by this user
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        slug,
        created_at,
        status,
        quiz_questions (count),
        quiz_submissions (count)
      `)
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    if (quizError) {
      console.error('getUserQuizzes error:', quizError);
      return { quizzes: [], error: quizError.message };
    }

    const formatted: UserQuizSummary[] = (quizzes || []).map((q: any) => ({
      id: q.id,
      title: q.title,
      slug: q.slug,
      created_at: q.created_at,
      status: q.status,
      questionCount: q.quiz_questions?.[0]?.count || 0,
      submissionCount: q.quiz_submissions?.[0]?.count || 0,
    }));

    return { quizzes: formatted };
  } catch (err: any) {
    console.error('Unexpected getUserQuizzes error:', err);
    return { quizzes: [], error: err.message || 'Failed to fetch quizzes' };
  }
}
