-- =====================================================
-- MULTI-TENANCY MIGRATION
-- =====================================================
-- This migration implements complete data isolation between universities.
-- Each university is a separate tenant with isolated students, teachers, and admins.
--
-- ARCHITECTURE:
-- - Universities table: Core tenant entity
-- - university_id added to all relevant tables
-- - Complete RLS policy overhaul for data isolation
-- - Performance-optimized with strategic indexes
-- - Support for both university admins and super admins
--
-- PRODUCTION CONSIDERATIONS:
-- - Indexes on all university_id columns for query performance
-- - Composite indexes for common query patterns
-- - RLS policies use EXISTS for performance
-- - university_id denormalized to avoid excessive joins
-- - Audit trail includes university context
-- =====================================================

-- =====================================================
-- 1. CREATE UNIVERSITIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE, -- e.g., "stanford.edu", used for auto-assignment
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT university_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT university_domain_valid CHECK (domain IS NULL OR domain ~* '^[a-z0-9.-]+\.[a-z]{2,}$')
);

-- Indexes for universities table
CREATE INDEX idx_universities_domain ON universities(domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_universities_is_active ON universities(is_active) WHERE is_active = true;

-- Enable RLS on universities
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ADD UNIVERSITY_ID TO EXISTING TABLES
-- =====================================================

-- Core tables: Add university_id with foreign key
-- NOTE: Adding as nullable first, will set NOT NULL after data migration

-- Profiles (users belong to a university)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Classes (classes belong to a university)
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Pulse checks (denormalized for performance - avoids join through user)
ALTER TABLE pulse_checks
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Pulse check sets (denormalized for performance - avoids join through class)
ALTER TABLE pulse_check_sets
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Pulse responses (denormalized for performance)
ALTER TABLE pulse_responses
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Question responses (denormalized for performance)
ALTER TABLE question_responses
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Hapi moments (denormalized for performance)
ALTER TABLE hapi_moments
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Class members (denormalized for performance)
ALTER TABLE class_members
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Office hours (denormalized for performance)
ALTER TABLE office_hours
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Office hours queue (denormalized for performance)
ALTER TABLE office_hours_queue
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Error logs (direct - for filtering admin views)
ALTER TABLE error_logs
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE SET NULL;

-- Error affected users (denormalized for performance)
ALTER TABLE error_affected_users
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE SET NULL;

-- Admin audit logs (direct - for filtering admin views)
ALTER TABLE admin_audit_logs
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE CASCADE;

-- Canvas settings (inherit from user but denormalized)
ALTER TABLE canvas_settings
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE CASCADE;

-- Canvas sync history (inherit from user but denormalized)
ALTER TABLE canvas_sync_history
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE CASCADE;

-- Pulse questions (inherit from pulse_check_sets)
ALTER TABLE pulse_questions
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- Question options (inherit from pulse_questions)
ALTER TABLE question_options
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES universities(id) ON DELETE RESTRICT;

-- =====================================================
-- 3. CREATE PERFORMANCE-OPTIMIZED INDEXES
-- =====================================================
-- Strategic indexes for common query patterns
-- Focus on: filtering, joins, and RLS policy checks

-- Profiles: Primary filter for user queries
CREATE INDEX idx_profiles_university_id ON profiles(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_profiles_university_role ON profiles(university_id, role) WHERE university_id IS NOT NULL;
CREATE INDEX idx_profiles_university_email ON profiles(university_id, email) WHERE university_id IS NOT NULL;

-- Classes: Primary filter for class queries
CREATE INDEX idx_classes_university_id ON classes(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_classes_university_active ON classes(university_id, is_active) WHERE is_active = true;
CREATE INDEX idx_classes_university_teacher ON classes(university_id, teacher_id) WHERE university_id IS NOT NULL;

-- Pulse checks: Frequently queried by date and class
CREATE INDEX idx_pulse_checks_university_id ON pulse_checks(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_pulse_checks_university_date ON pulse_checks(university_id, check_date DESC);
CREATE INDEX idx_pulse_checks_university_user ON pulse_checks(university_id, user_id, check_date DESC);

-- Pulse check sets: Active pulses per university
CREATE INDEX idx_pulse_check_sets_university_id ON pulse_check_sets(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_pulse_check_sets_university_active ON pulse_check_sets(university_id, is_active, expires_at) WHERE is_active = true;

-- Pulse responses: Performance critical for student views
CREATE INDEX idx_pulse_responses_university_id ON pulse_responses(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_pulse_responses_university_user ON pulse_responses(university_id, user_id);

-- Question responses: Frequently joined
CREATE INDEX idx_question_responses_university_id ON question_responses(university_id) WHERE university_id IS NOT NULL;

-- Hapi moments: Filter by sender/recipient/class
CREATE INDEX idx_hapi_moments_university_id ON hapi_moments(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_hapi_moments_university_sender ON hapi_moments(university_id, sender_id);
CREATE INDEX idx_hapi_moments_university_recipient ON hapi_moments(university_id, recipient_id);

-- Class members: Critical for authorization checks
CREATE INDEX idx_class_members_university_id ON class_members(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_class_members_university_user ON class_members(university_id, user_id);
CREATE INDEX idx_class_members_university_class ON class_members(university_id, class_id);

-- Office hours: Filter by teacher and date
CREATE INDEX idx_office_hours_university_id ON office_hours(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_office_hours_university_teacher ON office_hours(university_id, teacher_id);

-- Office hours queue: Active queues
CREATE INDEX idx_office_hours_queue_university_id ON office_hours_queue(university_id) WHERE university_id IS NOT NULL;

-- Error logs: Admin error monitoring
CREATE INDEX idx_error_logs_university_id ON error_logs(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_error_logs_university_status ON error_logs(university_id, status, last_seen_at DESC);

-- Error affected users: Error impact tracking
CREATE INDEX idx_error_affected_users_university_id ON error_affected_users(university_id) WHERE university_id IS NOT NULL;

-- Admin audit logs: Compliance and security auditing
CREATE INDEX idx_admin_audit_logs_university_id ON admin_audit_logs(university_id) WHERE university_id IS NOT NULL;
CREATE INDEX idx_admin_audit_logs_university_action ON admin_audit_logs(university_id, action, created_at DESC);

-- Canvas settings: User settings lookup
CREATE INDEX idx_canvas_settings_university_id ON canvas_settings(university_id) WHERE university_id IS NOT NULL;

-- Canvas sync history: Sync monitoring
CREATE INDEX idx_canvas_sync_history_university_id ON canvas_sync_history(university_id) WHERE university_id IS NOT NULL;

-- Pulse questions: Inherit from pulse sets
CREATE INDEX idx_pulse_questions_university_id ON pulse_questions(university_id) WHERE university_id IS NOT NULL;

-- Question options: Inherit from questions
CREATE INDEX idx_question_options_university_id ON question_options(university_id) WHERE university_id IS NOT NULL;

-- =====================================================
-- 4. UPDATE HELPER FUNCTIONS
-- =====================================================

-- Drop existing is_admin function and recreate with university awareness
DROP FUNCTION IF EXISTS is_admin();

-- Check if user is admin (university-scoped)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is super admin (cross-university access)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get current user's university_id (cached for performance)
CREATE OR REPLACE FUNCTION current_user_university_id()
RETURNS UUID AS $$
  SELECT university_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to a specific university
CREATE OR REPLACE FUNCTION user_in_university(target_university_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND university_id = target_university_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- 5. DROP OLD RLS POLICIES
-- =====================================================
-- Remove all existing policies that don't account for universities
-- We'll recreate them with university awareness

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Classes policies
DROP POLICY IF EXISTS "Class members can view their classes" ON classes;
DROP POLICY IF EXISTS "Admins can view all classes" ON classes;
DROP POLICY IF EXISTS "Admins can create classes" ON classes;
DROP POLICY IF EXISTS "Admins can update classes" ON classes;
DROP POLICY IF EXISTS "Admins can delete classes" ON classes;

-- Class members policies
DROP POLICY IF EXISTS "Users can view their class memberships" ON class_members;
DROP POLICY IF EXISTS "Users can insert their class memberships" ON class_members;
DROP POLICY IF EXISTS "Class members can view other members in their classes" ON class_members;
DROP POLICY IF EXISTS "Admins can view all class members" ON class_members;
DROP POLICY IF EXISTS "Admins can enroll students" ON class_members;
DROP POLICY IF EXISTS "Admins can remove students" ON class_members;

-- Pulse checks policies
DROP POLICY IF EXISTS "Users can view own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS "Users can insert own pulse checks" ON pulse_checks;
DROP POLICY IF EXISTS "Admins can view all pulse checks" ON pulse_checks;

-- Hapi moments policies
DROP POLICY IF EXISTS "Users can view hapi moments they sent or received" ON hapi_moments;
DROP POLICY IF EXISTS "Users can insert hapi moments they send" ON hapi_moments;
DROP POLICY IF EXISTS "Admins can view all hapi moments" ON hapi_moments;

-- Pulse check sets policies (if any exist)
DROP POLICY IF EXISTS "Class members can view pulse sets" ON pulse_check_sets;
DROP POLICY IF EXISTS "Teachers can manage their pulse sets" ON pulse_check_sets;

-- Pulse responses policies (if any exist)
DROP POLICY IF EXISTS "Users can view own pulse responses" ON pulse_responses;
DROP POLICY IF EXISTS "Users can insert pulse responses" ON pulse_responses;

-- Admin audit logs policies
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Audit logs cannot be deleted" ON admin_audit_logs;

-- =====================================================
-- 6. CREATE UNIVERSITY-AWARE RLS POLICIES
-- =====================================================

-- ---------------------
-- UNIVERSITIES TABLE
-- ---------------------

-- Super admins can view all universities
CREATE POLICY "Super admins can view all universities"
  ON universities FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Admins can view their own university
CREATE POLICY "Admins can view own university"
  ON universities FOR SELECT
  TO authenticated
  USING (
    id = current_user_university_id()
    AND is_admin()
  );

-- Users can view their own university (basic info)
CREATE POLICY "Users can view own university"
  ON universities FOR SELECT
  TO authenticated
  USING (id = current_user_university_id());

-- Only super admins can create universities
CREATE POLICY "Super admins can create universities"
  ON universities FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

-- Super admins can update all universities
CREATE POLICY "Super admins can update universities"
  ON universities FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- Admins can update their own university settings
CREATE POLICY "Admins can update own university"
  ON universities FOR UPDATE
  TO authenticated
  USING (
    id = current_user_university_id()
    AND is_admin()
  )
  WITH CHECK (
    id = current_user_university_id()
    AND is_admin()
  );

-- ---------------------
-- PROFILES TABLE
-- ---------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can view profiles in their university (class members, etc.)
CREATE POLICY "Users can view university profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
  );

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND university_id = current_user_university_id() -- Prevent university reassignment
  );

-- Users can insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Admins can view all profiles in their university
CREATE POLICY "Admins can view university profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Admins can insert profiles in their university
CREATE POLICY "Admins can insert university profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Admins can update profiles in their university
CREATE POLICY "Admins can update university profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  )
  WITH CHECK (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Admins can delete profiles in their university (soft delete recommended)
CREATE POLICY "Admins can delete university profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- ---------------------
-- CLASSES TABLE
-- ---------------------

-- Class members can view their classes
CREATE POLICY "Class members can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = classes.id
      AND class_members.user_id = auth.uid()
    )
  );

-- Teachers can view classes they teach
CREATE POLICY "Teachers can view own classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  );

-- Admins can view all classes in their university
CREATE POLICY "Admins can view university classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Super admins can view all classes
CREATE POLICY "Super admins can view all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Teachers and admins can create classes in their university
CREATE POLICY "Teachers and admins can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND (
      (teacher_id = auth.uid()) -- Teachers create their own classes
      OR is_admin() -- Admins can create any class
    )
  );

-- Teachers can update their own classes
CREATE POLICY "Teachers can update own classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  );

-- Admins can update any class in their university
CREATE POLICY "Admins can update university classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  )
  WITH CHECK (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Admins can delete classes in their university
CREATE POLICY "Admins can delete university classes"
  ON classes FOR DELETE
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- ---------------------
-- CLASS_MEMBERS TABLE
-- ---------------------

-- Users can view their own class memberships
CREATE POLICY "Users can view own memberships"
  ON class_members FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Class members can view other members in their classes
CREATE POLICY "Class members can view classmates"
  ON class_members FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM class_members cm
      WHERE cm.class_id = class_members.class_id
      AND cm.user_id = auth.uid()
      AND cm.university_id = current_user_university_id()
    )
  );

-- Admins can view all memberships in their university
CREATE POLICY "Admins can view university memberships"
  ON class_members FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Super admins can view all memberships
CREATE POLICY "Super admins can view all memberships"
  ON class_members FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Users can join classes in their university
CREATE POLICY "Users can join university classes"
  ON class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Admins can enroll students in their university
CREATE POLICY "Admins can enroll students"
  ON class_members FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Users can leave their classes
CREATE POLICY "Users can leave classes"
  ON class_members FOR DELETE
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Admins can remove students from classes in their university
CREATE POLICY "Admins can remove students"
  ON class_members FOR DELETE
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- ---------------------
-- PULSE_CHECKS TABLE
-- ---------------------

-- Users can view their own pulse checks
CREATE POLICY "Users can view own pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Teachers can view pulse checks for their classes
CREATE POLICY "Teachers can view class pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = pulse_checks.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

-- Admins can view all pulse checks in their university
CREATE POLICY "Admins can view university pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Super admins can view all pulse checks
CREATE POLICY "Super admins can view all pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Users can insert their own pulse checks
CREATE POLICY "Users can insert own pulse checks"
  ON pulse_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- ---------------------
-- PULSE_CHECK_SETS TABLE
-- ---------------------

-- Class members can view pulse sets for their classes
CREATE POLICY "Class members can view pulse sets"
  ON pulse_check_sets FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = pulse_check_sets.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Teachers can manage pulse sets for their classes
CREATE POLICY "Teachers can manage own pulse sets"
  ON pulse_check_sets FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  );

-- Admins can view all pulse sets in their university
CREATE POLICY "Admins can view university pulse sets"
  ON pulse_check_sets FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- ---------------------
-- PULSE_RESPONSES TABLE
-- ---------------------

-- Users can view their own pulse responses
CREATE POLICY "Users can view own pulse responses"
  ON pulse_responses FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Teachers can view responses for their pulse sets
CREATE POLICY "Teachers can view pulse responses"
  ON pulse_responses FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_responses.pulse_set_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

-- Users can insert pulse responses
CREATE POLICY "Users can insert pulse responses"
  ON pulse_responses FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- ---------------------
-- QUESTION_RESPONSES TABLE
-- ---------------------

-- Users can view their own question responses
CREATE POLICY "Users can view own question responses"
  ON question_responses FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- Teachers can view question responses for their pulses
CREATE POLICY "Teachers can view question responses"
  ON question_responses FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_responses pr
      JOIN pulse_check_sets pcs ON pr.pulse_set_id = pcs.id
      WHERE pr.id = question_responses.pulse_response_id
      AND pcs.teacher_id = auth.uid()
    )
  );

-- Users can insert question responses
CREATE POLICY "Users can insert question responses"
  ON question_responses FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- ---------------------
-- HAPI_MOMENTS TABLE
-- ---------------------

-- Users can view hapi moments they sent or received
CREATE POLICY "Users can view own hapi moments"
  ON hapi_moments FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );

-- Class members can view hapi moments in their classes
CREATE POLICY "Class members can view class hapi moments"
  ON hapi_moments FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = hapi_moments.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Admins can view all hapi moments in their university
CREATE POLICY "Admins can view university hapi moments"
  ON hapi_moments FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Users can send hapi moments
CREATE POLICY "Users can send hapi moments"
  ON hapi_moments FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND sender_id = auth.uid()
  );

-- ---------------------
-- OFFICE_HOURS TABLE
-- ---------------------

-- Teachers can manage their office hours
CREATE POLICY "Teachers can manage own office hours"
  ON office_hours FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND teacher_id = auth.uid()
  );

-- Class members can view office hours for their classes
CREATE POLICY "Class members can view office hours"
  ON office_hours FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND (
      class_id IS NULL -- General office hours
      OR EXISTS (
        SELECT 1 FROM class_members
        WHERE class_members.class_id = office_hours.class_id
        AND class_members.user_id = auth.uid()
      )
    )
  );

-- Admins can view all office hours in their university
CREATE POLICY "Admins can view university office hours"
  ON office_hours FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- ---------------------
-- OFFICE_HOURS_QUEUE TABLE
-- ---------------------

-- Students can view their own queue entries
CREATE POLICY "Students can view own queue entries"
  ON office_hours_queue FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND student_id = auth.uid()
  );

-- Teachers can view queues for their office hours
CREATE POLICY "Teachers can view own office hour queues"
  ON office_hours_queue FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM office_hours
      WHERE office_hours.id = office_hours_queue.office_hour_id
      AND office_hours.teacher_id = auth.uid()
    )
  );

-- Students can join queues
CREATE POLICY "Students can join queues"
  ON office_hours_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND student_id = auth.uid()
  );

-- Students can update/cancel their own queue entries
CREATE POLICY "Students can update own queue entries"
  ON office_hours_queue FOR UPDATE
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND student_id = auth.uid()
  );

-- Teachers can update queue entries for their office hours
CREATE POLICY "Teachers can update office hour queues"
  ON office_hours_queue FOR UPDATE
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM office_hours
      WHERE office_hours.id = office_hours_queue.office_hour_id
      AND office_hours.teacher_id = auth.uid()
    )
  );

-- ---------------------
-- PULSE_QUESTIONS TABLE
-- ---------------------

-- Inherit policies from pulse_check_sets (students view, teachers manage)
CREATE POLICY "Class members can view pulse questions"
  ON pulse_questions FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_check_sets pcs
      JOIN class_members cm ON cm.class_id = pcs.class_id
      WHERE pcs.id = pulse_questions.pulse_set_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage pulse questions"
  ON pulse_questions FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_questions.pulse_set_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_questions.pulse_set_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

-- ---------------------
-- QUESTION_OPTIONS TABLE
-- ---------------------

-- Inherit policies from pulse_questions
CREATE POLICY "Class members can view question options"
  ON question_options FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_questions pq
      JOIN pulse_check_sets pcs ON pcs.id = pq.pulse_set_id
      JOIN class_members cm ON cm.class_id = pcs.class_id
      WHERE pq.id = question_options.question_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage question options"
  ON question_options FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_questions pq
      JOIN pulse_check_sets pcs ON pcs.id = pq.pulse_set_id
      WHERE pq.id = question_options.question_id
      AND pcs.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND EXISTS (
      SELECT 1 FROM pulse_questions pq
      JOIN pulse_check_sets pcs ON pcs.id = pq.pulse_set_id
      WHERE pq.id = question_options.question_id
      AND pcs.teacher_id = auth.uid()
    )
  );

-- ---------------------
-- ERROR_LOGS TABLE
-- ---------------------

-- Admins can view error logs for their university
CREATE POLICY "Admins can view university error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND (
      university_id = current_user_university_id()
      OR university_id IS NULL -- Allow viewing errors without university context
    )
  );

-- Super admins can view all error logs
CREATE POLICY "Super admins can view all error logs"
  ON error_logs FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Admins can update error logs in their university
CREATE POLICY "Admins can update university error logs"
  ON error_logs FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    AND (
      university_id = current_user_university_id()
      OR university_id IS NULL
    )
  );

-- System can insert error logs (from error handler)
CREATE POLICY "Authenticated users can insert error logs"
  ON error_logs FOR INSERT
  TO authenticated
  WITH CHECK (true); -- University context added by error handler

-- ---------------------
-- ERROR_AFFECTED_USERS TABLE
-- ---------------------

-- Admins can view affected users for their university
CREATE POLICY "Admins can view university affected users"
  ON error_affected_users FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND (
      university_id = current_user_university_id()
      OR university_id IS NULL
    )
  );

-- Super admins can view all affected users
CREATE POLICY "Super admins can view all affected users"
  ON error_affected_users FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- System can insert affected users
CREATE POLICY "Authenticated users can insert affected users"
  ON error_affected_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ---------------------
-- ADMIN_AUDIT_LOGS TABLE
-- ---------------------

-- Admins can view audit logs for their university
CREATE POLICY "Admins can view university audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Super admins can view all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON admin_audit_logs FOR SELECT
  TO authenticated
  USING (is_super_admin());

-- Admins can insert audit logs for their university
CREATE POLICY "Admins can insert university audit logs"
  ON admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    AND university_id = current_user_university_id()
  );

-- Audit logs are immutable
CREATE POLICY "Audit logs cannot be deleted"
  ON admin_audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- ---------------------
-- CANVAS SETTINGS TABLE
-- ---------------------

-- Users can manage their own Canvas settings
CREATE POLICY "Users can manage own canvas settings"
  ON canvas_settings FOR ALL
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  )
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- ---------------------
-- CANVAS_SYNC_HISTORY TABLE
-- ---------------------

-- Users can view their own sync history
CREATE POLICY "Users can view own sync history"
  ON canvas_sync_history FOR SELECT
  TO authenticated
  USING (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- System can insert sync history
CREATE POLICY "Users can insert sync history"
  ON canvas_sync_history FOR INSERT
  TO authenticated
  WITH CHECK (
    university_id = current_user_university_id()
    AND user_id = auth.uid()
  );

-- =====================================================
-- 7. UPDATE AUDIT LOG FUNCTION
-- =====================================================

-- Drop and recreate log_admin_action with university awareness
DROP FUNCTION IF EXISTS log_admin_action(TEXT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_university_id UUID;
BEGIN
  -- Only log if user is admin
  IF NOT is_admin() AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only admins can log actions';
  END IF;

  -- Get user's university_id
  SELECT university_id INTO v_university_id
  FROM profiles
  WHERE id = auth.uid();

  INSERT INTO admin_audit_logs (
    user_id,
    university_id,
    action,
    target_type,
    target_id,
    details
  )
  VALUES (
    auth.uid(),
    v_university_id,
    p_action,
    p_target_type,
    p_target_id,
    p_details
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. CREATE TRIGGERS FOR AUTOMATIC UNIVERSITY_ID PROPAGATION
-- =====================================================
-- Automatically populate university_id on related tables
-- This ensures data consistency and reduces application-level bugs

-- Trigger function to copy university_id from user profile
CREATE OR REPLACE FUNCTION copy_university_from_user()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM profiles
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to copy university_id from class
CREATE OR REPLACE FUNCTION copy_university_from_class()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM classes
  WHERE id = NEW.class_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to copy university_id from pulse_check_set
CREATE OR REPLACE FUNCTION copy_university_from_pulse_set()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM pulse_check_sets
  WHERE id = NEW.pulse_set_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to copy university_id from pulse_question
CREATE OR REPLACE FUNCTION copy_university_from_question()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM pulse_questions
  WHERE id = NEW.question_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to copy university_id from office_hours
CREATE OR REPLACE FUNCTION copy_university_from_office_hours()
RETURNS TRIGGER AS $$
BEGIN
  SELECT university_id INTO NEW.university_id
  FROM office_hours
  WHERE id = NEW.office_hour_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_pulse_check_university
  BEFORE INSERT ON pulse_checks
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_class_member_university
  BEFORE INSERT ON class_members
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_class();

CREATE TRIGGER set_pulse_check_set_university
  BEFORE INSERT ON pulse_check_sets
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_class();

CREATE TRIGGER set_pulse_response_university
  BEFORE INSERT ON pulse_responses
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_question_response_university
  BEFORE INSERT ON question_responses
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_hapi_moment_university
  BEFORE INSERT ON hapi_moments
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_office_hours_university
  BEFORE INSERT ON office_hours
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_office_hours_queue_university
  BEFORE INSERT ON office_hours_queue
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_office_hours();

CREATE TRIGGER set_pulse_question_university
  BEFORE INSERT ON pulse_questions
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_pulse_set();

CREATE TRIGGER set_question_option_university
  BEFORE INSERT ON question_options
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_question();

CREATE TRIGGER set_canvas_settings_university
  BEFORE INSERT ON canvas_settings
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

CREATE TRIGGER set_canvas_sync_history_university
  BEFORE INSERT ON canvas_sync_history
  FOR EACH ROW
  WHEN (NEW.university_id IS NULL)
  EXECUTE FUNCTION copy_university_from_user();

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_university_id() TO authenticated;
GRANT EXECUTE ON FUNCTION user_in_university(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, TEXT, UUID, JSONB) TO authenticated;

-- =====================================================
-- 10. DATA MIGRATION
-- =====================================================
-- Create default university and assign existing data
-- This section should be customized based on your data

-- Create a default university for existing data
INSERT INTO universities (id, name, domain, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001'::UUID,
  'Default University',
  'default.edu',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Assign all existing profiles to default university
UPDATE profiles
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing classes to default university
UPDATE classes
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing pulse checks to default university
UPDATE pulse_checks
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing pulse check sets to default university
UPDATE pulse_check_sets
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing pulse responses to default university
UPDATE pulse_responses
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing question responses to default university
UPDATE question_responses
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing hapi moments to default university
UPDATE hapi_moments
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing class members to default university
UPDATE class_members
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing office hours to default university
UPDATE office_hours
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing office hours queue to default university
UPDATE office_hours_queue
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing pulse questions to default university
UPDATE pulse_questions
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing question options to default university
UPDATE question_options
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing error logs to default university (where user exists)
UPDATE error_logs
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL
AND user_id IS NOT NULL;

-- Assign all existing error affected users to default university
UPDATE error_affected_users
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing admin audit logs to default university
UPDATE admin_audit_logs
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing canvas settings to default university
UPDATE canvas_settings
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- Assign all existing canvas sync history to default university
UPDATE canvas_sync_history
SET university_id = '00000000-0000-0000-0000-000000000001'::UUID
WHERE university_id IS NULL;

-- =====================================================
-- 11. ADD NOT NULL CONSTRAINTS
-- =====================================================
-- After data migration, enforce NOT NULL on university_id

-- Core tables that must have university_id
ALTER TABLE profiles ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE pulse_checks ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE pulse_check_sets ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE pulse_responses ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE question_responses ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE hapi_moments ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE class_members ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE office_hours ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE office_hours_queue ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE pulse_questions ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE question_options ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE canvas_settings ALTER COLUMN university_id SET NOT NULL;
ALTER TABLE canvas_sync_history ALTER COLUMN university_id SET NOT NULL;

-- Note: error_logs, error_affected_users, and admin_audit_logs
-- keep university_id nullable for system-level errors

-- =====================================================
-- 12. ADD NEW ROLE TYPE
-- =====================================================
-- Add super_admin role to user_role enum

-- Check if user_role type exists and add super_admin if needed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin', 'super_admin');
  ELSIF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin') THEN
    ALTER TYPE user_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- This migration adds:
-- 1. Universities table with domain-based assignment
-- 2. university_id foreign keys on all relevant tables
-- 3. Performance-optimized indexes for common query patterns
-- 4. Complete RLS policy overhaul for multi-tenancy
-- 5. Helper functions for university context
-- 6. Automatic university_id propagation via triggers
-- 7. Data migration for existing records
-- 8. NOT NULL constraints after backfill
-- 9. Support for super_admin role
-- 10. University-aware audit logging
-- =====================================================
