-- Migration: Auto-assign university on user signup based on email domain
-- This fixes the signup error by automatically assigning users to universities

-- Step 1: Create a default "General" university for users without matching domains
INSERT INTO universities (id, name, domain, is_active, settings)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'General',
  NULL,
  true,
  '{}'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;

-- Step 2: Create function to get university by email domain
CREATE OR REPLACE FUNCTION get_university_id_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_domain TEXT;
  v_university_id UUID;
BEGIN
  -- Extract domain from email
  v_domain := LOWER(SPLIT_PART(user_email, '@', 2));

  -- Try to find matching university by domain
  SELECT id INTO v_university_id
  FROM universities
  WHERE LOWER(domain) = v_domain
    AND is_active = true
  LIMIT 1;

  -- If no match found, return the default "General" university
  IF v_university_id IS NULL THEN
    v_university_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;

  RETURN v_university_id;
END;
$$;

-- Step 3: Create trigger function to auto-assign university on profile insert
CREATE OR REPLACE FUNCTION auto_assign_university_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_email TEXT;
  v_university_id UUID;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = NEW.id;

  -- If university_id is not set, auto-assign based on email domain
  IF NEW.university_id IS NULL AND v_user_email IS NOT NULL THEN
    v_university_id := get_university_id_by_email(v_user_email);
    NEW.university_id := v_university_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Step 4: Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_assign_university ON profiles;

CREATE TRIGGER trigger_auto_assign_university
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_university_on_signup();

-- Step 5: Update existing profiles without university_id (assign to General)
UPDATE profiles
SET university_id = '00000000-0000-0000-0000-000000000000'::UUID
WHERE university_id IS NULL;

-- Step 6: Ensure the default university (from migration) is still accessible
UPDATE universities
SET is_active = true
WHERE id = '00000000-0000-0000-0000-000000000001';

COMMENT ON FUNCTION get_university_id_by_email(TEXT) IS
'Returns university ID based on email domain. Returns General university (00000000-0000-0000-0000-000000000000) if no match found.';

COMMENT ON FUNCTION auto_assign_university_on_signup() IS
'Trigger function that automatically assigns university_id to new profiles based on their email domain.';
