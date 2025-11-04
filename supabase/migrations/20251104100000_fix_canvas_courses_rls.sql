-- =====================================================
-- FIX CRITICAL SECURITY VULNERABILITY: canvas_courses RLS
-- =====================================================
-- ISSUE: canvas_courses table has RLS DISABLED, allowing any user
--        to see ALL courses from ALL other users!
--
-- This migration:
-- 1. Enables RLS on canvas_courses
-- 2. Adds proper security policies for users and admins
-- 3. Ensures data isolation between users
-- =====================================================

-- =====================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE canvas_courses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE RLS POLICIES FOR canvas_courses
-- =====================================================

-- Policy: Users can view their own courses
CREATE POLICY "Users can view their own canvas courses"
  ON canvas_courses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own courses
CREATE POLICY "Users can insert their own canvas courses"
  ON canvas_courses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own courses
CREATE POLICY "Users can update their own canvas courses"
  ON canvas_courses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own courses
CREATE POLICY "Users can delete their own canvas courses"
  ON canvas_courses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view courses in their university
CREATE POLICY "Admins can view university canvas courses"
  ON canvas_courses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
        AND (
          profiles.role = 'super_admin'
          OR profiles.university_id = canvas_courses.university_id
        )
    )
  );

-- =====================================================
-- 3. VERIFICATION
-- =====================================================

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE '✅ CRITICAL SECURITY FIX APPLIED';
  RAISE NOTICE 'Table: canvas_courses';
  RAISE NOTICE 'RLS: ENABLED';
  RAISE NOTICE 'Policies: 5 policies created';
  RAISE NOTICE '  - Users can view/insert/update/delete own courses';
  RAISE NOTICE '  - Admins can view university courses';
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
