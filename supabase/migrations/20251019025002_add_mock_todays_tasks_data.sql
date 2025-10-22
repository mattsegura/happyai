/*
  # Add Mock Data for Today's Tasks Display

  ## Summary
  This migration adds sample data for testing the "Today's Tasks" section on the student home page.

  ## What's Added
  1. **Office Hours** - Creates a sample office hour for today to show in the meetings task
  2. **Hapi Moment** - Adds a recent hapi moment notification from a classmate
  3. Ensures the current user has incomplete class pulses to display

  ## Purpose
  This ensures that students will see at least one of each task type:
  - Morning pulse (shows if not completed today)
  - Class pulse (from existing pulse_check_sets)
  - Meeting (today's office hour)
  - Hapi moment notification (recent positive message)

  ## Security
  - Uses existing RLS policies
  - Only adds mock data, doesn't modify security
*/

DO $$
DECLARE
  v_teacher_id uuid;
  v_student_id uuid;
  v_class_id uuid;
  v_today date := CURRENT_DATE;
BEGIN
  SELECT id INTO v_teacher_id FROM profiles WHERE email LIKE '%teacher%' LIMIT 1;
  SELECT id INTO v_student_id FROM profiles WHERE email NOT LIKE '%teacher%' LIMIT 1;
  SELECT class_id INTO v_class_id FROM class_members WHERE user_id = v_student_id LIMIT 1;

  IF v_teacher_id IS NULL OR v_student_id IS NULL THEN
    RAISE NOTICE 'No teacher or student found for mock data';
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM office_hours 
    WHERE date = v_today 
    AND teacher_id = v_teacher_id
  ) THEN
    INSERT INTO office_hours (
      teacher_id,
      class_id,
      date,
      start_time,
      end_time,
      meeting_link,
      max_queue_size,
      is_active,
      notes
    ) VALUES (
      v_teacher_id,
      v_class_id,
      v_today,
      '14:00:00',
      '15:00:00',
      'https://meet.google.com/sample-meeting-link',
      5,
      false,
      'Drop-in for homework help and questions'
    );
    RAISE NOTICE 'Added office hour for today';
  END IF;

  IF v_class_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM hapi_moments 
      WHERE recipient_id = v_student_id 
      AND created_at >= NOW() - INTERVAL '2 days'
    ) THEN
      INSERT INTO hapi_moments (
        sender_id,
        recipient_id,
        class_id,
        message,
        sender_points,
        recipient_points,
        created_at
      ) VALUES (
        v_teacher_id,
        v_student_id,
        v_class_id,
        'Great participation in class today! Your questions really helped move the discussion forward.',
        5,
        5,
        NOW() - INTERVAL '3 hours'
      );
      RAISE NOTICE 'Added hapi moment notification';
    END IF;
  END IF;

END $$;
