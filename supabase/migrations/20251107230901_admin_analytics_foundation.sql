/**
 * Admin Analytics Foundation Migration
 *
 * Enhances the database schema for admin-level analytics features:
 * - Adds department field to classes for filtering
 * - Adds grade_level to profiles for cohort analysis
 * - Creates admin_analytics_cache for performance optimization
 * - Adds indexes for common analytics queries
 *
 * Phase 0: Canvas Integration & Foundation Setup
 */

-- =====================================================
-- 1. ADD DEPARTMENT FIELD TO CLASSES
-- =====================================================

-- Create department enum
DO $$ BEGIN
  CREATE TYPE department_type AS ENUM (
    'mathematics',
    'science',
    'english',
    'history',
    'arts',
    'physical_education',
    'technology',
    'languages',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add department column to classes table
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS department department_type DEFAULT 'other';

-- Add index for department filtering
CREATE INDEX IF NOT EXISTS idx_classes_department
  ON classes(university_id, department)
  WHERE is_active = true;

-- Comment
COMMENT ON COLUMN classes.department IS 'Academic department classification for analytics filtering';

-- =====================================================
-- 2. ADD GRADE_LEVEL TO PROFILES
-- =====================================================

-- Add grade_level column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS grade_level INTEGER;

-- Add check constraint for grade level (9-12 for high school, 1-4 for college)
ALTER TABLE profiles
  ADD CONSTRAINT check_grade_level
  CHECK (grade_level IS NULL OR (grade_level >= 1 AND grade_level <= 12));

-- Add index for grade level filtering
CREATE INDEX IF NOT EXISTS idx_profiles_grade_level
  ON profiles(university_id, grade_level, role)
  WHERE role = 'student';

-- Comment
COMMENT ON COLUMN profiles.grade_level IS 'Student grade level (9-12 for high school, 1-4 for college)';

-- =====================================================
-- 3. CREATE ADMIN ANALYTICS CACHE TABLE
-- =====================================================

-- This table caches complex analytics calculations for admin dashboard
-- Different from teacher analytics_cache (which is class-specific)
CREATE TABLE IF NOT EXISTS admin_analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

  -- Metric identification
  metric_name TEXT NOT NULL,
  -- Examples:
  --   'university_sentiment_overview'
  --   'department_grade_distribution'
  --   'grade_level_participation_rate'
  --   'at_risk_students_count'
  --   'weekly_engagement_trends'

  -- Metric value (flexible JSONB structure)
  metric_value JSONB NOT NULL,

  -- Filter parameters used to generate this metric
  filters JSONB,
  -- Examples:
  --   { "department": "mathematics" }
  --   { "grade_level": 10 }
  --   { "date_range": { "start": "2025-01-01", "end": "2025-01-31" } }
  --   { "department": "science", "grade_level": 11 }

  -- Cache metadata
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one cache entry per university + metric + filters
  CONSTRAINT unique_admin_metric UNIQUE (university_id, metric_name, filters)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_admin_analytics_cache_university
  ON admin_analytics_cache(university_id);

CREATE INDEX IF NOT EXISTS idx_admin_analytics_cache_metric
  ON admin_analytics_cache(university_id, metric_name);

CREATE INDEX IF NOT EXISTS idx_admin_analytics_cache_expires
  ON admin_analytics_cache(expires_at);

-- JSONB index for filter queries
CREATE INDEX IF NOT EXISTS idx_admin_analytics_cache_filters
  ON admin_analytics_cache USING gin(filters);

-- Comment
COMMENT ON TABLE admin_analytics_cache IS 'Caches expensive university-wide analytics calculations for admin dashboard';
COMMENT ON COLUMN admin_analytics_cache.metric_name IS 'Unique identifier for the metric type';
COMMENT ON COLUMN admin_analytics_cache.metric_value IS 'Calculated metric value stored as JSON';
COMMENT ON COLUMN admin_analytics_cache.filters IS 'Filter parameters used to generate this metric (for cache key)';
COMMENT ON COLUMN admin_analytics_cache.calculated_at IS 'When the metric was calculated';
COMMENT ON COLUMN admin_analytics_cache.expires_at IS 'When this cache entry should be invalidated';

-- =====================================================
-- 4. ADD RLS POLICIES FOR ADMIN ANALYTICS CACHE
-- =====================================================

-- Enable RLS
ALTER TABLE admin_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read analytics cache for their university
CREATE POLICY "Admins can read university analytics cache"
  ON admin_analytics_cache FOR SELECT
  USING (
    university_id = current_user_university_id()
    AND is_admin()
  );

-- Policy: Admins can insert analytics cache for their university
CREATE POLICY "Admins can insert university analytics cache"
  ON admin_analytics_cache FOR INSERT
  WITH CHECK (
    university_id = current_user_university_id()
    AND is_admin()
  );

-- Policy: Admins can update analytics cache for their university
CREATE POLICY "Admins can update university analytics cache"
  ON admin_analytics_cache FOR UPDATE
  USING (
    university_id = current_user_university_id()
    AND is_admin()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND is_admin()
  );

-- Policy: Admins can delete analytics cache for their university
CREATE POLICY "Admins can delete university analytics cache"
  ON admin_analytics_cache FOR DELETE
  USING (
    university_id = current_user_university_id()
    AND is_admin()
  );

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_analytics_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS admin_analytics_cache_updated_at ON admin_analytics_cache;
CREATE TRIGGER admin_analytics_cache_updated_at
  BEFORE UPDATE ON admin_analytics_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_analytics_cache_updated_at();

-- Function to invalidate analytics cache
CREATE OR REPLACE FUNCTION invalidate_admin_analytics_cache(
  p_university_id UUID,
  p_metric_name TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  IF p_metric_name IS NULL THEN
    -- Invalidate all cache for the university
    DELETE FROM admin_analytics_cache
    WHERE university_id = p_university_id;
  ELSE
    -- Invalidate specific metric
    DELETE FROM admin_analytics_cache
    WHERE university_id = p_university_id
      AND metric_name = p_metric_name;
  END IF;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_admin_analytics_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM admin_analytics_cache
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. ADD ANALYTICS-SPECIFIC INDEXES
-- =====================================================

-- Pulse checks: Optimize for university-wide sentiment queries
CREATE INDEX IF NOT EXISTS idx_pulse_checks_university_sentiment
  ON pulse_checks(university_id, emotion, created_at DESC)
  WHERE emotion IS NOT NULL;

-- Pulse checks: Optimize for date range queries
CREATE INDEX IF NOT EXISTS idx_pulse_checks_university_date_range
  ON pulse_checks(university_id, created_at DESC);

-- Canvas grades: Optimize for grade distribution queries
CREATE INDEX IF NOT EXISTS idx_canvas_submissions_university_grades
  ON canvas_submissions(university_id, score, graded_at DESC)
  WHERE score IS NOT NULL AND excused = false;

-- Canvas courses: Optimize for department queries (if department gets added to canvas_courses)
-- Note: This will be more useful after Canvas sync adds department mapping
CREATE INDEX IF NOT EXISTS idx_canvas_courses_university_active
  ON canvas_courses(university_id, user_id, enrollment_state)
  WHERE enrollment_state = 'active';

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION invalidate_admin_analytics_cache(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_admin_analytics_cache() TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Summary of changes:
-- ✅ Added department field to classes table (with enum)
-- ✅ Added grade_level field to profiles table (with constraint)
-- ✅ Created admin_analytics_cache table for performance optimization
-- ✅ Added RLS policies for admin-only access to analytics cache
-- ✅ Created helper functions for cache management
-- ✅ Added strategic indexes for common analytics queries
-- ✅ Added triggers for automatic timestamp updates
--
-- Next steps:
-- 1. Update departmentMapper.ts to sync with department_type enum
-- 2. Implement analytics cache service in frontend
-- 3. Create admin dashboard components to use these analytics
-- 4. Set up background job to clean expired cache entries
-- 5. Implement Canvas sync to populate department field automatically
