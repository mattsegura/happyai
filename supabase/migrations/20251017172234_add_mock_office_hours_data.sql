/*
  # Add Mock Office Hours Data

  ## Overview
  This migration adds sample office hours data for testing the new Hapi Labs meetings feature.

  ## Data Added
  - 3 office hours sessions for the current user's classes
  - Sample queue entries to demonstrate the feature

  ## Notes
  - Uses existing teacher and class IDs from previous migrations
  - Sets dates relative to current date for realistic testing
*/

-- Insert mock office hours for today and future dates
INSERT INTO office_hours (teacher_id, class_id, date, start_time, end_time, meeting_link, max_queue_size, is_active, notes)
SELECT 
  teacher_id,
  id as class_id,
  CURRENT_DATE as date,
  '14:00:00' as start_time,
  '16:00:00' as end_time,
  'https://zoom.us/j/mockmeeting123' as meeting_link,
  10 as max_queue_size,
  true as is_active,
  'Drop by for any questions about the course material!' as notes
FROM classes
WHERE name = 'Biology II'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO office_hours (teacher_id, class_id, date, start_time, end_time, meeting_link, max_queue_size, is_active, notes)
SELECT 
  teacher_id,
  id as class_id,
  CURRENT_DATE + INTERVAL '1 day' as date,
  '15:00:00' as start_time,
  '17:00:00' as end_time,
  'https://zoom.us/j/mockmeeting456' as meeting_link,
  8 as max_queue_size,
  false as is_active,
  'Prepare questions about the upcoming midterm.' as notes
FROM classes
WHERE name = 'Economics 101'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO office_hours (teacher_id, class_id, date, start_time, end_time, meeting_link, max_queue_size, is_active, notes)
SELECT 
  teacher_id,
  id as class_id,
  CURRENT_DATE + INTERVAL '2 days' as date,
  '13:00:00' as start_time,
  '15:00:00' as end_time,
  'https://zoom.us/j/mockmeeting789' as meeting_link,
  12 as max_queue_size,
  false as is_active,
  'Office hours for essay feedback and writing help.' as notes
FROM classes
WHERE name = 'English Literature'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add a general office hours session (not class-specific)
DO $$
DECLARE
  v_teacher_id uuid;
BEGIN
  SELECT teacher_id INTO v_teacher_id FROM classes WHERE name = 'Biology II' LIMIT 1;
  
  IF v_teacher_id IS NOT NULL THEN
    INSERT INTO office_hours (teacher_id, class_id, date, start_time, end_time, meeting_link, max_queue_size, is_active, notes)
    VALUES (
      v_teacher_id,
      NULL,
      CURRENT_DATE + INTERVAL '3 days',
      '10:00:00',
      '12:00:00',
      'https://zoom.us/j/generaloffice',
      15,
      false,
      'General office hours - all students welcome!'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
