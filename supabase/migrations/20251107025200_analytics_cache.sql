/**
 * Analytics Cache Table Migration
 *
 * Creates a table to cache expensive analytics calculations for teacher view.
 * This improves performance by avoiding redundant API calls and calculations.
 *
 * Phase 2: Academic Analytics
 */

-- Create analytics_cache table
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_data JSONB NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint to prevent duplicate cache entries
  UNIQUE(user_id, class_id, metric_type)
);

-- Create indexes for efficient queries
CREATE INDEX idx_analytics_cache_user_class ON analytics_cache(user_id, class_id);
CREATE INDEX idx_analytics_cache_metric_type ON analytics_cache(user_id, class_id, metric_type);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER analytics_cache_updated_at
  BEFORE UPDATE ON analytics_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_cache_updated_at();

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE analytics_cache IS 'Caches expensive analytics calculations to improve performance';
COMMENT ON COLUMN analytics_cache.user_id IS 'Teacher who owns this cache entry';
COMMENT ON COLUMN analytics_cache.class_id IS 'Class/course identifier (Canvas course ID)';
COMMENT ON COLUMN analytics_cache.metric_type IS 'Type of metric (e.g., class_average_grade, grade_distribution)';
COMMENT ON COLUMN analytics_cache.metric_data IS 'Cached calculation result as JSON';
COMMENT ON COLUMN analytics_cache.calculated_at IS 'When the metric was calculated';
COMMENT ON COLUMN analytics_cache.expires_at IS 'When this cache entry expires';

-- Row Level Security (RLS) Policies
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can only see their own cache
CREATE POLICY "Teachers can view their own analytics cache"
  ON analytics_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Teachers can insert their own cache entries
CREATE POLICY "Teachers can insert their own analytics cache"
  ON analytics_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can update their own cache entries
CREATE POLICY "Teachers can update their own analytics cache"
  ON analytics_cache
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Teachers can delete their own cache entries
CREATE POLICY "Teachers can delete their own analytics cache"
  ON analytics_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- Schedule cleanup of expired cache (if using pg_cron extension)
-- This would need to be configured separately in production
-- Example: SELECT cron.schedule('cleanup-analytics-cache', '0 2 * * *', 'SELECT cleanup_expired_analytics_cache()');
