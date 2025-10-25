-- =====================================================
-- ADMIN SECURITY: RLS POLICIES + AUDIT LOGGING
-- =====================================================
-- This migration adds database-level security for admin operations
-- and creates an audit log to track all admin actions.

-- =====================================================
-- 1. ADMIN RLS POLICIES
-- =====================================================

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can insert profiles (when creating users)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Admins can delete profiles (soft delete recommended)
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- CLASSES TABLE POLICIES
-- =====================================================

-- Admins can view all classes
CREATE POLICY "Admins can view all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can create classes
CREATE POLICY "Admins can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can update classes
CREATE POLICY "Admins can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Admins can delete classes
CREATE POLICY "Admins can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- CLASS_MEMBERS TABLE POLICIES
-- =====================================================

-- Admins can view all class memberships
CREATE POLICY "Admins can view all class members"
  ON class_members FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can enroll students
CREATE POLICY "Admins can enroll students"
  ON class_members FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Admins can remove students from classes
CREATE POLICY "Admins can remove students"
  ON class_members FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- PULSE_CHECKS TABLE POLICIES (Read-only for admins)
-- =====================================================

-- Admins can view all pulse checks (for sentiment monitoring)
CREATE POLICY "Admins can view all pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- HAPI_MOMENTS TABLE POLICIES (Read-only for admins)
-- =====================================================

-- Admins can view all hapi moments
CREATE POLICY "Admins can view all hapi moments"
  ON hapi_moments FOR SELECT
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 2. AUDIT LOG TABLE
-- =====================================================

-- Create audit log table to track all admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create_user', 'update_user', 'delete_user', 'create_class', etc.
  target_type TEXT NOT NULL, -- 'user', 'class', 'class_member', etc.
  target_id UUID, -- ID of the affected record
  details JSONB, -- Additional context (old values, new values, etc.)
  ip_address INET, -- Optional: track IP for security
  user_agent TEXT, -- Optional: track browser
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by admin
CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);

-- Index for fast queries by action
CREATE INDEX idx_audit_logs_action ON admin_audit_logs(action);

-- Index for fast queries by target
CREATE INDEX idx_audit_logs_target ON admin_audit_logs(target_type, target_id);

-- Index for date range queries
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at DESC);

-- =====================================================
-- AUDIT LOG RLS POLICIES
-- =====================================================

-- Enable RLS on audit logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admins can insert audit logs (via trigger or app)
CREATE POLICY "Admins can insert audit logs"
  ON admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Prevent deletion of audit logs (immutable)
CREATE POLICY "Audit logs cannot be deleted"
  ON admin_audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- =====================================================
-- 3. ADMIN SETTINGS TABLE
-- =====================================================

-- Create table for admin settings (feature flags, config)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- =====================================================
-- 4. HELPER FUNCTION: LOG ADMIN ACTION
-- =====================================================

-- Function to easily log admin actions from app
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Only log if user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can log actions';
  END IF;

  INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. SEED DEFAULT SETTINGS
-- =====================================================

-- Insert default feature flags
INSERT INTO admin_settings (setting_key, setting_value, description)
VALUES
  ('feature_morning_pulse', '{"enabled": true}'::JSONB, 'Enable morning pulse check-ins'),
  ('feature_class_pulse', '{"enabled": true}'::JSONB, 'Enable class pulse questions'),
  ('feature_hapi_moments', '{"enabled": true}'::JSONB, 'Enable peer recognition system'),
  ('feature_leaderboard', '{"enabled": true}'::JSONB, 'Display class leaderboards'),
  ('feature_canvas_integration', '{"enabled": true}'::JSONB, 'Allow Canvas LMS integration'),
  ('feature_ai_chat', '{"enabled": false}'::JSONB, 'Enable AI support chat')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- 1. RLS policies for admin operations on all tables
-- 2. admin_audit_logs table for tracking actions
-- 3. admin_settings table for feature flags
-- 4. Helper functions for checking admin status and logging
-- 5. Default feature flag settings
-- =====================================================
