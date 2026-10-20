export type DiceBearStyle =
  | 'fun-emoji'
  | 'icons'
  | 'notionists'
  | 'lorelei'
  | 'bottts'
  | 'thumbs'
  | 'shapes';

export interface AvatarConfig {
  style: DiceBearStyle;
  seed: string;
}

export interface QuizQuestion {
  id: string;
  order_index: number;
  question_text: string;
  options: string[];
  avatar?: AvatarConfig;
  option_avatars?: AvatarConfig[];
  correct_option_index?: number; // Omitted when fetched by takers
  remarks?: string | null;
}

export interface Quiz {
  id: string;
  creator_id?: string;
  creator_name: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  created_at?: string;
  questions?: QuizQuestion[];
}

export interface AnswerItem {
  question_id: string;
  selected_index: number;
  is_correct?: boolean;
  correct_index?: number;
  remarks?: string | null;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string | null;
  score: number;
  total_questions: number;
  answers: AnswerItem[];
  submitted_at: string;
}

export interface StagedQuestion {
  id: string;
  question_text: string;
  options: string[];
  avatar?: AvatarConfig;
  option_avatars?: AvatarConfig[];
  correct_option_index: number;
  suggested_category?: string;
  remarks?: string;
}

