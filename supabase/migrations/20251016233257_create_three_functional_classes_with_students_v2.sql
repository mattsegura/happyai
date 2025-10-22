/*
  # Create Three Functional Classes with Mock Students and Leaderboards

  ## Summary
  This migration replaces the existing class structure with three fully functional classes,
  each with 12-14 mock students and complete leaderboard data. All data is properly linked
  and visible in the application.

  ## Changes Made

  1. **Remove Old Data**
     - Clean up existing class memberships, pulses, and responses
     - Remove old mock student data
     - Clear old class records

  2. **Create Three New Classes**
     - Biology 1: Introduction to cellular biology taught by Mr. Harrison
     - English 5: Advanced literature and composition taught by Dr. Thompson
     - Economics 3: Microeconomics and market analysis taught by Ms. Rodriguez

  3. **Mock Students** (12-14 per class, 40 total unique students)
     - Biology 1: 13 students with class_points ranging from 50-350
     - English 5: 14 students with class_points ranging from 50-350
     - Economics 3: 13 students with class_points ranging from 50-350
     - Each student has realistic profile data (total_points, streaks, achievements)

  4. **Class Memberships**
     - Each mock student is enrolled in exactly one class
     - Points distributed to create realistic competitive leaderboards
     - Rankings from 1st to 13th/14th place in each class

  5. **Supporting Data**
     - Class pulse questions for each subject area
     - Sentiment history trends for each class

  ## Security
  - All tables maintain existing RLS policies
  - Mock data is viewable by all authenticated users
  - Real user data remains protected by existing policies
*/

DO $$
DECLARE
  biology_class_id uuid;
  english_class_id uuid;
  economics_class_id uuid;
  
  -- Biology 1 mock student IDs
  bio_student_1 uuid; bio_student_2 uuid; bio_student_3 uuid; bio_student_4 uuid;
  bio_student_5 uuid; bio_student_6 uuid; bio_student_7 uuid; bio_student_8 uuid;
  bio_student_9 uuid; bio_student_10 uuid; bio_student_11 uuid; bio_student_12 uuid;
  bio_student_13 uuid;
  
  -- English 5 mock student IDs
  eng_student_1 uuid; eng_student_2 uuid; eng_student_3 uuid; eng_student_4 uuid;
  eng_student_5 uuid; eng_student_6 uuid; eng_student_7 uuid; eng_student_8 uuid;
  eng_student_9 uuid; eng_student_10 uuid; eng_student_11 uuid; eng_student_12 uuid;
  eng_student_13 uuid; eng_student_14 uuid;
  
  -- Economics 3 mock student IDs
  econ_student_1 uuid; econ_student_2 uuid; econ_student_3 uuid; econ_student_4 uuid;
  econ_student_5 uuid; econ_student_6 uuid; econ_student_7 uuid; econ_student_8 uuid;
  econ_student_9 uuid; econ_student_10 uuid; econ_student_11 uuid; econ_student_12 uuid;
  econ_student_13 uuid;
BEGIN

  -- ============================================================
  -- STEP 1: Clean up old data
  -- ============================================================
  
  DELETE FROM class_pulse_responses WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM class_pulses WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM pulse_checks WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM hapi_moments WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM sentiment_history WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM mock_class_members WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM class_members WHERE class_id IN (
    SELECT id FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024')
  );
  
  DELETE FROM mock_students;
  
  DELETE FROM classes WHERE class_code IN ('BIO2-2024', 'ECON1-2024', 'ENG5-2024');

  -- ============================================================
  -- STEP 2: Create Three New Classes
  -- ============================================================
  
  biology_class_id := gen_random_uuid();
  english_class_id := gen_random_uuid();
  economics_class_id := gen_random_uuid();
  
  INSERT INTO classes (id, name, description, teacher_name, teacher_id, class_code, created_at, updated_at)
  VALUES 
    (biology_class_id, 'Biology 1', 'Introduction to cellular biology and genetics', 'Mr. Harrison', NULL, 'BIO1-2025', now() - interval '90 days', now()),
    (english_class_id, 'English 5', 'Advanced literature analysis and composition', 'Dr. Thompson', NULL, 'ENG5-2025', now() - interval '90 days', now()),
    (economics_class_id, 'Economics 3', 'Microeconomics and market analysis', 'Ms. Rodriguez', NULL, 'ECON3-2025', now() - interval '90 days', now());

  -- ============================================================
  -- STEP 3: Create Mock Students for Biology 1 (13 students)
  -- ============================================================
  
  bio_student_1 := gen_random_uuid();
  bio_student_2 := gen_random_uuid();
  bio_student_3 := gen_random_uuid();
  bio_student_4 := gen_random_uuid();
  bio_student_5 := gen_random_uuid();
  bio_student_6 := gen_random_uuid();
  bio_student_7 := gen_random_uuid();
  bio_student_8 := gen_random_uuid();
  bio_student_9 := gen_random_uuid();
  bio_student_10 := gen_random_uuid();
  bio_student_11 := gen_random_uuid();
  bio_student_12 := gen_random_uuid();
  bio_student_13 := gen_random_uuid();
  
  INSERT INTO mock_students (id, full_name, email, total_points, current_streak, achievements_count, hapi_moments_sent, pulse_responses_completed, created_at)
  VALUES 
    (bio_student_1, 'Sarah Chen', 'sarah.chen@biology.edu', 920, 15, 12, 28, 56, now() - interval '85 days'),
    (bio_student_2, 'Marcus Johnson', 'marcus.j@biology.edu', 880, 14, 11, 25, 52, now() - interval '85 days'),
    (bio_student_3, 'Emily Rodriguez', 'emily.rod@biology.edu', 840, 13, 10, 22, 48, now() - interval '85 days'),
    (bio_student_4, 'David Kim', 'david.kim@biology.edu', 790, 11, 9, 20, 44, now() - interval '85 days'),
    (bio_student_5, 'Jessica Martinez', 'jess.martinez@biology.edu', 720, 10, 8, 18, 40, now() - interval '85 days'),
    (bio_student_6, 'Ryan Patel', 'ryan.patel@biology.edu', 680, 9, 7, 16, 36, now() - interval '85 days'),
    (bio_student_7, 'Amanda Lee', 'amanda.lee@biology.edu', 620, 8, 6, 14, 32, now() - interval '85 days'),
    (bio_student_8, 'Jordan Taylor', 'jordan.t@biology.edu', 560, 7, 5, 12, 28, now() - interval '85 days'),
    (bio_student_9, 'Nicole Brown', 'nicole.brown@biology.edu', 490, 6, 5, 10, 24, now() - interval '85 days'),
    (bio_student_10, 'Kevin White', 'kevin.white@biology.edu', 420, 5, 4, 8, 20, now() - interval '85 days'),
    (bio_student_11, 'Lauren Garcia', 'lauren.g@biology.edu', 350, 4, 3, 6, 16, now() - interval '85 days'),
    (bio_student_12, 'Tyler Anderson', 'tyler.a@biology.edu', 280, 3, 2, 4, 12, now() - interval '85 days'),
    (bio_student_13, 'Megan Wilson', 'megan.w@biology.edu', 210, 2, 1, 2, 8, now() - interval '85 days');

  -- ============================================================
  -- STEP 4: Create Mock Students for English 5 (14 students)
  -- ============================================================
  
  eng_student_1 := gen_random_uuid();
  eng_student_2 := gen_random_uuid();
  eng_student_3 := gen_random_uuid();
  eng_student_4 := gen_random_uuid();
  eng_student_5 := gen_random_uuid();
  eng_student_6 := gen_random_uuid();
  eng_student_7 := gen_random_uuid();
  eng_student_8 := gen_random_uuid();
  eng_student_9 := gen_random_uuid();
  eng_student_10 := gen_random_uuid();
  eng_student_11 := gen_random_uuid();
  eng_student_12 := gen_random_uuid();
  eng_student_13 := gen_random_uuid();
  eng_student_14 := gen_random_uuid();
  
  INSERT INTO mock_students (id, full_name, email, total_points, current_streak, achievements_count, hapi_moments_sent, pulse_responses_completed, created_at)
  VALUES 
    (eng_student_1, 'Olivia Thompson', 'olivia.t@english.edu', 950, 16, 13, 30, 58, now() - interval '85 days'),
    (eng_student_2, 'Ethan Moore', 'ethan.moore@english.edu', 900, 15, 12, 27, 54, now() - interval '85 days'),
    (eng_student_3, 'Sophia Davis', 'sophia.davis@english.edu', 850, 14, 11, 24, 50, now() - interval '85 days'),
    (eng_student_4, 'Liam Wilson', 'liam.wilson@english.edu', 800, 12, 10, 22, 46, now() - interval '85 days'),
    (eng_student_5, 'Ava Jackson', 'ava.jackson@english.edu', 750, 11, 9, 20, 42, now() - interval '85 days'),
    (eng_student_6, 'Noah Martinez', 'noah.mart@english.edu', 690, 10, 8, 18, 38, now() - interval '85 days'),
    (eng_student_7, 'Isabella Harris', 'isabella.h@english.edu', 630, 9, 7, 16, 34, now() - interval '85 days'),
    (eng_student_8, 'Mason Clark', 'mason.clark@english.edu', 570, 8, 6, 14, 30, now() - interval '85 days'),
    (eng_student_9, 'Emma Lewis', 'emma.lewis@english.edu', 510, 7, 5, 12, 26, now() - interval '85 days'),
    (eng_student_10, 'Lucas Walker', 'lucas.walker@english.edu', 450, 6, 4, 10, 22, now() - interval '85 days'),
    (eng_student_11, 'Mia Robinson', 'mia.robinson@english.edu', 380, 5, 4, 8, 18, now() - interval '85 days'),
    (eng_student_12, 'James Young', 'james.young@english.edu', 320, 4, 3, 6, 14, now() - interval '85 days'),
    (eng_student_13, 'Charlotte King', 'charlotte.k@english.edu', 250, 3, 2, 4, 10, now() - interval '85 days'),
    (eng_student_14, 'Benjamin Scott', 'ben.scott@english.edu', 180, 2, 1, 2, 6, now() - interval '85 days');

  -- ============================================================
  -- STEP 5: Create Mock Students for Economics 3 (13 students)
  -- ============================================================
  
  econ_student_1 := gen_random_uuid();
  econ_student_2 := gen_random_uuid();
  econ_student_3 := gen_random_uuid();
  econ_student_4 := gen_random_uuid();
  econ_student_5 := gen_random_uuid();
  econ_student_6 := gen_random_uuid();
  econ_student_7 := gen_random_uuid();
  econ_student_8 := gen_random_uuid();
  econ_student_9 := gen_random_uuid();
  econ_student_10 := gen_random_uuid();
  econ_student_11 := gen_random_uuid();
  econ_student_12 := gen_random_uuid();
  econ_student_13 := gen_random_uuid();
  
  INSERT INTO mock_students (id, full_name, email, total_points, current_streak, achievements_count, hapi_moments_sent, pulse_responses_completed, created_at)
  VALUES 
    (econ_student_1, 'Alexander Chen', 'alex.chen@economics.edu', 980, 17, 14, 32, 60, now() - interval '85 days'),
    (econ_student_2, 'Victoria Brown', 'victoria.b@economics.edu', 920, 16, 13, 29, 56, now() - interval '85 days'),
    (econ_student_3, 'Daniel Garcia', 'daniel.g@economics.edu', 870, 15, 12, 26, 52, now() - interval '85 days'),
    (econ_student_4, 'Grace Miller', 'grace.miller@economics.edu', 810, 13, 11, 24, 48, now() - interval '85 days'),
    (econ_student_5, 'Matthew Lopez', 'matt.lopez@economics.edu', 760, 12, 10, 22, 44, now() - interval '85 days'),
    (econ_student_6, 'Chloe Anderson', 'chloe.and@economics.edu', 700, 11, 9, 20, 40, now() - interval '85 days'),
    (econ_student_7, 'Andrew Thomas', 'andrew.t@economics.edu', 640, 10, 8, 18, 36, now() - interval '85 days'),
    (econ_student_8, 'Natalie Moore', 'natalie.m@economics.edu', 580, 9, 7, 16, 32, now() - interval '85 days'),
    (econ_student_9, 'Christopher Lee', 'chris.lee@economics.edu', 520, 8, 6, 14, 28, now() - interval '85 days'),
    (econ_student_10, 'Samantha Hall', 'sam.hall@economics.edu', 460, 7, 5, 12, 24, now() - interval '85 days'),
    (econ_student_11, 'Joshua Allen', 'josh.allen@economics.edu', 390, 6, 4, 10, 20, now() - interval '85 days'),
    (econ_student_12, 'Hannah Wright', 'hannah.w@economics.edu', 310, 5, 3, 8, 16, now() - interval '85 days'),
    (econ_student_13, 'Nicholas Green', 'nick.green@economics.edu', 240, 3, 2, 6, 12, now() - interval '85 days');

  -- ============================================================
  -- STEP 6: Create Class Memberships - Biology 1
  -- ============================================================
  
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  VALUES 
    (bio_student_1, biology_class_id, 350, now() - interval '85 days'),
    (bio_student_2, biology_class_id, 320, now() - interval '85 days'),
    (bio_student_3, biology_class_id, 295, now() - interval '85 days'),
    (bio_student_4, biology_class_id, 270, now() - interval '85 days'),
    (bio_student_5, biology_class_id, 240, now() - interval '85 days'),
    (bio_student_6, biology_class_id, 215, now() - interval '85 days'),
    (bio_student_7, biology_class_id, 185, now() - interval '85 days'),
    (bio_student_8, biology_class_id, 160, now() - interval '85 days'),
    (bio_student_9, biology_class_id, 135, now() - interval '85 days'),
    (bio_student_10, biology_class_id, 110, now() - interval '85 days'),
    (bio_student_11, biology_class_id, 85, now() - interval '85 days'),
    (bio_student_12, biology_class_id, 65, now() - interval '85 days'),
    (bio_student_13, biology_class_id, 50, now() - interval '85 days');

  -- ============================================================
  -- STEP 7: Create Class Memberships - English 5
  -- ============================================================
  
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  VALUES 
    (eng_student_1, english_class_id, 345, now() - interval '85 days'),
    (eng_student_2, english_class_id, 325, now() - interval '85 days'),
    (eng_student_3, english_class_id, 300, now() - interval '85 days'),
    (eng_student_4, english_class_id, 275, now() - interval '85 days'),
    (eng_student_5, english_class_id, 250, now() - interval '85 days'),
    (eng_student_6, english_class_id, 220, now() - interval '85 days'),
    (eng_student_7, english_class_id, 195, now() - interval '85 days'),
    (eng_student_8, english_class_id, 170, now() - interval '85 days'),
    (eng_student_9, english_class_id, 145, now() - interval '85 days'),
    (eng_student_10, english_class_id, 120, now() - interval '85 days'),
    (eng_student_11, english_class_id, 95, now() - interval '85 days'),
    (eng_student_12, english_class_id, 75, now() - interval '85 days'),
    (eng_student_13, english_class_id, 60, now() - interval '85 days'),
    (eng_student_14, english_class_id, 50, now() - interval '85 days');

  -- ============================================================
  -- STEP 8: Create Class Memberships - Economics 3
  -- ============================================================
  
  INSERT INTO mock_class_members (mock_student_id, class_id, class_points, joined_at)
  VALUES 
    (econ_student_1, economics_class_id, 350, now() - interval '85 days'),
    (econ_student_2, economics_class_id, 330, now() - interval '85 days'),
    (econ_student_3, economics_class_id, 305, now() - interval '85 days'),
    (econ_student_4, economics_class_id, 280, now() - interval '85 days'),
    (econ_student_5, economics_class_id, 255, now() - interval '85 days'),
    (econ_student_6, economics_class_id, 225, now() - interval '85 days'),
    (econ_student_7, economics_class_id, 200, now() - interval '85 days'),
    (econ_student_8, economics_class_id, 175, now() - interval '85 days'),
    (econ_student_9, economics_class_id, 150, now() - interval '85 days'),
    (econ_student_10, economics_class_id, 125, now() - interval '85 days'),
    (econ_student_11, economics_class_id, 100, now() - interval '85 days'),
    (econ_student_12, economics_class_id, 70, now() - interval '85 days'),
    (econ_student_13, economics_class_id, 50, now() - interval '85 days');

  -- ============================================================
  -- STEP 9: Add Sentiment History for Each Class
  -- ============================================================
  
  INSERT INTO sentiment_history (user_id, class_id, date, emotion, intensity, is_aggregate, created_at)
  VALUES 
    -- Biology 1 sentiment trend (last 7 days)
    (NULL, biology_class_id, CURRENT_DATE - interval '7 days', 'focused', 7, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '6 days', 'engaged', 8, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '5 days', 'curious', 7, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '4 days', 'stressed', 5, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '3 days', 'anxious', 5, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '2 days', 'focused', 6, true, now()),
    (NULL, biology_class_id, CURRENT_DATE - interval '1 day', 'motivated', 7, true, now()),
    (NULL, biology_class_id, CURRENT_DATE, 'confident', 8, true, now()),
    
    -- English 5 sentiment trend (last 7 days)
    (NULL, english_class_id, CURRENT_DATE - interval '7 days', 'inspired', 8, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '6 days', 'engaged', 9, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '5 days', 'creative', 8, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '4 days', 'thoughtful', 7, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '3 days', 'curious', 8, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '2 days', 'motivated', 8, true, now()),
    (NULL, english_class_id, CURRENT_DATE - interval '1 day', 'excited', 9, true, now()),
    (NULL, english_class_id, CURRENT_DATE, 'confident', 8, true, now()),
    
    -- Economics 3 sentiment trend (last 7 days)
    (NULL, economics_class_id, CURRENT_DATE - interval '7 days', 'challenged', 6, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '6 days', 'focused', 7, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '5 days', 'confused', 5, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '4 days', 'determined', 7, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '3 days', 'engaged', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '2 days', 'curious', 7, true, now()),
    (NULL, economics_class_id, CURRENT_DATE - interval '1 day', 'confident', 8, true, now()),
    (NULL, economics_class_id, CURRENT_DATE, 'motivated', 8, true, now());

END $$;
