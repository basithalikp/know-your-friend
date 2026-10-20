'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { localStore } from '@/lib/quizStore';
import { Quiz, QuizQuestion } from '@/types/quiz';

export async function getQuizForTaker(slug: string): Promise<{ quiz: Quiz | null; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      // First try the anti-cheat DB RPC if defined
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_quiz_for_taker', {
        p_slug: slug,
      });

      if (!rpcError && rpcData) {
        return { quiz: rpcData as Quiz };
      }

      // Direct fallback query: Explicitly omit correct_option_index
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, creator_id, creator_name, slug, title, status, created_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (quizData) {
        const { data: questionsData } = await supabase
          .from('quiz_questions')
          .select('id, order_index, question_text, options')
          .eq('quiz_id', quizData.id)
          .order('order_index', { ascending: true });

        const safeQuestions: QuizQuestion[] = (questionsData || []).map((q) => ({
          id: q.id,
          order_index: q.order_index,
          question_text: q.question_text,
          options: q.options as string[],
          // correct_option_index is intentionally NEVER included here!
        }));

        return {
          quiz: {
            ...quizData,
            status: quizData.status as 'published' | 'draft',
            questions: safeQuestions,
          },
        };
      }
    }

    // Check local store fallback
    const stored = localStore.quizzes.get(slug);
    if (stored) {
      const safeQuestions: QuizQuestion[] = stored.questions.map((q) => ({
        id: q.id,
        order_index: q.order_index,
        question_text: q.question_text,
        options: q.options,
        // Strip correct_option_index for taker
      }));

      return {
        quiz: {
          id: stored.id,
          creator_id: stored.creator_id,
          creator_name: stored.creator_name,
          slug: stored.slug,
          title: stored.title,
          status: stored.status,
          created_at: stored.created_at,
          questions: safeQuestions,
        },
      };
    }

    return { quiz: null, error: 'Quiz not found' };
  } catch (error: any) {
    console.error('getQuizForTaker error:', error);
    return { quiz: null, error: error.message };
  }
}
