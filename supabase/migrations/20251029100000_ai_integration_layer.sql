-- =====================================================
-- AI INTEGRATION LAYER MIGRATION
-- =====================================================
-- This migration adds tables and functions for AI-powered features
-- in the Academics Tab (Phase 4).
--
-- FEATURES SUPPORTED:
-- - AI Study Coach (weekly plan generation, dynamic adjustments)
-- - AI Scheduling Assistant (natural language calendar management)
-- - Course Tutor AI (Q&A, quiz generation, summaries)
-- - Grade Projections with AI insights
-- - Feedback Analyzer (sentiment analysis, pattern detection)
--
-- COST MANAGEMENT:
-- - Token usage tracking per user and feature
-- - Cost calculation and limits
-- - Monthly budget enforcement
--
-- CACHING:
-- - Response caching to reduce API calls
-- - TTL-based expiration
-- - Cache hit/miss tracking
-- =====================================================

-- =====================================================
-- 1. AI INTERACTIONS LOG TABLE
-- =====================================================
-- Tracks all AI API calls for auditing, cost tracking, and debugging

CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Feature identification
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'study_coach',
    'scheduling_assistant',
    'course_tutor',
    'grade_projection',
    'feedback_analyzer',
    'chat',
    'quiz_generator',
    'summarizer'
  )),

  -- Request data
  prompt TEXT NOT NULL,
  prompt_version TEXT, -- Track prompt template versions for A/B testing
  context_data JSONB, -- Additional context sent to AI

  -- Response data
  response TEXT NOT NULL,
  response_format TEXT DEFAULT 'text' CHECK (response_format IN ('text', 'json', 'markdown', 'function_call')),
  function_calls JSONB, -- Store function calling results

  -- AI provider information
  provider TEXT DEFAULT 'anthropic' CHECK (provider IN ('openai', 'anthropic', 'local')),
  model TEXT NOT NULL, -- 'gpt-4', 'claude-3-opus-20240229', etc.

  -- Cost tracking
  tokens_used_input INTEGER NOT NULL DEFAULT 0,
  tokens_used_output INTEGER NOT NULL DEFAULT 0,
  tokens_used_total INTEGER GENERATED ALWAYS AS (tokens_used_input + tokens_used_output) STORED,
  cost_cents INTEGER NOT NULL DEFAULT 0, -- Cost in cents (USD)

  -- Performance metrics
  execution_time_ms INTEGER, -- Latency
  cache_hit BOOLEAN DEFAULT false, -- Was response from cache?

  -- Status
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'rate_limited', 'quota_exceeded')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ai_interactions_university_id ON ai_interactions(university_id);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_user_feature ON ai_interactions(user_id, feature_type);
CREATE INDEX idx_ai_interactions_user_created ON ai_interactions(user_id, created_at DESC);
CREATE INDEX idx_ai_interactions_feature_type ON ai_interactions(feature_type);
CREATE INDEX idx_ai_interactions_provider_model ON ai_interactions(provider, model);
CREATE INDEX idx_ai_interactions_status ON ai_interactions(status) WHERE status != 'success';
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at DESC);
CREATE INDEX idx_ai_interactions_cost ON ai_interactions(cost_cents DESC) WHERE cost_cents > 0;

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_ai_interaction_university
  BEFORE INSERT ON ai_interactions
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own AI interactions"
  ON ai_interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- Admins can view all AI interactions in their university
CREATE POLICY "Admins can view university AI interactions"
  ON ai_interactions FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 2. AI RESPONSE CACHE TABLE
-- =====================================================
-- Cache AI responses to reduce costs and improve performance

CREATE TABLE IF NOT EXISTS ai_response_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

  -- Cache key (hash of prompt + context + model)
  cache_key TEXT NOT NULL UNIQUE,

  -- Feature and model
  feature_type TEXT NOT NULL,
  model TEXT NOT NULL,

  -- Cached data
  prompt_hash TEXT NOT NULL, -- SHA-256 hash of prompt for quick lookup
  response TEXT NOT NULL,
  response_format TEXT DEFAULT 'text',

  -- Cache metadata
  hit_count INTEGER DEFAULT 0, -- Number of times cache was hit
  tokens_saved INTEGER DEFAULT 0, -- Total tokens saved by caching
  cost_saved_cents INTEGER DEFAULT 0, -- Total cost saved

  -- TTL (Time To Live)
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ai_cache_university_id ON ai_response_cache(university_id);
CREATE INDEX idx_ai_cache_cache_key ON ai_response_cache(cache_key);
CREATE INDEX idx_ai_cache_prompt_hash ON ai_response_cache(prompt_hash);
CREATE INDEX idx_ai_cache_feature_type ON ai_response_cache(feature_type);
CREATE INDEX idx_ai_cache_expires_at ON ai_response_cache(expires_at);
CREATE INDEX idx_ai_cache_hit_count ON ai_response_cache(hit_count DESC);

-- RLS Policies
CREATE POLICY "Users can view cache in their university"
  ON ai_response_cache FOR SELECT
  TO authenticated
  USING (university_id = current_user_university_id());

CREATE POLICY "Users can insert cache entries"
  ON ai_response_cache FOR INSERT
  TO authenticated
  WITH CHECK (university_id = current_user_university_id());

CREATE POLICY "Users can update cache entries"
  ON ai_response_cache FOR UPDATE
  TO authenticated
  USING (university_id = current_user_university_id());

-- =====================================================
-- 3. AI USER QUOTA TABLE
-- =====================================================
-- Track AI usage limits and quotas per user

CREATE TABLE IF NOT EXISTS ai_user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Current billing period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Usage this period
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,

  -- Quota limits (null = unlimited for premium users)
  max_requests_per_period INTEGER DEFAULT 100, -- Free tier: 100 requests/month
  max_tokens_per_period INTEGER DEFAULT 100000, -- Free tier: 100k tokens/month
  max_cost_cents_per_period INTEGER DEFAULT 100, -- Free tier: $1.00/month

  -- Feature-specific usage
  study_coach_requests INTEGER DEFAULT 0,
  scheduling_assistant_requests INTEGER DEFAULT 0,
  course_tutor_requests INTEGER DEFAULT 0,
  grade_projection_requests INTEGER DEFAULT 0,
  feedback_analyzer_requests INTEGER DEFAULT 0,

  -- Status
  quota_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(user_id, period_start)
);

-- Enable RLS
ALTER TABLE ai_user_quotas ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ai_quotas_university_id ON ai_user_quotas(university_id);
CREATE INDEX idx_ai_quotas_user_id ON ai_user_quotas(user_id);
CREATE INDEX idx_ai_quotas_user_period ON ai_user_quotas(user_id, period_start DESC);
CREATE INDEX idx_ai_quotas_quota_exceeded ON ai_user_quotas(quota_exceeded) WHERE quota_exceeded = true;

-- Trigger for updated_at
CREATE TRIGGER set_ai_user_quotas_updated_at
  BEFORE UPDATE ON ai_user_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_ai_user_quota_university
  BEFORE INSERT ON ai_user_quotas
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own AI quotas"
  ON ai_user_quotas FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own AI quotas"
  ON ai_user_quotas FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own AI quotas"
  ON ai_user_quotas FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- Admins can view all quotas in their university
CREATE POLICY "Admins can view university AI quotas"
  ON ai_user_quotas FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 4. AI CONVERSATION THREADS TABLE
-- =====================================================
-- Store chat conversations for Study Coach, Tutor, Scheduling Assistant

CREATE TABLE IF NOT EXISTS ai_conversation_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Thread identification
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'study_coach',
    'scheduling_assistant',
    'course_tutor',
    'general_chat'
  )),
  title TEXT NOT NULL,
  course_id UUID REFERENCES canvas_courses(id) ON DELETE CASCADE, -- NULL for non-course threads

  -- Thread metadata
  message_count INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,

  -- Thread status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  last_message_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_conversation_threads ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ai_threads_university_id ON ai_conversation_threads(university_id);
CREATE INDEX idx_ai_threads_user_id ON ai_conversation_threads(user_id);
CREATE INDEX idx_ai_threads_user_feature ON ai_conversation_threads(user_id, feature_type);
CREATE INDEX idx_ai_threads_user_updated ON ai_conversation_threads(user_id, updated_at DESC);
CREATE INDEX idx_ai_threads_course_id ON ai_conversation_threads(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_ai_threads_status ON ai_conversation_threads(status) WHERE status = 'active';

-- Trigger for updated_at
CREATE TRIGGER set_ai_threads_updated_at
  BEFORE UPDATE ON ai_conversation_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_ai_thread_university
  BEFORE INSERT ON ai_conversation_threads
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own AI threads"
  ON ai_conversation_threads FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own AI threads"
  ON ai_conversation_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own AI threads"
  ON ai_conversation_threads FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can delete their own AI threads"
  ON ai_conversation_threads FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 5. AI CONVERSATION MESSAGES TABLE
-- =====================================================
-- Individual messages within conversation threads

CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES ai_conversation_threads(id) ON DELETE CASCADE,

  -- Message data
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  content_format TEXT DEFAULT 'text' CHECK (content_format IN ('text', 'markdown', 'json')),

  -- Message metadata
  tokens_used INTEGER DEFAULT 0,
  ai_interaction_id UUID REFERENCES ai_interactions(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_ai_messages_university_id ON ai_conversation_messages(university_id);
CREATE INDEX idx_ai_messages_thread_id ON ai_conversation_messages(thread_id);
CREATE INDEX idx_ai_messages_thread_created ON ai_conversation_messages(thread_id, created_at);
CREATE INDEX idx_ai_messages_role ON ai_conversation_messages(role);

-- Trigger to auto-populate university_id from thread
CREATE OR REPLACE FUNCTION copy_university_from_ai_thread()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM ai_conversation_threads
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_ai_message_university
  BEFORE INSERT ON ai_conversation_messages
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_ai_thread();

-- RLS Policies
CREATE POLICY "Users can view messages in their threads"
  ON ai_conversation_messages FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM ai_conversation_threads
      WHERE ai_conversation_threads.id = ai_conversation_messages.thread_id
      AND ai_conversation_threads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their threads"
  ON ai_conversation_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM ai_conversation_threads
      WHERE ai_conversation_threads.id = ai_conversation_messages.thread_id
      AND ai_conversation_threads.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. DATABASE HELPER FUNCTIONS FOR AI
-- =====================================================

-- Get or create current quota period for user
CREATE OR REPLACE FUNCTION get_or_create_user_quota(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_quota_id UUID;
  v_period_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_period_end DATE := (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
  v_university_id UUID;
BEGIN
  -- Get user's university_id
  SELECT university_id INTO v_university_id FROM profiles WHERE id = p_user_id;

  -- Try to get existing quota for current period
  SELECT id INTO v_quota_id
  FROM ai_user_quotas
  WHERE user_id = p_user_id
    AND period_start = v_period_start;

  -- Create if doesn't exist
  IF v_quota_id IS NULL THEN
    INSERT INTO ai_user_quotas (
      university_id,
      user_id,
      period_start,
      period_end
    ) VALUES (
      v_university_id,
      p_user_id,
      v_period_start,
      v_period_end
    )
    RETURNING id INTO v_quota_id;
  END IF;

  RETURN v_quota_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has exceeded quota
CREATE OR REPLACE FUNCTION check_user_quota(
  p_user_id UUID,
  p_feature_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_quota RECORD;
  v_quota_id UUID;
BEGIN
  -- Get or create quota
  v_quota_id := get_or_create_user_quota(p_user_id);

  -- Get quota record
  SELECT * INTO v_quota
  FROM ai_user_quotas
  WHERE id = v_quota_id;

  -- Check if quota exceeded
  IF v_quota.quota_exceeded THEN
    RETURN FALSE;
  END IF;

  -- Check request limit
  IF v_quota.max_requests_per_period IS NOT NULL
     AND v_quota.total_requests >= v_quota.max_requests_per_period THEN
    -- Mark quota as exceeded
    UPDATE ai_user_quotas
    SET quota_exceeded = TRUE, exceeded_at = now()
    WHERE id = v_quota_id;
    RETURN FALSE;
  END IF;

  -- Check token limit
  IF v_quota.max_tokens_per_period IS NOT NULL
     AND v_quota.total_tokens >= v_quota.max_tokens_per_period THEN
    UPDATE ai_user_quotas
    SET quota_exceeded = TRUE, exceeded_at = now()
    WHERE id = v_quota_id;
    RETURN FALSE;
  END IF;

  -- Check cost limit
  IF v_quota.max_cost_cents_per_period IS NOT NULL
     AND v_quota.total_cost_cents >= v_quota.max_cost_cents_per_period THEN
    UPDATE ai_user_quotas
    SET quota_exceeded = TRUE, exceeded_at = now()
    WHERE id = v_quota_id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user quota after AI interaction
CREATE OR REPLACE FUNCTION update_user_quota(
  p_user_id UUID,
  p_feature_type TEXT,
  p_tokens_used INTEGER,
  p_cost_cents INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_quota_id UUID;
  v_column_name TEXT;
BEGIN
  -- Get or create quota
  v_quota_id := get_or_create_user_quota(p_user_id);

  -- Determine feature column name
  v_column_name := p_feature_type || '_requests';

  -- Update quota
  UPDATE ai_user_quotas
  SET
    total_requests = total_requests + 1,
    total_tokens = total_tokens + p_tokens_used,
    total_cost_cents = total_cost_cents + p_cost_cents,
    updated_at = now()
  WHERE id = v_quota_id;

  -- Update feature-specific counter using dynamic SQL
  IF v_column_name IN ('study_coach_requests', 'scheduling_assistant_requests',
                        'course_tutor_requests', 'grade_projection_requests',
                        'feedback_analyzer_requests') THEN
    EXECUTE format('UPDATE ai_user_quotas SET %I = %I + 1 WHERE id = $1', v_column_name, v_column_name)
    USING v_quota_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user AI usage stats
CREATE OR REPLACE FUNCTION get_user_ai_stats(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  total_requests INTEGER,
  total_tokens INTEGER,
  total_cost_cents INTEGER,
  requests_by_feature JSONB,
  tokens_by_provider JSONB,
  average_tokens_per_request NUMERIC,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*)::INTEGER as req_count,
      SUM(tokens_used_total)::INTEGER as token_count,
      SUM(cost_cents)::INTEGER as cost,
      jsonb_object_agg(feature_type, COUNT(*)) as by_feature,
      jsonb_object_agg(provider, SUM(tokens_used_total)) as by_provider,
      ROUND(AVG(tokens_used_total)::NUMERIC, 2) as avg_tokens,
      ROUND(
        (COUNT(*) FILTER (WHERE cache_hit = true)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
        2
      ) as cache_rate
    FROM ai_interactions
    WHERE user_id = p_user_id
      AND created_at >= now() - (p_days_back || ' days')::INTERVAL
  )
  SELECT
    req_count,
    token_count,
    cost,
    by_feature,
    by_provider,
    avg_tokens,
    cache_rate
  FROM stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS TABLE(
  deleted_count BIGINT,
  tokens_freed BIGINT
) AS $$
DECLARE
  v_deleted BIGINT;
  v_tokens BIGINT;
BEGIN
  -- Calculate tokens that will be freed
  SELECT COALESCE(SUM(tokens_saved), 0) INTO v_tokens
  FROM ai_response_cache
  WHERE expires_at < now();

  -- Delete expired cache entries
  DELETE FROM ai_response_cache WHERE expires_at < now();
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN QUERY SELECT v_deleted, v_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_or_create_user_quota(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_quota(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_quota(UUID, TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ai_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_ai_cache() TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration created:
-- ✅ ai_interactions table (audit log of all AI calls)
-- ✅ ai_response_cache table (caching layer for cost reduction)
-- ✅ ai_user_quotas table (usage limits and tracking)
-- ✅ ai_conversation_threads table (chat threads)
-- ✅ ai_conversation_messages table (chat messages)
-- ✅ 6 helper functions for quota management and stats
-- ✅ All tables have university_id for multi-tenancy
-- ✅ All tables have RLS policies
-- ✅ Strategic indexes for performance
-- ✅ Automatic university_id propagation via triggers
--
-- Next steps:
-- 1. Run: supabase db push
-- 2. Implement AI service layer in TypeScript
-- 3. Add AI provider API keys to environment
-- 4. Implement AI features (Study Coach, Tutor, etc.)
-- 5. Create UI components for AI features
-- =====================================================
