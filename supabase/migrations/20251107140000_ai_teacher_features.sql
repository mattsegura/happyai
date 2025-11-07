-- Migration: AI Teacher Features (Phase 6)
-- Created: 2025-11-07
-- Description: Add tables for Weekly Summaries, Student Briefs, and AI Rate Limiting

-- =====================================================
-- WEEKLY SUMMARIES TABLE
-- =====================================================

-- Stores AI-generated weekly summaries for teachers
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  week_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for efficient queries
CREATE INDEX idx_weekly_summaries_teacher_id ON weekly_summaries(teacher_id);
CREATE INDEX idx_weekly_summaries_week_start ON weekly_summaries(teacher_id, week_start_date DESC);
CREATE INDEX idx_weekly_summaries_generated_at ON weekly_summaries(generated_at DESC);

-- Add unique constraint (one summary per teacher per week)
CREATE UNIQUE INDEX idx_weekly_summaries_unique_week ON weekly_summaries(teacher_id, week_start_date);

-- Enable RLS
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Teachers can only see their own summaries
CREATE POLICY "Teachers can view their own weekly summaries"
  ON weekly_summaries
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own weekly summaries"
  ON weekly_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own weekly summaries"
  ON weekly_summaries
  FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own weekly summaries"
  ON weekly_summaries
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Add trigger for updated_at
CREATE TRIGGER update_weekly_summaries_updated_at
  BEFORE UPDATE ON weekly_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STUDENT BRIEFS TABLE
-- =====================================================

-- Stores AI-generated student briefs for teachers
CREATE TABLE IF NOT EXISTS student_briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  focus_area TEXT NOT NULL CHECK (focus_area IN ('academic', 'emotional', 'balanced')),
  brief_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_student_briefs_student_id ON student_briefs(student_id);
CREATE INDEX idx_student_briefs_teacher_id ON student_briefs(teacher_id);
CREATE INDEX idx_student_briefs_generated_at ON student_briefs(teacher_id, student_id, generated_at DESC);

-- Enable RLS
ALTER TABLE student_briefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Teachers can only see briefs they generated
CREATE POLICY "Teachers can view their own student briefs"
  ON student_briefs
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert student briefs"
  ON student_briefs
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own student briefs"
  ON student_briefs
  FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own student briefs"
  ON student_briefs
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Add trigger for updated_at
CREATE TRIGGER update_student_briefs_updated_at
  BEFORE UPDATE ON student_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AI USAGE QUOTAS TABLE
-- =====================================================

-- Track AI feature usage for rate limiting
CREATE TABLE IF NOT EXISTS ai_usage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_ai_usage_quotas_user_id ON ai_usage_quotas(user_id);
CREATE INDEX idx_ai_usage_quotas_feature_type ON ai_usage_quotas(feature_type);
CREATE INDEX idx_ai_usage_quotas_period ON ai_usage_quotas(user_id, feature_type, period_start);

-- Add unique constraint (one quota record per user per feature per period)
CREATE UNIQUE INDEX idx_ai_usage_quotas_unique ON ai_usage_quotas(user_id, feature_type, period_start);

-- Enable RLS
ALTER TABLE ai_usage_quotas ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own quotas
CREATE POLICY "Users can view their own AI usage quotas"
  ON ai_usage_quotas
  FOR SELECT
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_usage_quotas_updated_at
  BEFORE UPDATE ON ai_usage_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AI ASSISTANT CONVERSATIONS TABLE
-- =====================================================

-- Store teacher assistant conversation threads
CREATE TABLE IF NOT EXISTS ai_assistant_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_ai_assistant_conversations_teacher_id ON ai_assistant_conversations(teacher_id);
CREATE INDEX idx_ai_assistant_conversations_last_message ON ai_assistant_conversations(teacher_id, last_message_at DESC);

-- Enable RLS
ALTER TABLE ai_assistant_conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Teachers can view their own conversations"
  ON ai_assistant_conversations
  FOR SELECT
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert conversations"
  ON ai_assistant_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own conversations"
  ON ai_assistant_conversations
  FOR UPDATE
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own conversations"
  ON ai_assistant_conversations
  FOR DELETE
  USING (auth.uid() = teacher_id);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_assistant_conversations_updated_at
  BEFORE UPDATE ON ai_assistant_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AI ASSISTANT MESSAGES TABLE
-- =====================================================

-- Store individual messages in conversations
CREATE TABLE IF NOT EXISTS ai_assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_ai_assistant_messages_conversation_id ON ai_assistant_messages(conversation_id, created_at);

-- Enable RLS
ALTER TABLE ai_assistant_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Inherit from conversation
CREATE POLICY "Users can view messages in their conversations"
  ON ai_assistant_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_assistant_conversations
      WHERE ai_assistant_conversations.id = ai_assistant_messages.conversation_id
      AND ai_assistant_conversations.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON ai_assistant_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_assistant_conversations
      WHERE ai_assistant_conversations.id = ai_assistant_messages.conversation_id
      AND ai_assistant_conversations.teacher_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS FOR AI RATE LIMITING
-- =====================================================

-- Function to check if user has exceeded quota
CREATE OR REPLACE FUNCTION check_ai_quota(
  p_user_id UUID,
  p_feature_type TEXT,
  p_max_weekly_usage INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_usage INTEGER;
  v_week_start TIMESTAMP WITH TIME ZONE;
  v_week_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current week
  v_week_start := date_trunc('week', now());
  v_week_end := v_week_start + interval '7 days';

  -- Get current usage for this week
  SELECT COALESCE(usage_count, 0)
  INTO v_current_usage
  FROM ai_usage_quotas
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND period_start = v_week_start;

  -- Check if under quota
  RETURN (v_current_usage < p_max_weekly_usage);
END;
$$;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost_cents INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_week_start TIMESTAMP WITH TIME ZONE;
  v_week_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current week
  v_week_start := date_trunc('week', now());
  v_week_end := v_week_start + interval '7 days';

  -- Insert or update usage record
  INSERT INTO ai_usage_quotas (
    user_id,
    feature_type,
    period_start,
    period_end,
    usage_count,
    total_tokens_used,
    total_cost_cents,
    last_used_at
  )
  VALUES (
    p_user_id,
    p_feature_type,
    v_week_start,
    v_week_end,
    1,
    p_tokens_used,
    p_cost_cents,
    now()
  )
  ON CONFLICT (user_id, feature_type, period_start)
  DO UPDATE SET
    usage_count = ai_usage_quotas.usage_count + 1,
    total_tokens_used = ai_usage_quotas.total_tokens_used + p_tokens_used,
    total_cost_cents = ai_usage_quotas.total_cost_cents + p_cost_cents,
    last_used_at = now(),
    updated_at = now();
END;
$$;

-- Function to get remaining quota
CREATE OR REPLACE FUNCTION get_remaining_ai_quota(
  p_user_id UUID,
  p_feature_type TEXT,
  p_max_weekly_usage INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_usage INTEGER;
  v_week_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current week
  v_week_start := date_trunc('week', now());

  -- Get current usage
  SELECT COALESCE(usage_count, 0)
  INTO v_current_usage
  FROM ai_usage_quotas
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND period_start = v_week_start;

  -- Return remaining
  RETURN GREATEST(0, p_max_weekly_usage - v_current_usage);
END;
$$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE weekly_summaries IS 'AI-generated weekly summaries for teachers (Feature 19)';
COMMENT ON TABLE student_briefs IS 'AI-generated student briefs for teachers (Feature 16)';
COMMENT ON TABLE ai_usage_quotas IS 'Track AI feature usage for rate limiting';
COMMENT ON TABLE ai_assistant_conversations IS 'Teacher AI Assistant conversation threads (Feature 20)';
COMMENT ON TABLE ai_assistant_messages IS 'Individual messages in AI Assistant conversations';

COMMENT ON FUNCTION check_ai_quota IS 'Check if user has exceeded weekly AI quota for a feature';
COMMENT ON FUNCTION increment_ai_usage IS 'Increment AI usage count for rate limiting';
COMMENT ON FUNCTION get_remaining_ai_quota IS 'Get remaining AI quota for current week';
