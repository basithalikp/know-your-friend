'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { localStore } from '@/lib/quizStore';
import { QuizSubmission } from '@/types/quiz';

export async function getLeaderboard(quizId: string, slug?: string): Promise<{ submissions: QuizSubmission[]; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();

    if (supabase) {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('submitted_at', { ascending: true });

      if (!error && data) {
        return { submissions: data as QuizSubmission[] };
      }
    }

    // Fallback to local store
    let targetQuizId = quizId;
    if (slug && !localStore.submissions.has(targetQuizId)) {
      const q = localStore.quizzes.get(slug);
      if (q) targetQuizId = q.id;
    }

    const localList = localStore.submissions.get(targetQuizId) || [];
    const sorted = [...localList].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    });

    return { submissions: sorted };
  } catch (error: any) {
    console.error('getLeaderboard error:', error);
    return { submissions: [], error: error.message };
  }
}
