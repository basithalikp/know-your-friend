'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { localStore } from '@/lib/quizStore';
import { AnswerItem, QuizSubmission } from '@/types/quiz';

export interface SubmitQuizInput {
  quizId: string;
  slug: string;
  takerName: string;
  answers: { question_id: string; selected_index: number }[];
  userId?: string;
  userAvatar?: string;
}

export async function submitQuizAttempt(input: SubmitQuizInput) {
  try {
    const { quizId, slug, takerName, answers, userId, userAvatar } = input;

    if (!takerName?.trim()) {
      return { error: 'Please enter your name or sign in' };
    }

    const supabase = await createServerSupabaseClient();

    if (supabase) {
      // 1. Get current auth user if available
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const activeUserId = user?.id || userId || `guest-${Date.now()}`;
      const activeUserName = user?.user_metadata?.full_name || takerName.trim();
      const activeUserAvatar = user?.user_metadata?.avatar_url || userAvatar || null;

      // 2. Check if this user has already attempted this quiz (Single Attempt Enforcement)
      if (user?.id) {
        const { data: existingAttempt } = await supabase
          .from('quiz_submissions')
          .select('id, score, total_questions, answers, submitted_at')
          .eq('quiz_id', quizId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingAttempt) {
          return {
            alreadySubmitted: true,
            submission: existingAttempt as QuizSubmission,
            message: 'You have already completed this quiz! Showing your recorded results.',
          };
        }
      }

      // 3. Query questions with the true correct_option_index from the DB
      const { data: trueQuestions, error: qError } = await supabase
        .from('quiz_questions')
        .select('id, order_index, question_text, options, correct_option_index, remarks')
        .eq('quiz_id', quizId)
        .order('order_index', { ascending: true });

      if (!qError && trueQuestions && trueQuestions.length > 0) {
        let calculatedScore = 0;
        const total = trueQuestions.length;

        const gradedAnswers: AnswerItem[] = trueQuestions.map((q) => {
          const userPick = answers.find((a) => a.question_id === q.id);
          const selected = userPick !== undefined ? userPick.selected_index : -1;
          const isCorrect = selected === q.correct_option_index;

          if (isCorrect) {
            calculatedScore += 1;
          }

          return {
            question_id: q.id,
            selected_index: selected,
            is_correct: isCorrect,
            correct_index: q.correct_option_index,
            remarks: q.remarks || null,
          };
        });

        // 4. Save submission into Supabase
        const { data: insertedSubmission, error: insertError } = await supabase
          .from('quiz_submissions')
          .insert({
            quiz_id: quizId,
            user_id: activeUserId,
            user_name: activeUserName,
            user_avatar: activeUserAvatar,
            score: calculatedScore,
            total_questions: total,
            answers: gradedAnswers,
          })
          .select()
          .single();

        if (insertError) {
          // If unique constraint violation
          if (insertError.code === '23505') {
            return {
              alreadySubmitted: true,
              error: 'You have already submitted an attempt for this quiz.',
            };
          }
          console.error('Submission insert error:', insertError);
        } else {
          return {
            success: true,
            submission: insertedSubmission as QuizSubmission,
            score: calculatedScore,
            total_questions: total,
            breakdown: gradedAnswers,
          };
        }
      }
    }

    // Fallback in-memory grading if Supabase DB is offline/pending
    let targetQuiz = localStore.quizzes.get(slug);
    if (!targetQuiz) {
      for (const q of localStore.quizzes.values()) {
        if (q.id === quizId) {
          targetQuiz = q;
          break;
        }
      }
    }

    if (!targetQuiz) {
      return { error: 'Quiz not found' };
    }

    const currentUserId = userId || `user-${Date.now()}`;
    const existingSubmissions = localStore.submissions.get(targetQuiz.id) || [];

    // Check single attempt in memory
    const existing = existingSubmissions.find((s) => s.user_id === currentUserId);
    if (existing) {
      return {
        alreadySubmitted: true,
        submission: existing,
        message: 'You have already submitted an attempt for this quiz.',
      };
    }

    let score = 0;
    const gradedAnswers: AnswerItem[] = targetQuiz.questions.map((q) => {
      const userPick = answers.find((a) => a.question_id === q.id);
      const selected = userPick !== undefined ? userPick.selected_index : -1;
      const isCorrect = selected === q.correct_option_index;
      if (isCorrect) score += 1;

      return {
        question_id: q.id,
        selected_index: selected,
        is_correct: isCorrect,
        correct_index: q.correct_option_index,
        remarks: q.remarks || null,
      };
    });

    const newSubmission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quiz_id: targetQuiz.id,
      user_id: currentUserId,
      user_name: takerName.trim(),
      user_avatar: userAvatar || null,
      score,
      total_questions: targetQuiz.questions.length,
      answers: gradedAnswers,
      submitted_at: new Date().toISOString(),
    };

    existingSubmissions.unshift(newSubmission);
    localStore.submissions.set(targetQuiz.id, existingSubmissions);

    return {
      success: true,
      submission: newSubmission,
      score,
      total_questions: targetQuiz.questions.length,
      breakdown: gradedAnswers,
    };
  } catch (error: any) {
    console.error('submitQuizAttempt error:', error);
    return { error: error.message || 'Failed to submit quiz attempt' };
  }
}
