-- =====================================================
-- INSTRUCTOR FEEDBACK HUB MIGRATION (Phase 8)
-- =====================================================
-- This migration creates tables for centralized instructor feedback
-- aggregation, sentiment analysis, pattern detection, and improvement
-- goal generation across all courses.
--
-- FEATURES SUPPORTED:
-- - Aggregated feedback from all Canvas submissions
-- - AI sentiment analysis (positive/neutral/negative)
-- - Pattern detection across multiple courses
-- - Improvement goal generation with action items
-- - Feedback timeline tracking
-- =====================================================

-- =====================================================
-- 1. INSTRUCTOR FEEDBACK TABLE
-- =====================================================
-- Stores analyzed instructor feedback from all submissions

CREATE TABLE IF NOT EXISTS instructor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES canvas_submissions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES canvas_courses(id) ON DELETE CASCADE,
  assignment_id UUID NOT NULL REFERENCES canvas_assignments(id),

  -- Instructor info
  instructor_id TEXT,
  instructor_name TEXT,

  -- Feedback data
  feedback_text TEXT,
  rubric_data JSONB,
  score NUMERIC(10, 2),
  points_possible NUMERIC(10, 2),

  -- AI analysis results
  sentiment_score NUMERIC(3, 2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1), -- -1 (negative) to 1 (positive)
  sentiment_label TEXT CHECK (sentiment_label IN ('positive', 'neutral', 'negative')),
  key_themes TEXT[], -- ['structure', 'clarity', 'depth', 'research']
  strengths TEXT[], -- What student did well
  improvements TEXT[], -- Areas for improvement

  -- Analysis metadata
  analyzed_at TIMESTAMPTZ,
  ai_explanation TEXT, -- Plain language explanation
  ai_model TEXT, -- Which AI model was used
  analysis_version TEXT, -- Track analysis version

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(submission_id, user_id) -- One feedback per submission per user
);

-- Enable RLS
ALTER TABLE instructor_feedback ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_instructor_feedback_university ON instructor_feedback(university_id);
CREATE INDEX idx_instructor_feedback_user ON instructor_feedback(user_id, created_at DESC);
CREATE INDEX idx_instructor_feedback_course ON instructor_feedback(course_id, created_at DESC);
CREATE INDEX idx_instructor_feedback_sentiment ON instructor_feedback(user_id, sentiment_label);
CREATE INDEX idx_instructor_feedback_submission ON instructor_feedback(submission_id);
CREATE INDEX idx_instructor_feedback_analyzed ON instructor_feedback(analyzed_at DESC);

-- RLS Policies
CREATE POLICY "Users can view their own feedback"
  ON instructor_feedback FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own feedback"
  ON instructor_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own feedback"
  ON instructor_feedback FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 2. FEEDBACK PATTERNS TABLE
-- =====================================================
-- Stores detected patterns across all feedback

CREATE TABLE IF NOT EXISTS feedback_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Pattern identification
  pattern_type TEXT NOT NULL CHECK (pattern_type IN ('strength', 'weakness', 'trend', 'instructor_style')),
  category TEXT CHECK (category IN ('writing', 'analysis', 'organization', 'research', 'critical_thinking', 'creativity', 'technical', 'presentation', 'collaboration', 'other')),

  -- Pattern details
  description TEXT NOT NULL,
  evidence JSONB, -- Array of feedback examples that support this pattern
  occurrences INTEGER DEFAULT 1,
  courses_affected UUID[], -- Array of course IDs where this appears
  assignments_affected UUID[], -- Array of assignment IDs

  -- Pattern tracking
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  last_detected_at TIMESTAMPTZ DEFAULT now(),

  -- Pattern assessment
  severity TEXT CHECK (severity IN ('high', 'medium', 'low')), -- For weaknesses
  confidence NUMERIC(3, 2) CHECK (confidence >= 0 AND confidence <= 1), -- 0-1, how confident we are
  improvement_trend TEXT CHECK (improvement_trend IN ('improving', 'stable', 'declining')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback_patterns ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_feedback_patterns_university ON feedback_patterns(university_id);
CREATE INDEX idx_feedback_patterns_user ON feedback_patterns(user_id, pattern_type);
CREATE INDEX idx_feedback_patterns_type ON feedback_patterns(pattern_type);
CREATE INDEX idx_feedback_patterns_category ON feedback_patterns(category);
CREATE INDEX idx_feedback_patterns_severity ON feedback_patterns(severity) WHERE severity IS NOT NULL;
CREATE INDEX idx_feedback_patterns_confidence ON feedback_patterns(confidence DESC);
CREATE INDEX idx_feedback_patterns_courses ON feedback_patterns USING GIN(courses_affected);

-- RLS Policies
CREATE POLICY "Users can view their own patterns"
  ON feedback_patterns FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own patterns"
  ON feedback_patterns FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own patterns"
  ON feedback_patterns FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can delete their own patterns"
  ON feedback_patterns FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 3. FEEDBACK IMPROVEMENT GOALS TABLE
-- =====================================================
-- Stores improvement goals generated from feedback patterns

CREATE TABLE IF NOT EXISTS feedback_improvement_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_id UUID REFERENCES feedback_patterns(id) ON DELETE CASCADE,

  -- Goal details
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  goal_category TEXT, -- Same as pattern category

  -- Action items and steps
  action_items JSONB, -- Array of specific steps
  resources JSONB, -- Recommended resources
  success_criteria TEXT[], -- How to measure success

  -- Target application
  target_courses UUID[], -- Which courses to apply this in
  target_timeline TEXT, -- e.g., "2-3 weeks", "This semester"

  -- Goal tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'dismissed', 'archived')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  progress_notes TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback_improvement_goals ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_improvement_goals_university ON feedback_improvement_goals(university_id);
CREATE INDEX idx_improvement_goals_user_status ON feedback_improvement_goals(user_id, status);
CREATE INDEX idx_improvement_goals_pattern ON feedback_improvement_goals(pattern_id);
CREATE INDEX idx_improvement_goals_progress ON feedback_improvement_goals(progress);
CREATE INDEX idx_improvement_goals_created ON feedback_improvement_goals(created_at DESC);
CREATE INDEX idx_improvement_goals_target_courses ON feedback_improvement_goals USING GIN(target_courses);

-- RLS Policies
CREATE POLICY "Users can manage their own goals"
  ON feedback_improvement_goals FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 4. FEEDBACK TIMELINE EVENTS TABLE
-- =====================================================
-- Stores timeline events for feedback visualization

CREATE TABLE IF NOT EXISTS feedback_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feedback_id UUID REFERENCES instructor_feedback(id) ON DELETE CASCADE,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN ('feedback_received', 'pattern_detected', 'goal_created', 'goal_completed', 'milestone_reached')),
  event_title TEXT NOT NULL,
  event_description TEXT,

  -- Related entities
  course_id UUID REFERENCES canvas_courses(id),
  assignment_id UUID REFERENCES canvas_assignments(id),
  pattern_id UUID REFERENCES feedback_patterns(id),
  goal_id UUID REFERENCES feedback_improvement_goals(id),

  -- Event metadata
  sentiment_label TEXT,
  score NUMERIC(10, 2),
  points_possible NUMERIC(10, 2),

  -- Timestamps
  event_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback_timeline_events ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_timeline_events_university ON feedback_timeline_events(university_id);
CREATE INDEX idx_timeline_events_user_date ON feedback_timeline_events(user_id, event_date DESC);
CREATE INDEX idx_timeline_events_type ON feedback_timeline_events(event_type);
CREATE INDEX idx_timeline_events_course ON feedback_timeline_events(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_timeline_events_feedback ON feedback_timeline_events(feedback_id) WHERE feedback_id IS NOT NULL;

-- RLS Policies
CREATE POLICY "Users can view their own timeline events"
  ON feedback_timeline_events FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own timeline events"
  ON feedback_timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Auto-update updated_at columns
CREATE TRIGGER update_instructor_feedback_updated_at
  BEFORE UPDATE ON instructor_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_patterns_updated_at
  BEFORE UPDATE ON feedback_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_improvement_goals_updated_at
  BEFORE UPDATE ON feedback_improvement_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-populate university_id from user
CREATE TRIGGER set_instructor_feedback_university
  BEFORE INSERT ON instructor_feedback
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_feedback_patterns_university
  BEFORE INSERT ON feedback_patterns
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_improvement_goals_university
  BEFORE INSERT ON feedback_improvement_goals
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_timeline_events_university
  BEFORE INSERT ON feedback_timeline_events
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- Create timeline event when feedback is analyzed
CREATE OR REPLACE FUNCTION create_feedback_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.analyzed_at IS NOT NULL AND OLD.analyzed_at IS NULL THEN
    INSERT INTO feedback_timeline_events (
      university_id,
      user_id,
      feedback_id,
      event_type,
      event_title,
      event_description,
      course_id,
      assignment_id,
      sentiment_label,
      score,
      points_possible,
      event_date
    ) VALUES (
      NEW.university_id,
      NEW.user_id,
      NEW.id,
      'feedback_received',
      'Feedback Analyzed',
      'Instructor feedback was analyzed with AI',
      NEW.course_id,
      NEW.assignment_id,
      NEW.sentiment_label,
      NEW.score,
      NEW.points_possible,
      NEW.created_at
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_feedback_event
  AFTER UPDATE ON instructor_feedback
  FOR EACH ROW
  EXECUTE FUNCTION create_feedback_timeline_event();

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Get feedback sentiment distribution for a user
CREATE OR REPLACE FUNCTION get_feedback_sentiment_distribution(
  p_user_id UUID,
  p_course_id UUID DEFAULT NULL
)
RETURNS TABLE(
  positive_count BIGINT,
  neutral_count BIGINT,
  negative_count BIGINT,
  total_count BIGINT,
  average_sentiment NUMERIC,
  positive_percentage NUMERIC,
  neutral_percentage NUMERIC,
  negative_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH sentiment_counts AS (
    SELECT
      COUNT(*) FILTER (WHERE sentiment_label = 'positive') AS pos,
      COUNT(*) FILTER (WHERE sentiment_label = 'neutral') AS neu,
      COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS neg,
      COUNT(*) AS total,
      AVG(sentiment_score) AS avg_sentiment
    FROM instructor_feedback
    WHERE user_id = p_user_id
      AND (p_course_id IS NULL OR course_id = p_course_id)
      AND sentiment_label IS NOT NULL
  )
  SELECT
    pos AS positive_count,
    neu AS neutral_count,
    neg AS negative_count,
    total AS total_count,
    ROUND(avg_sentiment::NUMERIC, 3) AS average_sentiment,
    ROUND((pos::NUMERIC / NULLIF(total::NUMERIC, 0)) * 100, 1) AS positive_percentage,
    ROUND((neu::NUMERIC / NULLIF(total::NUMERIC, 0)) * 100, 1) AS neutral_percentage,
    ROUND((neg::NUMERIC / NULLIF(total::NUMERIC, 0)) * 100, 1) AS negative_percentage
  FROM sentiment_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get top patterns for a user
CREATE OR REPLACE FUNCTION get_top_feedback_patterns(
  p_user_id UUID,
  p_pattern_type TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  pattern_id UUID,
  pattern_type TEXT,
  category TEXT,
  description TEXT,
  occurrences INTEGER,
  confidence NUMERIC,
  severity TEXT,
  courses_affected INTEGER,
  improvement_trend TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id AS pattern_id,
    fp.pattern_type,
    fp.category,
    fp.description,
    fp.occurrences,
    fp.confidence,
    fp.severity,
    ARRAY_LENGTH(fp.courses_affected, 1) AS courses_affected,
    fp.improvement_trend
  FROM feedback_patterns fp
  WHERE fp.user_id = p_user_id
    AND (p_pattern_type IS NULL OR fp.pattern_type = p_pattern_type)
  ORDER BY
    fp.confidence DESC NULLS LAST,
    fp.occurrences DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get active improvement goals
CREATE OR REPLACE FUNCTION get_active_improvement_goals(
  p_user_id UUID,
  p_include_in_progress BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  goal_id UUID,
  goal_title TEXT,
  goal_description TEXT,
  category TEXT,
  status TEXT,
  progress INTEGER,
  action_items JSONB,
  created_at TIMESTAMPTZ,
  pattern_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id AS goal_id,
    g.goal_title,
    g.goal_description,
    g.goal_category AS category,
    g.status,
    g.progress,
    g.action_items,
    g.created_at,
    p.description AS pattern_description
  FROM feedback_improvement_goals g
  LEFT JOIN feedback_patterns p ON g.pattern_id = p.id
  WHERE g.user_id = p_user_id
    AND (
      g.status = 'active'
      OR (p_include_in_progress AND g.status = 'in_progress')
    )
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Calculate feedback trend over time
CREATE OR REPLACE FUNCTION get_feedback_trend(
  p_user_id UUID,
  p_period TEXT DEFAULT 'month', -- 'week', 'month', 'semester'
  p_lookback INTEGER DEFAULT 6
)
RETURNS TABLE(
  period_label TEXT,
  period_start DATE,
  average_sentiment NUMERIC,
  average_score_percentage NUMERIC,
  feedback_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH periods AS (
    SELECT
      CASE p_period
        WHEN 'week' THEN DATE_TRUNC('week', created_at)::DATE
        WHEN 'month' THEN DATE_TRUNC('month', created_at)::DATE
        WHEN 'semester' THEN DATE_TRUNC('quarter', created_at)::DATE
      END AS period_start,
      sentiment_score,
      CASE
        WHEN points_possible > 0 THEN (score / points_possible) * 100
        ELSE NULL
      END AS score_percentage
    FROM instructor_feedback
    WHERE user_id = p_user_id
      AND created_at >= CURRENT_DATE - (p_lookback || ' ' || p_period)::INTERVAL
  )
  SELECT
    TO_CHAR(period_start,
      CASE p_period
        WHEN 'week' THEN 'Week of Mon DD'
        WHEN 'month' THEN 'Month YYYY'
        WHEN 'semester' THEN 'Q YYYY'
      END
    ) AS period_label,
    period_start,
    ROUND(AVG(sentiment_score)::NUMERIC, 3) AS average_sentiment,
    ROUND(AVG(score_percentage)::NUMERIC, 1) AS average_score_percentage,
    COUNT(*) AS feedback_count
  FROM periods
  GROUP BY period_start
  ORDER BY period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_feedback_sentiment_distribution(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_feedback_patterns(UUID, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_improvement_goals(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feedback_trend(UUID, TEXT, INTEGER) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration created:
-- ✅ instructor_feedback table (analyzed feedback storage)
-- ✅ feedback_patterns table (pattern detection)
-- ✅ feedback_improvement_goals table (goal tracking)
-- ✅ feedback_timeline_events table (timeline visualization)
-- ✅ All tables have university_id for multi-tenancy
-- ✅ All tables have RLS policies
-- ✅ Strategic indexes for performance
-- ✅ Automatic triggers for updates and timeline events
-- ✅ Helper functions for analytics
--
-- Next steps:
-- 1. Run: supabase db push
-- 2. Create FeedbackAggregator service
-- 3. Build FeedbackHub UI components
-- 4. Integrate with existing AI services
-- =====================================================