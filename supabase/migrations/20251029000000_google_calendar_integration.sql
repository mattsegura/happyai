-- =====================================================
-- GOOGLE CALENDAR INTEGRATION MIGRATION
-- =====================================================
-- This migration implements Google Calendar integration with bi-directional sync,
-- conflict resolution, and webhook support for the Hapi Academics Tab.
--
-- FEATURES:
-- - Google Calendar OAuth token storage (encrypted)
-- - Calendar connection management (multiple calendars per user)
-- - Event mappings across systems (Canvas ↔ Hapi ↔ Google)
-- - Conflict detection and resolution
-- - Sync status tracking and audit logging
-- - Webhook channel management for real-time updates
-- - Rate limiting for Google Calendar API
--
-- SYNC STRATEGY:
-- - Canvas → Google: One-way, read-only (Canvas is source of truth)
-- - Hapi study sessions → Google: One-way (allow users to see in Google)
-- - Google external events → Hapi: One-way (display in unified view)
-- - Conflict Resolution: Canvas > Hapi > Google priority
--
-- SECURITY:
-- - Tokens encrypted using same pattern as Canvas tokens
-- - RLS policies for all tables
-- - Audit logging for all operations
-- - Rate limiting (10,000 req/day per Google project)
-- =====================================================

-- =====================================================
-- 1. CALENDAR CONNECTIONS TABLE
-- =====================================================
-- Stores Google Calendar (and future provider) connections

CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Provider information
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')), -- Future: Outlook, Apple Calendar
  calendar_id TEXT NOT NULL, -- Google Calendar ID (e.g., 'primary', 'calendar_id@group.calendar.google.com')
  calendar_name TEXT,
  calendar_timezone TEXT DEFAULT 'UTC',

  -- OAuth tokens (encrypted)
  access_token TEXT NOT NULL, -- Encrypted with same system as Canvas
  refresh_token TEXT, -- Encrypted
  token_type TEXT DEFAULT 'Bearer',
  token_expires_at TIMESTAMPTZ,
  scope TEXT,

  -- Encryption metadata
  encryption_key_id TEXT DEFAULT 'google_calendar_key_v1',
  encrypted_at TIMESTAMPTZ DEFAULT now(),
  token_hash TEXT, -- SHA256 hash for quick lookups

  -- Sync settings
  sync_enabled BOOLEAN DEFAULT true,
  sync_direction TEXT DEFAULT 'both' CHECK (sync_direction IN ('both', 'to_hapi', 'to_google', 'disabled')),
  sync_canvas_events BOOLEAN DEFAULT true, -- Sync Canvas events to this Google calendar
  sync_study_sessions BOOLEAN DEFAULT true, -- Sync Hapi study sessions to this Google calendar
  sync_external_events BOOLEAN DEFAULT true, -- Import external Google events to Hapi

  -- Sync status
  last_sync_at TIMESTAMPTZ,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'error', 'partial', 'pending')),
  last_sync_error TEXT,
  next_sync_at TIMESTAMPTZ,

  -- Webhook channel (for push notifications)
  webhook_channel_id TEXT, -- Google channel ID
  webhook_resource_id TEXT, -- Google resource ID
  webhook_expiration TIMESTAMPTZ, -- Webhooks expire after ~7 days

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  UNIQUE(user_id, provider, calendar_id) -- One connection per calendar per user
);

-- Enable RLS
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_calendar_connections_university_id ON calendar_connections(university_id);
CREATE INDEX idx_calendar_connections_user_id ON calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_provider ON calendar_connections(provider);
CREATE INDEX idx_calendar_connections_sync_enabled ON calendar_connections(sync_enabled) WHERE sync_enabled = true;
CREATE INDEX idx_calendar_connections_token_hash ON calendar_connections(token_hash);
CREATE INDEX idx_calendar_connections_token_expires ON calendar_connections(token_expires_at);
CREATE INDEX idx_calendar_connections_webhook_expiration ON calendar_connections(webhook_expiration) WHERE webhook_expiration IS NOT NULL;
CREATE INDEX idx_calendar_connections_next_sync ON calendar_connections(next_sync_at) WHERE sync_enabled = true AND next_sync_at IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER set_calendar_connections_updated_at
  BEFORE UPDATE ON calendar_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_calendar_connection_university
  BEFORE INSERT ON calendar_connections
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own calendar connections"
  ON calendar_connections FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own calendar connections"
  ON calendar_connections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own calendar connections"
  ON calendar_connections FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can delete their own calendar connections"
  ON calendar_connections FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 2. CALENDAR EVENT MAPPINGS TABLE
-- =====================================================
-- Maps events across Canvas, Hapi, and Google Calendar systems

CREATE TABLE IF NOT EXISTS calendar_event_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calendar_connection_id UUID REFERENCES calendar_connections(id) ON DELETE CASCADE,

  -- Event IDs across systems
  hapi_event_id UUID, -- References study_sessions.id or canvas_calendar_events.id
  hapi_event_type TEXT CHECK (hapi_event_type IN ('study_session', 'canvas_event')),
  canvas_event_id TEXT, -- Canvas calendar event ID (if from Canvas)
  google_event_id TEXT, -- Google Calendar event ID

  -- Event metadata
  event_title TEXT NOT NULL,
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ NOT NULL,
  event_description TEXT,
  event_location TEXT,
  all_day BOOLEAN DEFAULT false,

  -- Source tracking
  source_system TEXT NOT NULL CHECK (source_system IN ('canvas', 'hapi', 'google')),
  created_by_system TEXT NOT NULL CHECK (created_by_system IN ('canvas', 'hapi', 'google')),

  -- Modification tracking
  last_modified_at TIMESTAMPTZ DEFAULT now(),
  last_modified_by TEXT CHECK (last_modified_by IN ('canvas', 'hapi', 'google', 'user')),
  hapi_version_hash TEXT, -- Hash of Hapi event data for change detection
  google_version_hash TEXT, -- Hash of Google event data for change detection

  -- Sync status
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict', 'error')),
  sync_error TEXT,

  -- Deletion tracking
  deleted_in_canvas BOOLEAN DEFAULT false,
  deleted_in_hapi BOOLEAN DEFAULT false,
  deleted_in_google BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT calendar_event_mappings_has_at_least_one_id CHECK (
    hapi_event_id IS NOT NULL OR canvas_event_id IS NOT NULL OR google_event_id IS NOT NULL
  ),
  CONSTRAINT calendar_event_mappings_time_order CHECK (event_end > event_start)
);

-- Enable RLS
ALTER TABLE calendar_event_mappings ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_calendar_event_mappings_university_id ON calendar_event_mappings(university_id);
CREATE INDEX idx_calendar_event_mappings_user_id ON calendar_event_mappings(user_id);
CREATE INDEX idx_calendar_event_mappings_connection_id ON calendar_event_mappings(calendar_connection_id);
CREATE INDEX idx_calendar_event_mappings_hapi_event ON calendar_event_mappings(hapi_event_id, hapi_event_type) WHERE hapi_event_id IS NOT NULL;
CREATE INDEX idx_calendar_event_mappings_canvas_event ON calendar_event_mappings(canvas_event_id) WHERE canvas_event_id IS NOT NULL;
CREATE INDEX idx_calendar_event_mappings_google_event ON calendar_event_mappings(google_event_id) WHERE google_event_id IS NOT NULL;
CREATE INDEX idx_calendar_event_mappings_sync_status ON calendar_event_mappings(sync_status) WHERE sync_status != 'synced';
CREATE INDEX idx_calendar_event_mappings_conflicts ON calendar_event_mappings(user_id, sync_status) WHERE sync_status = 'conflict';
CREATE INDEX idx_calendar_event_mappings_event_time ON calendar_event_mappings(event_start, event_end);
CREATE INDEX idx_calendar_event_mappings_upcoming ON calendar_event_mappings(user_id, event_start);

-- Trigger for updated_at
CREATE TRIGGER set_calendar_event_mappings_updated_at
  BEFORE UPDATE ON calendar_event_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_calendar_event_mapping_university
  BEFORE INSERT ON calendar_event_mappings
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own calendar event mappings"
  ON calendar_event_mappings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own calendar event mappings"
  ON calendar_event_mappings FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own calendar event mappings"
  ON calendar_event_mappings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can delete their own calendar event mappings"
  ON calendar_event_mappings FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 3. CALENDAR SYNC CONFLICTS TABLE
-- =====================================================
-- Tracks conflicts that need manual resolution

CREATE TABLE IF NOT EXISTS calendar_sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_mapping_id UUID REFERENCES calendar_event_mappings(id) ON DELETE SET NULL,

  -- Conflict information
  conflict_type TEXT NOT NULL CHECK (conflict_type IN (
    'time_change',        -- Event time changed in multiple systems
    'content_change',     -- Event title/description changed differently
    'deletion_conflict',  -- Deleted in one system but modified in another
    'duplicate_event',    -- Same event created in multiple systems
    'location_change'     -- Location changed differently
  )),
  conflict_description TEXT NOT NULL,

  -- Conflicting versions
  canvas_version JSONB,  -- Canvas event data (if applicable)
  hapi_version JSONB,    -- Hapi event data
  google_version JSONB,  -- Google event data

  -- Resolution
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'ignored', 'auto_resolved')),
  resolution_action TEXT CHECK (resolution_action IN ('keep_canvas', 'keep_hapi', 'keep_google', 'merge', 'delete_all', 'manual')),
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT, -- 'user' or 'system'
  resolution_notes TEXT,

  -- Auto-resolution attempts
  auto_resolve_attempted BOOLEAN DEFAULT false,
  auto_resolve_failed_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_sync_conflicts ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_calendar_sync_conflicts_university_id ON calendar_sync_conflicts(university_id);
CREATE INDEX idx_calendar_sync_conflicts_user_id ON calendar_sync_conflicts(user_id);
CREATE INDEX idx_calendar_sync_conflicts_mapping_id ON calendar_sync_conflicts(event_mapping_id);
CREATE INDEX idx_calendar_sync_conflicts_pending ON calendar_sync_conflicts(user_id, resolution_status) WHERE resolution_status = 'pending';
CREATE INDEX idx_calendar_sync_conflicts_type ON calendar_sync_conflicts(conflict_type);
CREATE INDEX idx_calendar_sync_conflicts_created ON calendar_sync_conflicts(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_calendar_sync_conflicts_updated_at
  BEFORE UPDATE ON calendar_sync_conflicts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_calendar_sync_conflict_university
  BEFORE INSERT ON calendar_sync_conflicts
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own sync conflicts"
  ON calendar_sync_conflicts FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own sync conflicts"
  ON calendar_sync_conflicts FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 4. CALENDAR SYNC LOG TABLE
-- =====================================================
-- Audit trail for all calendar sync operations

CREATE TABLE IF NOT EXISTS calendar_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calendar_connection_id UUID REFERENCES calendar_connections(id) ON DELETE SET NULL,

  -- Sync operation details
  sync_type TEXT NOT NULL CHECK (sync_type IN (
    'full_sync',
    'incremental_sync',
    'canvas_to_google',
    'hapi_to_google',
    'google_to_hapi',
    'conflict_resolution',
    'webhook_update'
  )),
  sync_direction TEXT CHECK (sync_direction IN ('to_google', 'to_hapi', 'bidirectional')),

  -- Sync status
  status TEXT NOT NULL CHECK (status IN ('started', 'in_progress', 'completed', 'failed', 'partial')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Sync results
  events_fetched INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  events_deleted INTEGER DEFAULT 0,
  events_failed INTEGER DEFAULT 0,
  conflicts_detected INTEGER DEFAULT 0,
  conflicts_resolved INTEGER DEFAULT 0,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Performance metrics
  duration_seconds INTEGER,
  api_calls_made INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_sync_log ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_calendar_sync_log_university_id ON calendar_sync_log(university_id);
CREATE INDEX idx_calendar_sync_log_user_id ON calendar_sync_log(user_id);
CREATE INDEX idx_calendar_sync_log_connection_id ON calendar_sync_log(calendar_connection_id);
CREATE INDEX idx_calendar_sync_log_user_created ON calendar_sync_log(user_id, created_at DESC);
CREATE INDEX idx_calendar_sync_log_status ON calendar_sync_log(status);
CREATE INDEX idx_calendar_sync_log_sync_type ON calendar_sync_log(sync_type);
CREATE INDEX idx_calendar_sync_log_failed ON calendar_sync_log(user_id, status) WHERE status IN ('failed', 'partial');

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_calendar_sync_log_university
  BEFORE INSERT ON calendar_sync_log
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own calendar sync logs"
  ON calendar_sync_log FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can insert their own calendar sync logs"
  ON calendar_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- Admins can view all sync logs in their university
CREATE POLICY "Admins can view university calendar sync logs"
  ON calendar_sync_log FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 5. GOOGLE CALENDAR RATE LIMITING
-- =====================================================
-- Extend api_rate_limits table with Google Calendar endpoints

-- No new table needed - use existing api_rate_limits table
-- Google Calendar API limits: 10,000 requests/day per project
-- We'll track per user: 1,000 requests/day per user (adjustable)

-- =====================================================
-- 6. HELPER FUNCTIONS FOR GOOGLE CALENDAR
-- =====================================================

-- Function to store Google Calendar connection with encryption
CREATE OR REPLACE FUNCTION store_google_calendar_connection(
  p_user_id UUID,
  p_calendar_id TEXT,
  p_calendar_name TEXT,
  p_access_token TEXT,
  p_refresh_token TEXT DEFAULT NULL,
  p_token_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_scope TEXT DEFAULT NULL,
  p_calendar_timezone TEXT DEFAULT 'UTC'
)
RETURNS UUID AS $$
DECLARE
  v_connection_id UUID;
  v_university_id UUID;
  v_encrypted_access_token TEXT;
  v_encrypted_refresh_token TEXT;
  v_token_hash TEXT;
BEGIN
  -- Get user's university_id
  SELECT university_id INTO v_university_id
  FROM profiles
  WHERE id = p_user_id;

  IF v_university_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a university_id';
  END IF;

  -- Encrypt tokens (using same encryption function as Canvas)
  v_encrypted_access_token := encrypt_canvas_token(p_access_token);

  IF p_refresh_token IS NOT NULL THEN
    v_encrypted_refresh_token := encrypt_canvas_token(p_refresh_token);
  END IF;

  -- Generate hash for quick lookups
  v_token_hash := generate_token_hash(p_access_token);

  -- Insert or update connection
  INSERT INTO calendar_connections (
    user_id,
    university_id,
    provider,
    calendar_id,
    calendar_name,
    calendar_timezone,
    access_token,
    refresh_token,
    token_hash,
    token_expires_at,
    scope,
    encryption_key_id,
    encrypted_at,
    sync_enabled,
    last_sync_status
  ) VALUES (
    p_user_id,
    v_university_id,
    'google',
    p_calendar_id,
    p_calendar_name,
    p_calendar_timezone,
    v_encrypted_access_token,
    v_encrypted_refresh_token,
    v_token_hash,
    p_token_expires_at,
    p_scope,
    'google_calendar_key_v1',
    now(),
    true,
    'pending'
  )
  ON CONFLICT (user_id, provider, calendar_id)
  DO UPDATE SET
    calendar_name = p_calendar_name,
    calendar_timezone = p_calendar_timezone,
    access_token = v_encrypted_access_token,
    refresh_token = v_encrypted_refresh_token,
    token_hash = v_token_hash,
    token_expires_at = p_token_expires_at,
    scope = p_scope,
    encrypted_at = now(),
    sync_enabled = true,
    updated_at = now()
  RETURNING id INTO v_connection_id;

  RETURN v_connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get valid Google Calendar token (with decryption)
CREATE OR REPLACE FUNCTION get_google_calendar_token(
  p_user_id UUID,
  p_calendar_id TEXT
)
RETURNS TABLE(
  connection_id UUID,
  decrypted_access_token TEXT,
  decrypted_refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  needs_refresh BOOLEAN
) AS $$
DECLARE
  v_connection RECORD;
  v_decrypted_access TEXT;
  v_decrypted_refresh TEXT;
BEGIN
  -- Rate limit check
  PERFORM check_rate_limit(p_user_id, 'google_calendar_access', 1000, 1440); -- 1000 req/day

  -- Get connection
  SELECT
    cc.id,
    cc.access_token,
    cc.refresh_token,
    cc.token_expires_at,
    cc.sync_enabled
  INTO v_connection
  FROM calendar_connections cc
  WHERE cc.user_id = p_user_id
    AND cc.calendar_id = p_calendar_id
    AND cc.provider = 'google'
    AND cc.sync_enabled = true;

  IF v_connection IS NULL THEN
    RAISE EXCEPTION 'No valid Google Calendar connection found';
  END IF;

  -- Decrypt tokens
  BEGIN
    v_decrypted_access := decrypt_canvas_token(v_connection.access_token);

    IF v_connection.refresh_token IS NOT NULL THEN
      v_decrypted_refresh := decrypt_canvas_token(v_connection.refresh_token);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Token decryption failed: %', SQLERRM;
  END;

  -- Update last access time
  UPDATE calendar_connections
  SET updated_at = now()
  WHERE id = v_connection.id;

  -- Check if token needs refresh (expires in < 30 minutes)
  RETURN QUERY SELECT
    v_connection.id,
    v_decrypted_access,
    v_decrypted_refresh,
    v_connection.token_expires_at,
    (v_connection.token_expires_at IS NULL OR v_connection.token_expires_at < now() + INTERVAL '30 minutes');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update webhook channel info
CREATE OR REPLACE FUNCTION update_webhook_channel(
  p_connection_id UUID,
  p_channel_id TEXT,
  p_resource_id TEXT,
  p_expiration TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE calendar_connections
  SET
    webhook_channel_id = p_channel_id,
    webhook_resource_id = p_resource_id,
    webhook_expiration = p_expiration,
    updated_at = now()
  WHERE id = p_connection_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for expired webhook channels
CREATE OR REPLACE FUNCTION get_expiring_webhook_channels()
RETURNS TABLE(
  connection_id UUID,
  user_id UUID,
  calendar_id TEXT,
  channel_id TEXT,
  expiration TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cc.id,
    cc.user_id,
    cc.calendar_id,
    cc.webhook_channel_id,
    cc.webhook_expiration
  FROM calendar_connections cc
  WHERE cc.sync_enabled = true
    AND cc.webhook_channel_id IS NOT NULL
    AND cc.webhook_expiration < now() + INTERVAL '1 day'; -- Expiring within 24 hours
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create event mapping
CREATE OR REPLACE FUNCTION create_calendar_event_mapping(
  p_user_id UUID,
  p_calendar_connection_id UUID,
  p_hapi_event_id UUID DEFAULT NULL,
  p_hapi_event_type TEXT DEFAULT NULL,
  p_canvas_event_id TEXT DEFAULT NULL,
  p_google_event_id TEXT DEFAULT NULL,
  p_event_title TEXT DEFAULT NULL,
  p_event_start TIMESTAMPTZ DEFAULT NULL,
  p_event_end TIMESTAMPTZ DEFAULT NULL,
  p_source_system TEXT DEFAULT NULL,
  p_created_by_system TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_mapping_id UUID;
  v_university_id UUID;
BEGIN
  -- Get user's university_id
  SELECT university_id INTO v_university_id
  FROM profiles
  WHERE id = p_user_id;

  -- Insert mapping
  INSERT INTO calendar_event_mappings (
    user_id,
    university_id,
    calendar_connection_id,
    hapi_event_id,
    hapi_event_type,
    canvas_event_id,
    google_event_id,
    event_title,
    event_start,
    event_end,
    source_system,
    created_by_system,
    sync_status
  ) VALUES (
    p_user_id,
    v_university_id,
    p_calendar_connection_id,
    p_hapi_event_id,
    p_hapi_event_type,
    p_canvas_event_id,
    p_google_event_id,
    p_event_title,
    p_event_start,
    p_event_end,
    p_source_system,
    p_created_by_system,
    'synced'
  )
  RETURNING id INTO v_mapping_id;

  RETURN v_mapping_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect conflicts
CREATE OR REPLACE FUNCTION detect_calendar_conflicts(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_conflict_count INTEGER := 0;
BEGIN
  -- Detect time change conflicts
  -- (Event modified in both Hapi and Google with different times)
  INSERT INTO calendar_sync_conflicts (
    user_id,
    event_mapping_id,
    conflict_type,
    conflict_description,
    hapi_version,
    google_version
  )
  SELECT
    cem.user_id,
    cem.id,
    'time_change',
    'Event time changed in both systems',
    jsonb_build_object('start', cem.event_start, 'end', cem.event_end),
    jsonb_build_object('modified', true) -- Placeholder
  FROM calendar_event_mappings cem
  WHERE cem.user_id = p_user_id
    AND cem.sync_status = 'conflict'
    AND NOT EXISTS (
      SELECT 1 FROM calendar_sync_conflicts csc
      WHERE csc.event_mapping_id = cem.id
        AND csc.resolution_status = 'pending'
    );

  GET DIAGNOSTICS v_conflict_count = ROW_COUNT;

  RETURN v_conflict_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get upcoming events across all systems
CREATE OR REPLACE FUNCTION get_unified_calendar_events(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT now(),
  p_end_date TIMESTAMPTZ DEFAULT now() + INTERVAL '30 days'
)
RETURNS TABLE(
  event_id UUID,
  event_title TEXT,
  event_start TIMESTAMPTZ,
  event_end TIMESTAMPTZ,
  event_source TEXT,
  calendar_name TEXT,
  color_code TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cem.id,
    cem.event_title,
    cem.event_start,
    cem.event_end,
    cem.source_system,
    cc.calendar_name,
    CASE cem.source_system
      WHEN 'canvas' THEN '#4285F4'  -- Blue
      WHEN 'hapi' THEN '#9C27B0'    -- Purple
      WHEN 'google' THEN '#0B8043'  -- Green
    END AS color_code
  FROM calendar_event_mappings cem
  LEFT JOIN calendar_connections cc ON cc.id = cem.calendar_connection_id
  WHERE cem.user_id = p_user_id
    AND cem.event_start >= p_start_date
    AND cem.event_start <= p_end_date
    AND cem.sync_status != 'error'
  ORDER BY cem.event_start ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION store_google_calendar_connection(UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_google_calendar_token(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_webhook_channel(UUID, TEXT, TEXT, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_webhook_channels() TO authenticated;
GRANT EXECUTE ON FUNCTION create_calendar_event_mapping(UUID, UUID, UUID, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_calendar_conflicts(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unified_calendar_events(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration created:
-- ✅ calendar_connections table (encrypted Google OAuth tokens)
-- ✅ calendar_event_mappings table (map events across Canvas/Hapi/Google)
-- ✅ calendar_sync_conflicts table (track and resolve conflicts)
-- ✅ calendar_sync_log table (audit trail for sync operations)
-- ✅ Helper functions for token storage/retrieval
-- ✅ Helper functions for event mapping and conflict detection
-- ✅ Webhook channel management
-- ✅ RLS policies for all tables
-- ✅ Comprehensive indexing for performance
-- ✅ Rate limiting integration
--
-- NEXT STEPS:
-- 1. Implement Google Calendar service layer (TypeScript)
-- 2. Implement calendar sync service with bi-directional sync
-- 3. Create Google OAuth Edge Function
-- 4. Create Google Calendar webhook handler Edge Function
-- 5. Build UI components for calendar connection management
-- 6. Test full sync flow end-to-end
-- =====================================================
