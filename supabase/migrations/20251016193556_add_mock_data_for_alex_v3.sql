/*
  # Populate Mock Data for Alex Johnson - Version 3

  ## Summary
  This migration creates comprehensive mock data for testing and visualization.
  Creates 3 classes, enrolls Alex, adds class pulses, sentiment data, and achievements.

  ## Mock Data Created

  1. **Classes** (3 total)
     - Biology 2: Science class with Mr. Harrison
     - Economics 1: Economics fundamentals with Ms. Rodriguez
     - English 5: Advanced literature with Dr. Thompson

  2. **Alex Johnson Enrollment**
     - Enrolled in all 3 classes with varied points

  3. **Class Pulses** (3 total - one per class)
     - Biology 2: Scale question about upcoming test
     - Economics 1: Text response about project format
     - English 5: Yes/No question about presentations

  4. **Sentiment Tracking**
     - Historical sentiment data for each class
     - Individual pulse checks for Alex
     - Aggregated class mood trends

  5. **Supporting Data**
     - Achievements for Alex
     - Pulse check history
*/

DO $$
DECLARE
  alex_user_id uuid := '2ac0a9b6-6222-4e94-bb41-72129f0f41c6';
  biology_class_id uuid;
  economics_class_id uuid;
  english_class_id uuid;
BEGIN

  -- Update Alex Johnson's profile
  UPDATE profiles
  SET 
    total_points = 420,
    current_streak = 7,
    last_pulse_check_date = CURRENT_DATE,
    updated_at = now()
  WHERE id = alex_user_id;

  -- Create the three classes
  INSERT INTO classes (id, name, description, teacher_name, teacher_id, class_code, created_at, updated_at)
  VALUES 
    (gen_random_uuid(), 'Biology 2', 'Advanced cellular biology and genetics', 'Mr. Harrison', alex_user_id, 'BIO2-2024', now() - interval '60 days', now()),
    (gen_random_uuid(), 'Economics 1', 'Fundamentals of micro and macroeconomics', 'Ms. Rodriguez', alex_user_id, 'ECON1-2024', now() - interval '60 days', now()),
    (gen_random_uuid(), 'English 5', 'Advanced literature and composition', 'Dr. Thompson', alex_user_id, 'ENG5-2024', now() - interval '60 days', now())
  ON CONFLICT (class_code) DO NOTHING;

  -- Get the class IDs
  SELECT id INTO biology_class_id FROM classes WHERE class_code = 'BIO2-2024';
  SELECT id INTO economics_class_id FROM classes WHERE class_code = 'ECON1-2024';
  SELECT id INTO english_class_id FROM classes WHERE class_code = 'ENG5-2024';

  -- Enroll Alex Johnson in all three classes
  INSERT INTO class_members (user_id, class_id, class_points, joined_at)
  VALUES 
    (alex_user_id, biology_class_id, 180, now() - interval '55 days'),
    (alex_user_id, economics_class_id, 220, now() - interval '55 days'),
    (alex_user_id, english_class_id, 160, now() - interval '55 days')
  ON CONFLICT (user_id, class_id) DO UPDATE SET class_points = EXCLUDED.class_points;

  -- Create class pulses for each class
  INSERT INTO class_pulses (id, class_id, teacher_id, question, question_type, answer_choices, expires_at, is_active, created_at)
  VALUES 
    (gen_random_uuid(), biology_class_id, alex_user_id, 'On a scale of 1-10, how are you feeling about the upcoming test on monday?', 'scale', '["1","2","3","4","5","6","7","8","9","10"]'::jsonb, now() + interval '18 hours', true, now() - interval '2 hours'),
    (gen_random_uuid(), economics_class_id, alex_user_id, 'Do we like the new format for the quickthink project assignments moving forward', 'text', NULL, now() + interval '22 hours', true, now() - interval '4 hours'),
    (gen_random_uuid(), english_class_id, alex_user_id, 'Are you feeling confident about your presentations in front of the class next week (Y/N)', 'yesno', '["Yes","No"]'::jsonb, now() + interval '12 hours', true, now() - interval '1 hour')
  ON CONFLICT DO NOTHING;

  -- Add pulse checks for Alex Johnson
  INSERT INTO pulse_checks (user_id, class_id, emotion, intensity, notes, created_at, check_date)
  VALUES 
    (alex_user_id, biology_class_id, 'happy', 7, 'Ready for class today', now() - interval '6 days', CURRENT_DATE - interval '6 days'),
    (alex_user_id, economics_class_id, 'excited', 8, 'Looking forward to the discussion', now() - interval '5 days', CURRENT_DATE - interval '5 days'),
    (alex_user_id, english_class_id, 'calm', 6, NULL, now() - interval '4 days', CURRENT_DATE - interval '4 days'),
    (alex_user_id, biology_class_id, 'focused', 7, 'Study day', now() - interval '3 days', CURRENT_DATE - interval '3 days'),
    (alex_user_id, economics_class_id, 'happy', 8, NULL, now() - interval '2 days', CURRENT_DATE - interval '2 days'),
    (alex_user_id, english_class_id, 'confident', 9, 'Finished my essay!', now() - interval '1 day', CURRENT_DATE - interval '1 day'),
    (alex_user_id, biology_class_id, 'motivated', 8, NULL, now(), CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  -- Add sentiment history for classes
  INSERT INTO sentiment_history (user_id, class_id, date, emotion, intensity, is_aggregate, created_at)
  VALUES 
    -- Biology 2 sentiment trend
    (NULL, biology_class_id, CURRENT_DATE - interval '7 days', 'focused', 7, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '6 days', 'happy', 8, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '5 days', 'stressed', 5, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '4 days', 'focused', 6, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '3 days', 'anxious', 5, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '2 days', 'stressed', 4, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '1 day', 'focused', 7, true, now()),
    (NULL, biology_class_id, CURRENT_DATE, 'motivated', 8, true, now()),
    
    -- Economics 1 sentiment trend
    (NULL, economics_class_id, CURRENT_DATE - interval '7 days', 'engaged', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '6 days', 'excited', 9, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '5 days', 'happy', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '4 days', 'content', 7, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '3 days', 'engaged', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '2 days', 'excited', 9, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '1 day', 'happy', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE, 'motivated', 9, true, now()),
    
    -- English 5 sentiment trend
    (NULL, english_class_id, CURRENT_DATE - interval '7 days', 'calm', 6, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '6 days', 'focused', 7, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '5 days', 'nervous', 5, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '4 days', 'calm', 6, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '3 days', 'anxious', 5, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '2 days', 'focused', 7, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '1 day', 'confident', 8, true, now()),
    (NULL, english_class_id, CURRENT_DATE, 'motivated', 8, true, now())
  ON CONFLICT (user_id, class_id, date) DO NOTHING;

  -- Add achievements for Alex
  INSERT INTO achievements (user_id, achievement_type, title, description, icon_name, unlocked_at)
  VALUES 
    (alex_user_id, 'streak', '7-Day Streak', 'Completed pulse checks for 7 consecutive days', 'flame', now() - interval '1 day'),
    (alex_user_id, 'points', 'Rising Star', 'Earned 400 total points', 'star', now() - interval '3 days'),
    (alex_user_id, 'social', 'Team Player', 'Sent 5 Hapi Moments to classmates', 'heart', now() - interval '5 days')
  ON CONFLICT DO NOTHING;

END $$;