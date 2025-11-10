-- Demo Accounts Setup for HapiAI
-- This script sets up the demo user accounts in your Supabase database
--
-- IMPORTANT: You cannot create auth users directly via SQL for security reasons.
-- You must create the users through the Supabase Dashboard or Auth API first.
-- This script will update their profiles with the correct roles after creation.
--
-- Steps to use this script:
-- 1. Create the users in Supabase Dashboard -> Authentication -> Users
-- 2. Run this script in Supabase SQL Editor to set up their profiles
--
-- Demo Users to Create in Dashboard:
-- - student@demo.com (password: demo123)
-- - teacher@demo.com (password: demo123)
-- - admin@demo.com (password: demo123)

-- First, let's find the user IDs (run this after creating users in dashboard)
-- SELECT id, email FROM auth.users WHERE email IN ('student@demo.com', 'teacher@demo.com', 'admin@demo.com');

-- Update profile roles for demo accounts
-- Replace the UUIDs below with the actual IDs from the query above

-- Update student@demo.com profile
UPDATE profiles
SET role = 'student',
    full_name = 'Demo Student',
    updated_at = NOW()
WHERE email = 'student@demo.com';

-- Update teacher@demo.com profile
UPDATE profiles
SET role = 'teacher',
    full_name = 'Demo Teacher',
    updated_at = NOW()
WHERE email = 'teacher@demo.com';

-- Update admin@demo.com profile
UPDATE profiles
SET role = 'admin',
    full_name = 'Demo Admin',
    updated_at = NOW()
WHERE email = 'admin@demo.com';

-- Verify the updates
SELECT id, email, full_name, role
FROM profiles
WHERE email IN ('student@demo.com', 'teacher@demo.com', 'admin@demo.com')
ORDER BY role;
