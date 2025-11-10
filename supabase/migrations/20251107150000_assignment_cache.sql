-- ============================================================================
-- ASSIGNMENT CACHE SYSTEM
-- Phase 7: Workload Management & Planning
-- ============================================================================
-- Purpose: Cache Canvas assignment data for fast teacher workload queries
-- Features:
--   - Store assignment metadata from Canvas
--   - Enable cross-class workload visibility
--   - Support assignment balance reporting
--   - Track assignment distribution across semester
-- ============================================================================

-- ============================================================================
-- ASSIGNMENT CACHE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.assignment_cache (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_assignment_id TEXT NOT NULL, -- Canvas API assignment ID
  course_id TEXT NOT NULL, -- Canvas course ID
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Assignment Details
  title TEXT NOT NULL,
  description TEXT,
  assignment_type TEXT NOT NULL CHECK (assignment_type IN ('homework', 'quiz', 'project', 'exam', 'discussion')),

  -- Scheduling
  due_date TIMESTAMPTZ NOT NULL,
  unlock_at TIMESTAMPTZ,
  lock_at TIMESTAMPTZ,

  -- Workload Metrics
  points_possible INTEGER DEFAULT 0,
  estimated_hours DECIMAL(4, 2) DEFAULT 2.0, -- Estimated student workload in hours

  -- Metadata
  course_name TEXT,
  published BOOLEAN DEFAULT true,
  has_submissions BOOLEAN DEFAULT false,

  -- Cache Management
  cached_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '24 hours',
  last_synced TIMESTAMPTZ DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(canvas_assignment_id, course_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assignment_cache_teacher
  ON public.assignment_cache(teacher_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_assignment_cache_course
  ON public.assignment_cache(course_id, due_date DESC);

CREATE INDEX IF NOT EXISTS idx_assignment_cache_due_date
  ON public.assignment_cache(due_date);

CREATE INDEX IF NOT EXISTS idx_assignment_cache_type
  ON public.assignment_cache(assignment_type, due_date);

CREATE INDEX IF NOT EXISTS idx_assignment_cache_expires
  ON public.assignment_cache(expires_at)
  WHERE expires_at IS NOT NULL;

-- Composite index for workload queries
CREATE INDEX IF NOT EXISTS idx_assignment_cache_workload
  ON public.assignment_cache(teacher_id, due_date, assignment_type, estimated_hours);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.assignment_cache ENABLE ROW LEVEL SECURITY;

-- Teachers can view their own cached assignments
CREATE POLICY "Teachers can view own assignments"
  ON public.assignment_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Teachers can insert their own assignments
CREATE POLICY "Teachers can insert own assignments"
  ON public.assignment_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = teacher_id);

-- Teachers can update their own assignments
CREATE POLICY "Teachers can update own assignments"
  ON public.assignment_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Teachers can delete their own assignments
CREATE POLICY "Teachers can delete own assignments"
  ON public.assignment_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- Service role can access all (for sync operations)
CREATE POLICY "Service role has full access"
  ON public.assignment_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_assignment_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_assignment_cache_updated_at_trigger
  BEFORE UPDATE ON public.assignment_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_cache_updated_at();

-- ============================================================================
-- AUTOMATIC CACHE EXPIRATION CLEANUP
-- ============================================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_assignment_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.assignment_cache
  WHERE expires_at < now();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- WORKLOAD AGGREGATION VIEW
-- ============================================================================

-- View for daily workload aggregation
CREATE OR REPLACE VIEW public.daily_workload_summary AS
SELECT
  teacher_id,
  DATE(due_date) as due_date,
  COUNT(*) as assignment_count,
  SUM(points_possible) as total_points,
  SUM(estimated_hours) as total_hours,
  COUNT(CASE WHEN assignment_type = 'exam' THEN 1 END) as exam_count,
  COUNT(CASE WHEN assignment_type = 'project' THEN 1 END) as project_count,
  COUNT(CASE WHEN assignment_type = 'quiz' THEN 1 END) as quiz_count,
  COUNT(CASE WHEN assignment_type = 'homework' THEN 1 END) as homework_count,
  COUNT(CASE WHEN assignment_type = 'discussion' THEN 1 END) as discussion_count,
  array_agg(DISTINCT course_name) as courses
FROM public.assignment_cache
WHERE published = true
GROUP BY teacher_id, DATE(due_date);

-- Grant access to the view
GRANT SELECT ON public.daily_workload_summary TO authenticated;

-- ============================================================================
-- HELPER FUNCTIONS FOR WORKLOAD ANALYSIS
-- ============================================================================

-- Function to get workload density for a date range
CREATE OR REPLACE FUNCTION public.get_workload_density(
  p_teacher_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  due_date DATE,
  assignment_count INTEGER,
  total_hours DECIMAL,
  stress_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(ac.due_date) as due_date,
    COUNT(*)::INTEGER as assignment_count,
    SUM(ac.estimated_hours)::DECIMAL as total_hours,
    CASE
      WHEN COUNT(*) >= 8 THEN 'extreme'
      WHEN COUNT(*) >= 6 THEN 'high'
      WHEN COUNT(*) >= 4 THEN 'medium'
      ELSE 'low'
    END as stress_level
  FROM public.assignment_cache ac
  WHERE ac.teacher_id = p_teacher_id
    AND ac.due_date BETWEEN p_start_date AND p_end_date
    AND ac.published = true
  GROUP BY DATE(ac.due_date)
  ORDER BY DATE(ac.due_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get busiest weeks
CREATE OR REPLACE FUNCTION public.get_busiest_weeks(
  p_teacher_id UUID,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  week_start DATE,
  week_end DATE,
  assignment_count INTEGER,
  total_hours DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('week', ac.due_date)::DATE as week_start,
    (DATE_TRUNC('week', ac.due_date) + INTERVAL '6 days')::DATE as week_end,
    COUNT(*)::INTEGER as assignment_count,
    SUM(ac.estimated_hours)::DECIMAL as total_hours
  FROM public.assignment_cache ac
  WHERE ac.teacher_id = p_teacher_id
    AND ac.due_date BETWEEN p_start_date AND p_end_date
    AND ac.published = true
  GROUP BY DATE_TRUNC('week', ac.due_date)
  ORDER BY COUNT(*) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_cache TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_assignment_cache() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_workload_density(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_busiest_weeks(UUID, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.assignment_cache IS
'Cache of Canvas assignment data for teacher workload management and planning';

COMMENT ON COLUMN public.assignment_cache.estimated_hours IS
'Estimated student workload in hours - can be manually adjusted or AI-calculated';

COMMENT ON COLUMN public.assignment_cache.expires_at IS
'Cache expiration timestamp - assignments are refreshed daily';

COMMENT ON VIEW public.daily_workload_summary IS
'Aggregated view of daily assignment workload per teacher';

COMMENT ON FUNCTION public.cleanup_expired_assignment_cache() IS
'Removes expired cache entries - run daily via cron job';

COMMENT ON FUNCTION public.get_workload_density(UUID, TIMESTAMPTZ, TIMESTAMPTZ) IS
'Calculate workload density and stress levels for a date range';

COMMENT ON FUNCTION public.get_busiest_weeks(UUID, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER) IS
'Identify weeks with highest assignment concentration';
