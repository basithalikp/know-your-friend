import { Quiz, QuizQuestion, QuizSubmission, StagedQuestion } from '@/types/quiz';

// In-memory fallback store for offline development / preview when Supabase env is pending
declare global {
  // eslint-disable-next-line no-var
  var __localQuizStore: {
    quizzes: Map<string, Quiz & { questions: (QuizQuestion & { correct_option_index: number })[] }>;
    submissions: Map<string, QuizSubmission[]>; // key: quiz_id
  } | undefined;
}

if (!global.__localQuizStore) {
  global.__localQuizStore = {
    quizzes: new Map(),
    submissions: new Map(),
  };

  // Seed a demo quiz for immediate preview
  const demoSlug = 'alex-trivia-demo';
  const demoId = 'demo-quiz-uuid-001';
  global.__localQuizStore.quizzes.set(demoSlug, {
    id: demoId,
    creator_name: 'Alex',
    slug: demoSlug,
    title: 'How Well Do You Really Know Alex?',
    status: 'published',
    created_at: new Date().toISOString(),
    questions: [
      {
        id: 'q1',
        order_index: 0,
        question_text: "What is Alex's go-to comfort meal after a chaotic day?",
        options: ['Extra-cheesy deep dish pizza', 'Spicy tonkotsu ramen with extra egg', 'Late-night street tacos with extra lime', 'Double bacon cheeseburger'],
        correct_option_index: 1,
      },
      {
        id: 'q2',
        order_index: 1,
        question_text: "Which of these quirks is Alex most guilty of?",
        options: ['Having 47 open browser tabs and refusing to close any', 'Setting 7 alarms 3 minutes apart', 'Starting 3 cups of coffee and finishing none', 'Pacing in circles while on speakerphone'],
        correct_option_index: 0,
      },
      {
        id: 'q3',
        order_index: 2,
        question_text: "If a zombie apocalypse broke out right now, what is Alex's survival strategy?",
        options: ['Raid the nearest grocery store for chocolate', 'Try to negotiate peace with the zombies', 'Find the tallest roof and panic quietly', 'Lead the tactical resistance'],
        correct_option_index: 2,
      },
      {
        id: 'q4',
        order_index: 3,
        question_text: "What is Alex's ultimate pet peeve?",
        options: ['Chewing loudly with an open mouth', 'Leaving messages on Read for 3 days', 'Walking painfully slow in airport terminals', 'Spoiling movie endings unprompted'],
        correct_option_index: 2,
      },
    ],
  });

  // Seed some initial submissions for the demo leaderboard
  global.__localQuizStore.submissions.set(demoId, [
    {
      id: 'sub-1',
      quiz_id: demoId,
      user_id: 'user-sarah',
      user_name: 'Sarah Chen',
      user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      score: 4,
      total_questions: 4,
      answers: [],
      submitted_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'sub-2',
      quiz_id: demoId,
      user_id: 'user-jordan',
      user_name: 'Jordan Miller',
      user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      score: 3,
      total_questions: 4,
      answers: [],
      submitted_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'sub-3',
      quiz_id: demoId,
      user_id: 'user-maya',
      user_name: 'Maya Lin',
      user_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      score: 2,
      total_questions: 4,
      answers: [],
      submitted_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ]);
}

export const localStore = global.__localQuizStore!;
