/*
  # Phase 9: Academic Gamification System

  ## Overview
  This migration creates academic-specific achievements and gamification features
  that integrate with the existing HapiAI points system.

  ## Tables Created
  1. academic_achievements - Predefined academic achievement definitions
  2. user_academic_achievements - User progress and unlocks for academic achievements
  3. study_streaks - Study streak tracking separate from morning pulse streaks
  4. academic_points_log - Detailed log of academic points for analytics

  ## Integration
  - Academic points add to profiles.total_points
  - Separate tracking allows academic vs non-academic analytics
  - Works alongside existing achievements table
*/

-- ============================================================================
-- ACADEMIC ACHIEVEMENTS DEFINITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS academic_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text, -- Icon emoji or icon name
  category text NOT NULL CHECK (category IN ('assignments', 'study', 'grades', 'tutor', 'planner')),
  tier text NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  points_reward integer NOT NULL,
  criteria jsonb NOT NULL, -- Flexible criteria definition
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE academic_achievements IS 'Predefined academic achievement definitions';
COMMENT ON COLUMN academic_achievements.achievement_key IS 'Unique identifier for achievement (e.g., perfect_week)';
COMMENT ON COLUMN academic_achievements.criteria IS 'JSON criteria: {type: string, target: number, unit?: string, threshold?: number}';

-- ============================================================================
-- USER ACHIEVEMENT PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_academic_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key text NOT NULL REFERENCES academic_achievements(achievement_key),
  progress integer DEFAULT 0,
  target integer,
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

COMMENT ON TABLE user_academic_achievements IS 'User progress toward academic achievements';

-- ============================================================================
-- STUDY STREAKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS study_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_study_date date,
  streak_start_date date,
  total_study_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

COMMENT ON TABLE study_streaks IS 'Study streak tracking separate from morning pulse streaks';

-- ============================================================================
-- ACADEMIC POINTS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS academic_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  source text NOT NULL, -- 'assignment_early', 'study_session', 'ai_tutor_usage', etc.
  source_id uuid, -- ID of related entity if applicable
  description text,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE academic_points_log IS 'Detailed log of academic points earned';
COMMENT ON COLUMN academic_points_log.source IS 'Source of points: assignment_early, assignment_on_time, study_session, ai_tutor_question, practice_quiz, achievement_unlocked, streak_milestone';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_user_achievements_user ON user_academic_achievements(user_id, is_unlocked);
CREATE INDEX idx_user_achievements_unlocked ON user_academic_achievements(user_id) WHERE is_unlocked = true;
CREATE INDEX idx_study_streaks_user ON study_streaks(user_id);
CREATE INDEX idx_academic_points_user_date ON academic_points_log(user_id, created_at DESC);
CREATE INDEX idx_academic_points_source ON academic_points_log(source, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE academic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_academic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_points_log ENABLE ROW LEVEL SECURITY;

-- Achievements are publicly viewable
CREATE POLICY "Anyone can view active achievements"
  ON academic_achievements FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Users can only see their own progress
CREATE POLICY "Users can view their own achievement progress"
  ON user_academic_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own streaks"
  ON study_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own points log"
  ON academic_points_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_academic_achievements
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON user_academic_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to study_streaks
CREATE TRIGGER update_study_streaks_updated_at
  BEFORE UPDATE ON study_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Function to increment user points (integrates with main points system)
CREATE OR REPLACE FUNCTION increment_user_points(user_id_param uuid, points_param integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET total_points = total_points + points_param
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_user_points IS 'Increments total_points in profiles table';

-- Function to get user's academic stats
CREATE OR REPLACE FUNCTION get_user_academic_stats(user_id_param uuid)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_achievements', COUNT(*),
    'unlocked_achievements', COUNT(*) FILTER (WHERE is_unlocked = true),
    'total_points_from_achievements', COALESCE(SUM(aa.points_reward) FILTER (WHERE uaa.is_unlocked = true), 0),
    'bronze_count', COUNT(*) FILTER (WHERE is_unlocked = true AND aa.tier = 'bronze'),
    'silver_count', COUNT(*) FILTER (WHERE is_unlocked = true AND aa.tier = 'silver'),
    'gold_count', COUNT(*) FILTER (WHERE is_unlocked = true AND aa.tier = 'gold'),
    'platinum_count', COUNT(*) FILTER (WHERE is_unlocked = true AND aa.tier = 'platinum')
  )
  INTO result
  FROM user_academic_achievements uaa
  JOIN academic_achievements aa ON uaa.achievement_key = aa.achievement_key
  WHERE uaa.user_id = user_id_param;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_academic_stats IS 'Returns aggregated stats for user academic achievements';
