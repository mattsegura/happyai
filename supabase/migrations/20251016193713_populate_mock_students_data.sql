/*
  # Populate Mock Students and Class Memberships

  ## Summary
  Adds 10 mock students with realistic data and enrolls them in the 3 classes
  with varied class points to create realistic leaderboard rankings.
*/

DO $$
DECLARE
  biology_class_id uuid;
  economics_class_id uuid;
  english_class_id uuid;
BEGIN

  -- Get class IDs
  SELECT id INTO biology_class_id FROM classes WHERE class_code = 'BIO2-2024' LIMIT 1;
  SELECT id INTO economics_class_id FROM classes WHERE class_code = 'ECON1-2024' LIMIT 1;
  SELECT id INTO english_class_id FROM classes WHERE class_code = 'ENG5-2024' LIMIT 1;

  -- Create 10 mock students
  INSERT INTO mock_students (full_name, email, total_points, current_streak, achievements_count, hapi_moments_sent, pulse_responses_completed, created_at)
  VALUES 
    ('Emma Wilson', 'emma.wilson@school.edu', 850, 12, 8, 15, 42, now() - interval '45 days'),
    ('Liam Chen', 'liam.chen@school.edu', 720, 8, 6, 12, 38, now() - interval '38 days'),
    ('Sophia Martinez', 'sophia.martinez@school.edu', 680, 10, 7, 14, 35, now() - interval '52 days'),
    ('Noah Patel', 'noah.patel@school.edu', 590, 5, 5, 10, 28, now() - interval '30 days'),
    ('Olivia Kim', 'olivia.kim@school.edu', 520, 6, 4, 8, 25, now() - interval '28 days'),
    ('Ethan Brown', 'ethan.brown@school.edu', 480, 4, 4, 7, 22, now() - interval '35 days'),
    ('Ava Garcia', 'ava.garcia@school.edu', 450, 9, 5, 11, 20, now() - interval '41 days'),
    ('Mason Lee', 'mason.lee@school.edu', 380, 3, 3, 6, 18, now() - interval '25 days'),
    ('Isabella White', 'isabella.white@school.edu', 290, 2, 2, 4, 12, now() - interval '20 days'),
    ('James Taylor', 'james.taylor@school.edu', 250, 1, 1, 3, 10, now() - interval '15 days')
  ON CONFLICT (email) DO NOTHING;

  -- Enroll mock students in Biology 2 (Alex ranks 4th with 180 points)
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  SELECT id, biology_class_id, class_points, joined_at
  FROM (VALUES
    ((SELECT id FROM mock_students WHERE email = 'emma.wilson@school.edu'), 290, now() - interval '50 days'),
    ((SELECT id FROM mock_students WHERE email = 'liam.chen@school.edu'), 250, now() - interval '48 days'),
    ((SELECT id FROM mock_students WHERE email = 'sophia.martinez@school.edu'), 230, now() - interval '45 days'),
    ((SELECT id FROM mock_students WHERE email = 'noah.patel@school.edu'), 140, now() - interval '42 days'),
    ((SELECT id FROM mock_students WHERE email = 'olivia.kim@school.edu'), 120, now() - interval '40 days'),
    ((SELECT id FROM mock_students WHERE email = 'ethan.brown@school.edu'), 100, now() - interval '38 days'),
    ((SELECT id FROM mock_students WHERE email = 'ava.garcia@school.edu'), 90, now() - interval '35 days'),
    ((SELECT id FROM mock_students WHERE email = 'mason.lee@school.edu'), 75, now() - interval '30 days'),
    ((SELECT id FROM mock_students WHERE email = 'isabella.white@school.edu'), 60, now() - interval '25 days'),
    ((SELECT id FROM mock_students WHERE email = 'james.taylor@school.edu'), 45, now() - interval '20 days')
  ) AS t(id, class_points, joined_at)
  ON CONFLICT (mock_student_id, class_id) DO NOTHING;

  -- Enroll mock students in Economics 1 (Alex ranks 5th with 220 points)
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  SELECT id, economics_class_id, class_points, joined_at
  FROM (VALUES
    ((SELECT id FROM mock_students WHERE email = 'liam.chen@school.edu'), 310, now() - interval '50 days'),
    ((SELECT id FROM mock_students WHERE email = 'emma.wilson@school.edu'), 280, now() - interval '48 days'),
    ((SELECT id FROM mock_students WHERE email = 'noah.patel@school.edu'), 240, now() - interval '45 days'),
    ((SELECT id FROM mock_students WHERE email = 'olivia.kim@school.edu'), 230, now() - interval '42 days'),
    ((SELECT id FROM mock_students WHERE email = 'sophia.martinez@school.edu'), 190, now() - interval '40 days'),
    ((SELECT id FROM mock_students WHERE email = 'ava.garcia@school.edu'), 150, now() - interval '38 days'),
    ((SELECT id FROM mock_students WHERE email = 'ethan.brown@school.edu'), 130, now() - interval '35 days'),
    ((SELECT id FROM mock_students WHERE email = 'mason.lee@school.edu'), 110, now() - interval '30 days'),
    ((SELECT id FROM mock_students WHERE email = 'isabella.white@school.edu'), 85, now() - interval '25 days'),
    ((SELECT id FROM mock_students WHERE email = 'james.taylor@school.edu'), 70, now() - interval '20 days')
  ) AS t(id, class_points, joined_at)
  ON CONFLICT (mock_student_id, class_id) DO NOTHING;

  -- Enroll mock students in English 5 (Alex ranks 6th with 160 points)
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  SELECT id, english_class_id, class_points, joined_at
  FROM (VALUES
    ((SELECT id FROM mock_students WHERE email = 'emma.wilson@school.edu'), 320, now() - interval '50 days'),
    ((SELECT id FROM mock_students WHERE email = 'sophia.martinez@school.edu'), 270, now() - interval '48 days'),
    ((SELECT id FROM mock_students WHERE email = 'liam.chen@school.edu'), 240, now() - interval '45 days'),
    ((SELECT id FROM mock_students WHERE email = 'olivia.kim@school.edu'), 210, now() - interval '42 days'),
    ((SELECT id FROM mock_students WHERE email = 'noah.patel@school.edu'), 180, now() - interval '40 days'),
    ((SELECT id FROM mock_students WHERE email = 'ava.garcia@school.edu'), 155, now() - interval '38 days'),
    ((SELECT id FROM mock_students WHERE email = 'ethan.brown@school.edu'), 140, now() - interval '35 days'),
    ((SELECT id FROM mock_students WHERE email = 'mason.lee@school.edu'), 95, now() - interval '30 days'),
    ((SELECT id FROM mock_students WHERE email = 'james.taylor@school.edu'), 80, now() - interval '25 days'),
    ((SELECT id FROM mock_students WHERE email = 'isabella.white@school.edu'), 65, now() - interval '20 days')
  ) AS t(id, class_points, joined_at)
  ON CONFLICT (mock_student_id, class_id) DO NOTHING;

END $$;