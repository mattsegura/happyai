/*
  # Enroll Current User in All Three Classes

  ## Summary
  Enrolls the current user (nico) in all three classes so they can view the classes
  and leaderboards in the application.

  ## Changes Made
  - Enrolls user in Biology 1 with moderate class points (180)
  - Enrolls user in English 5 with moderate class points (165)
  - Enrolls user in Economics 3 with moderate class points (190)
  - Updates user profile with reasonable total points and streak

  ## Notes
  This gives the user mid-range rankings in each class:
  - Biology 1: Will rank around 7th-8th place
  - English 5: Will rank around 8th-9th place
  - Economics 3: Will rank around 8th place
*/

DO $$
DECLARE
  v_user_id uuid := '40aba9c7-4a5c-4e69-af91-7fe7dadcf7fc';
  biology_class_id uuid;
  english_class_id uuid;
  economics_class_id uuid;
BEGIN

  -- Get the class IDs
  SELECT id INTO biology_class_id FROM classes WHERE class_code = 'BIO1-2025';
  SELECT id INTO english_class_id FROM classes WHERE class_code = 'ENG5-2025';
  SELECT id INTO economics_class_id FROM classes WHERE class_code = 'ECON3-2025';

  -- Update user profile with reasonable stats
  UPDATE profiles
  SET 
    total_points = 535,
    current_streak = 8,
    last_pulse_check_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = v_user_id;

  -- Enroll user in Biology 1
  INSERT INTO class_members (user_id, class_id, class_points, joined_at)
  VALUES 
    (v_user_id, biology_class_id, 180, now() - interval '80 days')
  ON CONFLICT (user_id, class_id) DO UPDATE 
  SET class_points = 180;

  -- Enroll user in English 5
  INSERT INTO class_members (user_id, class_id, class_points, joined_at)
  VALUES 
    (v_user_id, english_class_id, 165, now() - interval '80 days')
  ON CONFLICT (user_id, class_id) DO UPDATE 
  SET class_points = 165;

  -- Enroll user in Economics 3
  INSERT INTO class_members (user_id, class_id, class_points, joined_at)
  VALUES 
    (v_user_id, economics_class_id, 190, now() - interval '80 days')
  ON CONFLICT (user_id, class_id) DO UPDATE 
  SET class_points = 190;

END $$;
