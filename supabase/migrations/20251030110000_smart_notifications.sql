-- =====================================================
-- SMART NOTIFICATIONS SYSTEM
-- =====================================================
-- This migration creates the notification system for the Hapi Academics Tab
-- Supports smart, context-aware notifications based on deadlines, mood, performance, and AI insights
--
-- Features:
-- - Multi-channel delivery (in-app, email, push, SMS)
-- - Priority-based queue
-- - Smart timing with quiet hours
-- - Rate limiting and duplicate prevention
-- - User preference controls
-- - Analytics and tracking
-- =====================================================

-- =====================================================
-- 1. NOTIFICATION TEMPLATES TABLE
-- =====================================================
-- Reusable notification templates with variable placeholders

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template identification
  template_key TEXT UNIQUE NOT NULL, -- e.g., 'assignment_due_tomorrow'
  type TEXT NOT NULL CHECK (type IN ('deadline', 'mood', 'performance', 'ai_suggestion', 'achievement')),

  -- Template content (supports {{variable}} placeholders)
  title_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  action_url_template TEXT, -- e.g., '/academics?view=grades&course={{course_id}}'
  action_label TEXT, -- e.g., 'View Assignment'

  -- Priority and status
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  description TEXT, -- For admin reference
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Templates are public for authenticated users
CREATE POLICY "Anyone can view active templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Only admins can manage templates
CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 2. NOTIFICATION QUEUE TABLE
-- =====================================================
-- Stores pending and sent notifications

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User and university
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,

  -- Notification source
  template_key TEXT REFERENCES notification_templates(template_key),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('deadline', 'mood', 'performance', 'ai_suggestion', 'achievement')),
  trigger_type TEXT NOT NULL, -- What triggered this notification

  -- Rendered content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,

  -- Priority
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),

  -- Scheduling
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),

  -- Delivery channels
  channels JSONB DEFAULT '["in_app"]'::jsonb, -- ['in_app', 'email', 'push', 'sms']

  -- Tracking
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB, -- Additional data (course_id, assignment_id, etc.)
  error_message TEXT, -- If delivery failed

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
CREATE INDEX idx_notification_queue_university_id ON notification_queue(university_id);
CREATE INDEX idx_notification_queue_user_status ON notification_queue(user_id, status, scheduled_for);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_priority ON notification_queue(priority DESC, scheduled_for ASC) WHERE status = 'pending';
CREATE INDEX idx_notification_queue_type ON notification_queue(notification_type);
CREATE INDEX idx_notification_queue_created ON notification_queue(created_at DESC);
CREATE INDEX idx_notification_queue_unread ON notification_queue(user_id, read_at) WHERE status = 'sent' AND read_at IS NULL;

-- Enable RLS
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-populate university_id from user
CREATE TRIGGER set_notification_queue_university
  BEFORE INSERT ON notification_queue
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

CREATE POLICY "Users can update their own notifications"
  ON notification_queue FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  )
  WITH CHECK (
    user_id = auth.uid()
    AND university_id = current_user_university_id()
  );

-- System/admin can insert notifications
CREATE POLICY "System can insert notifications"
  ON notification_queue FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Service role will handle this

-- Admins can view university notifications
CREATE POLICY "Admins can view university notifications"
  ON notification_queue FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- =====================================================
-- 3. NOTIFICATION PREFERENCES TABLE
-- =====================================================
-- User preferences for notification delivery

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Channel preferences
  in_app_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,

  -- Type preferences
  deadline_notifications BOOLEAN DEFAULT true,
  mood_notifications BOOLEAN DEFAULT true,
  performance_notifications BOOLEAN DEFAULT true,
  ai_suggestions BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  quiet_hours_timezone TEXT DEFAULT 'America/Los_Angeles',

  -- Frequency limits
  max_notifications_per_day INTEGER DEFAULT 10 CHECK (max_notifications_per_day > 0 AND max_notifications_per_day <= 50),
  min_hours_between_notifications NUMERIC(4, 2) DEFAULT 1.0 CHECK (min_hours_between_notifications >= 0.25),

  -- Contact info (for external channels)
  email_address TEXT,
  phone_number TEXT,
  phone_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_email ON notification_preferences(email_enabled) WHERE email_enabled = true;
CREATE INDEX idx_notification_preferences_push ON notification_preferences(push_enabled) WHERE push_enabled = true;

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Trigger for updated_at
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 4. NOTIFICATION TRIGGERS LOG TABLE
-- =====================================================
-- Audit log for notification trigger evaluations

CREATE TABLE IF NOT EXISTS notification_triggers_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Trigger details
  trigger_type TEXT NOT NULL,
  trigger_data JSONB, -- Context data that caused trigger evaluation

  -- Result
  notification_created BOOLEAN NOT NULL,
  notification_id UUID REFERENCES notification_queue(id) ON DELETE SET NULL,
  reason TEXT, -- Why notification was/wasn't created

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_triggers_log_user_id ON notification_triggers_log(user_id);
CREATE INDEX idx_triggers_log_user_date ON notification_triggers_log(user_id, created_at DESC);
CREATE INDEX idx_triggers_log_type ON notification_triggers_log(trigger_type);
CREATE INDEX idx_triggers_log_created ON notification_triggers_log(notification_created);

-- Enable RLS
ALTER TABLE notification_triggers_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trigger log"
  ON notification_triggers_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System can insert logs
CREATE POLICY "System can insert trigger logs"
  ON notification_triggers_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can view all logs in their university
CREATE POLICY "Admins can view university trigger logs"
  ON notification_triggers_log FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = notification_triggers_log.user_id
      AND profiles.university_id = current_user_university_id()
    )
  );

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get unread notification count for a user
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notification_queue
    WHERE user_id = p_user_id
    AND status = 'sent'
    AND read_at IS NULL
    AND dismissed_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_queue
  SET read_at = now()
  WHERE id = p_notification_id
  AND user_id = p_user_id
  AND read_at IS NULL;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as clicked
CREATE OR REPLACE FUNCTION mark_notification_clicked(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_queue
  SET
    clicked_at = now(),
    read_at = COALESCE(read_at, now())
  WHERE id = p_notification_id
  AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as dismissed
CREATE OR REPLACE FUNCTION mark_notification_dismissed(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_queue
  SET
    dismissed_at = now(),
    read_at = COALESCE(read_at, now())
  WHERE id = p_notification_id
  AND user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notifications for a user (with pagination)
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  body TEXT,
  action_url TEXT,
  action_label TEXT,
  priority INTEGER,
  notification_type TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  status TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    nq.id,
    nq.title,
    nq.body,
    nq.action_url,
    nq.action_label,
    nq.priority,
    nq.notification_type,
    nq.scheduled_for,
    nq.sent_at,
    nq.read_at,
    nq.clicked_at,
    nq.dismissed_at,
    nq.status,
    nq.created_at
  FROM notification_queue nq
  WHERE nq.user_id = p_user_id
  AND (p_status IS NULL OR nq.status = p_status)
  ORDER BY
    nq.priority DESC,
    nq.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM notification_queue
    WHERE created_at < now() - INTERVAL '90 days'
    AND status IN ('sent', 'failed', 'cancelled')
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. DEFAULT PREFERENCES FOR EXISTING USERS
-- =====================================================

-- Insert default preferences for all existing users who don't have them
INSERT INTO notification_preferences (
  user_id,
  in_app_enabled,
  email_enabled,
  push_enabled,
  sms_enabled,
  deadline_notifications,
  mood_notifications,
  performance_notifications,
  ai_suggestions,
  achievement_notifications,
  quiet_hours_enabled,
  quiet_hours_start,
  quiet_hours_end,
  quiet_hours_timezone,
  max_notifications_per_day,
  min_hours_between_notifications
)
SELECT
  id,
  true,  -- in_app_enabled
  false, -- email_enabled
  false, -- push_enabled
  false, -- sms_enabled
  true,  -- deadline_notifications
  true,  -- mood_notifications
  true,  -- performance_notifications
  true,  -- ai_suggestions
  true,  -- achievement_notifications
  true,  -- quiet_hours_enabled
  '22:00:00'::time, -- quiet_hours_start
  '08:00:00'::time, -- quiet_hours_end
  'America/Los_Angeles', -- quiet_hours_timezone
  10,    -- max_notifications_per_day
  1.0    -- min_hours_between_notifications
FROM profiles
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- 7. TRIGGER TO CREATE DEFAULT PREFERENCES FOR NEW USERS
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id,
    in_app_enabled,
    email_enabled,
    push_enabled,
    sms_enabled,
    deadline_notifications,
    mood_notifications,
    performance_notifications,
    ai_suggestions,
    achievement_notifications,
    quiet_hours_enabled,
    quiet_hours_start,
    quiet_hours_end,
    quiet_hours_timezone,
    max_notifications_per_day,
    min_hours_between_notifications
  ) VALUES (
    NEW.id,
    true,  -- in_app_enabled
    false, -- email_enabled
    false, -- push_enabled
    false, -- sms_enabled
    true,  -- deadline_notifications
    true,  -- mood_notifications
    true,  -- performance_notifications
    true,  -- ai_suggestions
    true,  -- achievement_notifications
    true,  -- quiet_hours_enabled
    '22:00:00'::time,
    '08:00:00'::time,
    'America/Los_Angeles',
    10,
    1.0
  ) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_preferences_for_new_user
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Smart notification system is now ready!
-- Next steps:
-- 1. Run the seed migration to populate notification templates
-- 2. Implement the SmartNotificationService
-- 3. Set up background jobs for trigger checking and sending
-- =====================================================
