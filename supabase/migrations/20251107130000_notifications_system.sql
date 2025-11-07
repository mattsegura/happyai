-- ============================================
-- PHASE 5: CARE ALERTS - NOTIFICATION SYSTEM
-- Teacher View - In-App & Email Notifications
-- Created: 2025-11-07
-- ============================================

-- ============================================
-- Table 1: notification_preferences
-- User preferences for notifications
-- ============================================

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- In-app notifications
  enable_in_app BOOLEAN NOT NULL DEFAULT TRUE,

  -- Email notifications
  enable_email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  email_alert_frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (email_alert_frequency IN (
    'immediate',  -- Send email immediately when alert triggers
    'daily',      -- Daily digest at 8am
    'weekly',     -- Weekly digest every Monday at 8am
    'never'       -- No email notifications
  )),

  -- Push notifications (future feature)
  enable_push_alerts BOOLEAN NOT NULL DEFAULT FALSE,

  -- Quiet hours (no notifications during these times)
  enable_quiet_hours BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start TIME,  -- e.g., 22:00
  quiet_hours_end TIME,    -- e.g., 08:00

  -- Alert type preferences
  notify_critical_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_high_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_medium_alerts BOOLEAN NOT NULL DEFAULT TRUE,

  -- Notification types
  notify_emotional_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_academic_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  notify_intervention_responses BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
  ON public.notification_preferences(user_id);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- Table 2: notifications
-- In-app notification history
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'care_alert',
    'intervention_update',
    'student_recovery',
    'weekly_summary',
    'system_message'
  )),

  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Optional link to related resource
  link_url TEXT,
  link_text TEXT,

  -- Related entities (for filtering/grouping)
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.mood_alert_logs(id) ON DELETE CASCADE,

  -- Notification metadata
  severity TEXT CHECK (severity IN ('info', 'medium', 'high', 'critical')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read
  ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type
  ON public.notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_severity
  ON public.notifications(severity);

-- Composite index for unread notifications query
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications for users"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);  -- Allow system/teachers to create notifications

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- Function: Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER trigger_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notification_preferences_updated_at();

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON public.notifications;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_notifications_updated_at();

-- ============================================
-- Function: Get Unread Notification Count
-- ============================================

DROP FUNCTION IF EXISTS public.get_unread_notification_count(UUID);

CREATE OR REPLACE FUNCTION public.get_unread_notification_count(user_uid UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.notifications
    WHERE user_id = user_uid
      AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Mark Notification as Read
-- ============================================

DROP FUNCTION IF EXISTS public.mark_notification_read(UUID, UUID);

CREATE OR REPLACE FUNCTION public.mark_notification_read(
  notification_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET
    is_read = TRUE,
    read_at = NOW()
  WHERE id = notification_id_param
    AND user_id = user_id_param;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Mark All Notifications as Read
-- ============================================

DROP FUNCTION IF EXISTS public.mark_all_notifications_read(UUID);

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(user_id_param UUID)
RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET
    is_read = TRUE,
    read_at = NOW()
  WHERE user_id = user_id_param
    AND is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Create Care Alert Notification
-- ============================================

DROP FUNCTION IF EXISTS public.create_care_alert_notification(UUID, UUID, TEXT, TEXT, TEXT, UUID);

CREATE OR REPLACE FUNCTION public.create_care_alert_notification(
  teacher_id_param UUID,
  student_id_param UUID,
  student_name_param TEXT,
  alert_type_param TEXT,
  severity_param TEXT,
  alert_id_param UUID
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Generate notification text based on alert type
  CASE alert_type_param
    WHEN 'persistent_low' THEN
      notification_title := 'New Care Alert: Persistent Low Mood';
      notification_message := student_name_param || ' has shown Tier 1 sentiment for 3+ consecutive days';
    WHEN 'sudden_drop' THEN
      notification_title := 'New Care Alert: Sudden Mood Drop';
      notification_message := student_name_param || ' experienced a sudden mood drop from high to low sentiment';
    WHEN 'high_volatility' THEN
      notification_title := 'New Care Alert: High Emotional Volatility';
      notification_message := student_name_param || ' is showing high emotional volatility (SD > 1.5)';
    WHEN 'prolonged_negative' THEN
      notification_title := 'New Care Alert: Prolonged Negative Mood';
      notification_message := student_name_param || ' has been in Tier 1-2 for >5 out of 7 days';
    WHEN 'academic_risk' THEN
      notification_title := 'New Care Alert: Academic Risk';
      notification_message := student_name_param || ' is showing concerning academic patterns';
    WHEN 'cross_risk' THEN
      notification_title := 'CRITICAL: Combined Emotional & Academic Risk';
      notification_message := student_name_param || ' is flagged for both emotional AND academic concerns';
    ELSE
      notification_title := 'New Care Alert';
      notification_message := student_name_param || ' needs attention';
  END CASE;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    message,
    link_url,
    link_text,
    student_id,
    alert_id,
    severity,
    is_read
  ) VALUES (
    teacher_id_param,
    'care_alert',
    notification_title,
    notification_message,
    '/teacher/alerts',
    'View Care Alerts',
    student_id_param,
    alert_id_param,
    severity_param,
    FALSE
  )
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Initialize Default Notification Preferences
-- ============================================

CREATE OR REPLACE FUNCTION public.initialize_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-initialize preferences when new user signs up
DROP TRIGGER IF EXISTS trigger_initialize_notification_preferences ON auth.users;
CREATE TRIGGER trigger_initialize_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_notification_preferences();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE public.notification_preferences IS 'User preferences for in-app and email notifications';
COMMENT ON TABLE public.notifications IS 'In-app notification history for teachers';

COMMENT ON COLUMN public.notification_preferences.email_alert_frequency IS 'Frequency of email notifications: immediate, daily, weekly, never';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_start IS 'Start time for quiet hours (no notifications)';
COMMENT ON COLUMN public.notification_preferences.quiet_hours_end IS 'End time for quiet hours';

COMMENT ON COLUMN public.notifications.notification_type IS 'Type of notification: care_alert, intervention_update, student_recovery, etc.';
COMMENT ON COLUMN public.notifications.severity IS 'Notification severity: info, medium, high, critical';
COMMENT ON COLUMN public.notifications.link_url IS 'Optional URL to navigate when notification is clicked';

-- ============================================
-- Grant permissions
-- ============================================

GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_care_alert_notification(UUID, UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;
