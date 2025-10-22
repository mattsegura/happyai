/*
  # Enhanced Task System with Referral Notifications and Display Fields

  1. New Tables
    - `hapi_moment_referrals`
      - Tracks when students are referred/mentioned in Hapi Moments
      - `id` (uuid, primary key)
      - `hapi_moment_id` (uuid, references hapi_moments)
      - `referred_user_id` (uuid, references profiles)
      - `is_read` (boolean, default false)
      - `points_awarded` (integer, default 5)
      - `created_at` (timestamptz)
      
  2. Table Modifications  
    - Add `abbreviated_title` to class_pulses for task card display
    - Add `abbreviated_description` to class_pulses for task card display
    - Add `point_value` to class_pulses for display on cards
    - Add `followup_notes` to pulse_checks for morning pulse followup
    - Add `followup_points_awarded` to pulse_checks for tracking bonus points
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to read their own data
    - Add policies for creating referrals
    
  4. Important Notes
    - Referrals create notifications that appear in Today's Tasks
    - Abbreviated fields provide clean task card displays
    - Point values show on task cards to encourage engagement
*/

-- Create hapi_moment_referrals table
CREATE TABLE IF NOT EXISTS hapi_moment_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hapi_moment_id uuid REFERENCES hapi_moments(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  points_awarded integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- Add columns to class_pulses for enhanced display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulses' AND column_name = 'abbreviated_title'
  ) THEN
    ALTER TABLE class_pulses ADD COLUMN abbreviated_title text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulses' AND column_name = 'abbreviated_description'
  ) THEN
    ALTER TABLE class_pulses ADD COLUMN abbreviated_description text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulses' AND column_name = 'point_value'
  ) THEN
    ALTER TABLE class_pulses ADD COLUMN point_value integer DEFAULT 10;
  END IF;
END $$;

-- Add columns to pulse_checks for followup notes tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pulse_checks' AND column_name = 'followup_notes'
  ) THEN
    ALTER TABLE pulse_checks ADD COLUMN followup_notes text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pulse_checks' AND column_name = 'followup_points_awarded'
  ) THEN
    ALTER TABLE pulse_checks ADD COLUMN followup_points_awarded integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on hapi_moment_referrals
ALTER TABLE hapi_moment_referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referred user
CREATE POLICY "Users can view own referrals"
  ON hapi_moment_referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referred_user_id);

-- Users can mark their own referrals as read
CREATE POLICY "Users can update own referrals"
  ON hapi_moment_referrals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = referred_user_id)
  WITH CHECK (auth.uid() = referred_user_id);

-- Users can create referrals when sending hapi moments
CREATE POLICY "Users can create referrals"
  ON hapi_moment_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_hapi_referrals_user_read 
  ON hapi_moment_referrals(referred_user_id, is_read, created_at DESC);
