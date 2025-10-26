-- Error Tracking System
-- Stores application errors with automatic deduplication

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Error identification (for deduplication)
  error_fingerprint TEXT NOT NULL,  -- Hash of error message + stack + component
  error_message TEXT NOT NULL,
  error_stack TEXT,

  -- Context
  component TEXT,
  action TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Browser/Device info
  user_agent TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  device_type TEXT, -- desktop, mobile, tablet

  -- URL context
  url TEXT,

  -- Occurrence tracking
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ignored')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_error_logs_fingerprint
ON error_logs(error_fingerprint);

-- Index for querying
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_component ON error_logs(component);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_logs_last_seen ON error_logs(last_seen_at DESC);

-- Affected users tracking (many-to-many)
CREATE TABLE IF NOT EXISTS error_affected_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_log_id UUID NOT NULL REFERENCES error_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_affected_at TIMESTAMPTZ DEFAULT NOW(),
  last_affected_at TIMESTAMPTZ DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,

  UNIQUE(error_log_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_error_affected_users_error_log
ON error_affected_users(error_log_id);

CREATE INDEX IF NOT EXISTS idx_error_affected_users_user
ON error_affected_users(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trigger_error_logs_updated_at ON error_logs;
CREATE TRIGGER trigger_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_error_logs_updated_at();

-- RLS Policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_affected_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view error logs
CREATE POLICY "Admins can view all error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert error logs (from Edge Function)
CREATE POLICY "Service can insert error logs"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can update error logs (resolve, ignore)
CREATE POLICY "Admins can update error logs"
  ON error_logs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for affected users
CREATE POLICY "Admins can view affected users"
  ON error_affected_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Service can insert affected users"
  ON error_affected_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE error_logs IS 'Application error tracking with automatic deduplication';
COMMENT ON COLUMN error_logs.error_fingerprint IS 'Unique hash for grouping similar errors';
COMMENT ON COLUMN error_logs.occurrence_count IS 'Total number of times this error occurred';
COMMENT ON TABLE error_affected_users IS 'Tracks which users are affected by each error';
