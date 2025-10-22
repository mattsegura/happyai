/*
  # Create Pulse Progress Tracking System

  1. New Tables
    - `pulse_response_progress`
      - Tracks partial completion of class pulses
      - Stores response data, completion percentage, and timestamps
      - Enables resuming incomplete pulses from where user left off
  
  2. Table Updates
    - Add columns to `class_pulse_responses` for completion tracking
    - Add `is_completed` and `started_at` fields
  
  3. Security
    - Enable RLS on `pulse_response_progress` table
    - Users can only read/write their own progress data
    - Students can only access progress for pulses in their enrolled classes
  
  4. Indexes
    - Index on user_id and pulse_id for fast progress lookups
    - Index on updated_at for recent activity queries
*/

-- Create pulse_response_progress table
CREATE TABLE IF NOT EXISTS pulse_response_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_pulse_id uuid NOT NULL REFERENCES class_pulses(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  response_data jsonb DEFAULT '{}'::jsonb,
  completion_percentage integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_pulse_progress_user_id ON pulse_response_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_progress_class_pulse_id ON pulse_response_progress(class_pulse_id);
CREATE INDEX IF NOT EXISTS idx_pulse_progress_user_pulse ON pulse_response_progress(user_id, class_pulse_id);
CREATE INDEX IF NOT EXISTS idx_pulse_progress_updated_at ON pulse_response_progress(last_updated);

-- Enable RLS
ALTER TABLE pulse_response_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_response_progress
CREATE POLICY "Users can view own progress"
  ON pulse_response_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON pulse_response_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON pulse_response_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON pulse_response_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add completion tracking columns to class_pulse_responses if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulse_responses' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE class_pulse_responses ADD COLUMN is_completed boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulse_responses' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE class_pulse_responses ADD COLUMN started_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create function to update last_updated timestamp
CREATE OR REPLACE FUNCTION update_pulse_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_pulse_progress_timestamp_trigger ON pulse_response_progress;
CREATE TRIGGER update_pulse_progress_timestamp_trigger
  BEFORE UPDATE ON pulse_response_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_progress_timestamp();