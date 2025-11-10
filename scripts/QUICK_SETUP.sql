-- =====================================================
-- QUICK SETUP FOR NEW SUPABASE PROJECT
-- =====================================================
-- Run this in Supabase SQL Editor after creating the project
-- Dashboard: https://supabase.com/dashboard/project/lyeyndkhphtywkhwjfup/sql

-- 1. Add role column to profiles table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';
    CREATE INDEX idx_profiles_role ON profiles(role);
  END IF;
END $$;

-- 2. Update demo account roles
UPDATE profiles SET role = 'student', full_name = 'Demo Student', updated_at = NOW()
WHERE id = 'f9d39072-58ab-4d19-b8b0-e089ff00ab2e';

UPDATE profiles SET role = 'teacher', full_name = 'Demo Teacher', updated_at = NOW()
WHERE id = '0d031159-3e7c-4775-a7b5-b970ec118ffc';

UPDATE profiles SET role = 'admin', full_name = 'Demo Admin', updated_at = NOW()
WHERE id = 'ea55592c-eb47-4de9-a8d1-74184a4ffd6f';

-- 3. Verify the changes
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE email IN ('student@demo.com', 'teacher@demo.com', 'admin@demo.com')
ORDER BY role;
