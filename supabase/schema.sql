-- ==============================================================================
-- "Know Your Friend" AI Quiz Platform - Supabase PostgreSQL Schema
-- ==============================================================================

-- 1. PROFILES (Synced from Supabase Auth Google Provider)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to auto-create profile on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Friend'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. QUIZZES
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator ON public.quizzes(creator_id);

-- 3. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  order_index INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array: ["A", "B", "C", "D"]
  correct_option_index INT NOT NULL CHECK (correct_option_index >= 0 AND correct_option_index <= 3),
  remarks TEXT, -- Creator commentary / explanation shown after quiz
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, order_index);

-- 4. QUIZ SUBMISSIONS (One attempt strictly enforced via DB Constraint)
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  answers JSONB NOT NULL, -- Array: [{"question_id": "...", "selected_index": 1, "is_correct": true}]
  submitted_at TIMESTAMPTZ DEFAULT now(),
  
  -- CRITICAL: Strictly enforces only ONE attempt per user per quiz
  CONSTRAINT unique_quiz_attempt_per_user UNIQUE (quiz_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_quiz_score ON public.quiz_submissions(quiz_id, score DESC, submitted_at ASC);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view published quizzes" ON public.quizzes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can manage their own quizzes" ON public.quizzes
  FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage quiz questions" ON public.quiz_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
      AND quizzes.creator_id = auth.uid()
    )
  );

CREATE POLICY "Public can view submissions for leaderboard" ON public.quiz_submissions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit quiz once" ON public.quiz_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. ANTI-CHEAT DB RPC FUNCTION: Fetch Quiz for Taker (Hiding Correct Answers)
CREATE OR REPLACE FUNCTION public.get_quiz_for_taker(p_slug TEXT)
RETURNS JSONB AS $$
DECLARE
  v_quiz RECORD;
  v_questions JSONB;
BEGIN
  SELECT id, creator_id, creator_name, slug, title, created_at
  INTO v_quiz
  FROM public.quizzes
  WHERE slug = p_slug AND status = 'published';

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', id,
      'order_index', order_index,
      'question_text', question_text,
      'options', options
    ) ORDER BY order_index ASC
  )
  INTO v_questions
  FROM public.quiz_questions
  WHERE quiz_id = v_quiz.id;

  RETURN jsonb_build_object(
    'id', v_quiz.id,
    'creator_id', v_quiz.creator_id,
    'creator_name', v_quiz.creator_name,
    'slug', v_quiz.slug,
    'title', v_quiz.title,
    'questions', COALESCE(v_questions, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime publication for live leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_submissions;
