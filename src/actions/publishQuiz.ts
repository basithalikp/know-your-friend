'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { localStore } from '@/lib/quizStore';
import { slugify } from '@/lib/utils';
import { StagedQuestion } from '@/types/quiz';

export interface PublishQuizInput {
  creatorName: string;
  title: string;
  questions: StagedQuestion[];
}

export async function publishQuiz(input: PublishQuizInput) {
  try {
    const { creatorName, title, questions } = input;

    if (!creatorName?.trim()) {
      return { error: 'Creator name is required' };
    }
    if (!questions || questions.length < 1) {
      return { error: 'Please add at least 1 question to publish your quiz' };
    }

    const slug = slugify(creatorName);
    const quizTitle = title?.trim() || `How Well Do You Know ${creatorName}?`;

    const supabase = await createServerSupabaseClient();

    if (supabase) {
      // Get current user if authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          creator_id: user?.id || null,
          creator_name: creatorName.trim(),
          title: quizTitle,
          slug,
          status: 'published',
        })
        .select('id, slug')
        .single();

      if (quizError || !quizData) {
        console.error('Supabase quiz insert error:', quizError);
        // Fallback to local store if DB tables are pending
      } else {
        // Insert questions
        const questionsToInsert = questions.map((q, idx) => ({
          quiz_id: quizData.id,
          order_index: idx,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          remarks: q.remarks || null,
        }));

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('Supabase questions insert error:', questionsError);
        } else {
          return { success: true, slug: quizData.slug, quizId: quizData.id };
        }
      }
    }

    // In-memory store fallback (works without Supabase setup)
    const fallbackId = `quiz-${Date.now()}`;
    localStore.quizzes.set(slug, {
      id: fallbackId,
      creator_name: creatorName.trim(),
      slug,
      title: quizTitle,
      status: 'published',
      created_at: new Date().toISOString(),
      questions: questions.map((q, idx) => ({
        id: q.id || `q-${idx}`,
        order_index: idx,
        question_text: q.question_text,
        options: q.options,
        avatar: q.avatar,
        option_avatars: q.option_avatars,
        correct_option_index: q.correct_option_index,
        remarks: q.remarks || null,
      })),
    });

    return { success: true, slug, quizId: fallbackId };
  } catch (error: any) {
    console.error('publishQuiz error:', error);
    return { error: error.message || 'Failed to publish quiz' };
  }
}
