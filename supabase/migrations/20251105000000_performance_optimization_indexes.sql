-- =====================================================
-- MIGRATION: Performance Optimization with Indexes
-- Date: 2025-11-05
-- Purpose: Add missing indexes for frequently queried columns
--          to improve query performance and prevent full table scans
-- =====================================================

-- =====================================================
-- Canvas-related Tables Indexes
-- =====================================================

-- Canvas Courses: Index for user_id (most common query)
CREATE INDEX IF NOT EXISTS idx_canvas_courses_user_id
ON canvas_courses(user_id);

-- Canvas Courses: Index for university_id and enrollment_state (filtering)
CREATE INDEX IF NOT EXISTS idx_canvas_courses_university_enrollment
ON canvas_courses(university_id, enrollment_state);

-- Canvas Assignments: Composite index for user_id and due_at (upcoming assignments query)
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_user_due
ON canvas_assignments(user_id, due_at DESC);

-- Canvas Assignments: Index for course_id (joining with courses)
CREATE INDEX IF NOT EXISTS idx_canvas_assignments_course_id
ON canvas_assignments(course_id);

-- Canvas Submissions: Composite index for user_id and workflow_state
CREATE INDEX IF NOT EXISTS idx_canvas_submissions_user_workflow
ON canvas_submissions(user_id, workflow_state);

-- Canvas Submissions: Index for assignment_id (joining)
CREATE INDEX IF NOT EXISTS idx_canvas_submissions_assignment_id
ON canvas_submissions(assignment_id);

-- Canvas Grades: Composite index for user_id and enrollment_state
CREATE INDEX IF NOT EXISTS idx_canvas_grades_user_enrollment
ON canvas_grades(user_id, enrollment_state);

-- =====================================================
-- Profile and Authentication Tables
-- =====================================================

-- Profiles: Index for email (used for lookups)
CREATE INDEX IF NOT EXISTS idx_profiles_email
ON profiles(email);

-- Profiles: Index for university_id (filtering by university)
CREATE INDEX IF NOT EXISTS idx_profiles_university_id
ON profiles(university_id);

-- Profiles: Index for role (filtering by user type)
CREATE INDEX IF NOT EXISTS idx_profiles_role
ON profiles(role);

-- =====================================================
-- Study and Academic Progress Tables
-- =====================================================

-- Study Streaks: Index for user_id
CREATE INDEX IF NOT EXISTS idx_study_streaks_user_id
ON study_streaks(user_id);

-- Assignment Impact History: Composite index for user and course
CREATE INDEX IF NOT EXISTS idx_assignment_impact_user_course
ON assignment_impact_history(user_id, course_id, calculation_date DESC);

-- =====================================================
-- Class and Pulse Tables
-- =====================================================

-- Class Members: Composite index for user_id and class_id
CREATE INDEX IF NOT EXISTS idx_class_members_user_class
ON class_members(user_id, class_id);

-- Pulse Checks: Composite index for user_id and created_at
CREATE INDEX IF NOT EXISTS idx_pulse_checks_user_created
ON pulse_checks(user_id, created_at DESC);

-- Class Pulses: Composite index for class_id and expires_at
CREATE INDEX IF NOT EXISTS idx_class_pulses_class_expires
ON class_pulses(class_id, expires_at);

-- Class Pulse Responses: Composite index for user_id and pulse_id
CREATE INDEX IF NOT EXISTS idx_class_pulse_responses_user_pulse
ON class_pulse_responses(user_id, pulse_id);

-- =====================================================
-- Hapi Moments Tables
-- =====================================================

-- Hapi Moments: Composite index for receiver_id and created_at
CREATE INDEX IF NOT EXISTS idx_hapi_moments_receiver_created
ON hapi_moments(receiver_id, created_at DESC);

-- Hapi Moments: Index for sender_id
CREATE INDEX IF NOT EXISTS idx_hapi_moments_sender_id
ON hapi_moments(sender_id);

-- =====================================================
-- Notification Tables
-- =====================================================

-- Notifications: Composite index for user_id, read status, and created_at
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications(user_id, is_read, created_at DESC);

-- Notification Preferences: Index for user_id
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
ON notification_preferences(user_id);

-- =====================================================
-- Achievement and Gamification Tables
-- =====================================================

-- User Achievements: Composite index for user_id and earned_at
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned
ON user_achievements(user_id, earned_at DESC);

-- Academic Leaderboard: Composite index for class_id and rank
CREATE INDEX IF NOT EXISTS idx_academic_leaderboard_class_rank
ON academic_leaderboard(class_id, rank ASC);

-- =====================================================
-- Payment Tables
-- =====================================================

-- Subscriptions: Index for user_id and status
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
ON subscriptions(user_id, status);

-- Subscriptions: Index for stripe_customer_id (Stripe webhook lookups)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
ON subscriptions(stripe_customer_id);

-- Invoices: Index for user_id and status
CREATE INDEX IF NOT EXISTS idx_invoices_user_status
ON invoices(user_id, status);

-- =====================================================
-- Optimize RLS Policies for Better Performance
-- =====================================================

-- Ensure RLS policies use indexed columns for better performance
-- Note: RLS policies should filter on indexed columns whenever possible

-- Example: Check if canvas_courses RLS policy uses user_id
-- SELECT * FROM canvas_courses WHERE user_id = auth.uid()
-- This will use idx_canvas_courses_user_id index

-- =====================================================
-- Database Statistics Update
-- =====================================================

-- Analyze tables to update statistics for query planner
ANALYZE canvas_courses;
ANALYZE canvas_assignments;
ANALYZE canvas_submissions;
ANALYZE canvas_grades;
ANALYZE profiles;
ANALYZE class_members;
ANALYZE pulse_checks;
ANALYZE class_pulses;
ANALYZE notifications;
ANALYZE subscriptions;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON INDEX idx_canvas_courses_user_id IS 'Performance: Speeds up queries filtering courses by user_id';
COMMENT ON INDEX idx_canvas_assignments_user_due IS 'Performance: Optimizes upcoming assignments queries';
COMMENT ON INDEX idx_canvas_submissions_user_workflow IS 'Performance: Speeds up submission status queries';
COMMENT ON INDEX idx_pulse_checks_user_created IS 'Performance: Optimizes pulse check history queries';
COMMENT ON INDEX idx_notifications_user_read_created IS 'Performance: Speeds up unread notifications queries';

-- =====================================================
-- Verify Indexes
-- =====================================================

-- To verify indexes are being used, run EXPLAIN ANALYZE on queries
-- Example:
-- EXPLAIN ANALYZE
-- SELECT * FROM canvas_courses WHERE user_id = 'xxx';

-- Expected output should show "Index Scan" instead of "Seq Scan"
