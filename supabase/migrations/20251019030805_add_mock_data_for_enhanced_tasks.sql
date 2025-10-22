/*
  # Mock Data for Enhanced Task System Testing

  1. Mock Data Added
    - Class pulse with slider question about test readiness
    - Hapi moment with referral to current user
    - Point values and abbreviated text for display
    
  2. Important Notes
    - Uses mock user IDs from existing data
    - Creates realistic test scenarios
    - Data expires 2 days from now for testing
*/

-- Get the current user ID (will be the first user in profiles table)
DO $$
DECLARE
  current_user_id uuid;
  biology_class_id uuid;
  sender_user_id uuid;
  hapi_moment_id uuid;
BEGIN
  -- Get first user (Alex Johnson)
  SELECT id INTO current_user_id FROM profiles LIMIT 1;
  
  -- Get Biology II class
  SELECT id INTO biology_class_id FROM classes WHERE name = 'Biology II' LIMIT 1;
  
  -- Get a different user to be the sender (second profile)
  SELECT id INTO sender_user_id FROM profiles WHERE id != current_user_id LIMIT 1;
  
  -- Only proceed if we have the necessary data
  IF current_user_id IS NOT NULL AND biology_class_id IS NOT NULL THEN
    
    -- Create a class pulse with slider question
    INSERT INTO class_pulses (
      id,
      class_id,
      teacher_id,
      question,
      question_type,
      point_value,
      abbreviated_title,
      abbreviated_description,
      expires_at,
      is_active,
      created_at
    ) VALUES (
      gen_random_uuid(),
      biology_class_id,
      (SELECT teacher_id FROM classes WHERE id = biology_class_id),
      'How ready are you for next weeks test?',
      'slider',
      20,
      'Class Pulse',
      'Status check',
      now() + interval '2 days',
      true,
      now()
    ) ON CONFLICT DO NOTHING;
    
    -- Create a hapi moment from another student if we have sender
    IF sender_user_id IS NOT NULL THEN
      INSERT INTO hapi_moments (
        id,
        sender_id,
        recipient_id,
        class_id,
        message,
        sender_points,
        recipient_points,
        created_at
      ) VALUES (
        gen_random_uuid(),
        sender_user_id,
        current_user_id,
        biology_class_id,
        'Thanks for helping me understand cellular respiration! Your explanation was super clear and really helped me prepare for the exam.',
        5,
        5,
        now() - interval '1 hour'
      ) ON CONFLICT DO NOTHING
      RETURNING id INTO hapi_moment_id;
      
      -- Create a referral notification for the hapi moment
      IF hapi_moment_id IS NOT NULL THEN
        INSERT INTO hapi_moment_referrals (
          id,
          hapi_moment_id,
          referred_user_id,
          is_read,
          points_awarded,
          created_at
        ) VALUES (
          gen_random_uuid(),
          hapi_moment_id,
          current_user_id,
          false,
          5,
          now() - interval '1 hour'
        ) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
    
  END IF;
END $$;
