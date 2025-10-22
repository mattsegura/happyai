/*
  # Rollback Pulse Progress Tracking System

  This migration removes the pulse progress tracking system that was previously added.

  1. Removed Tables
    - `pulse_response_progress` - Tracking table for partial pulse completions

  2. Removed Columns
    - `is_completed` from `class_pulse_responses`
    - `started_at` from `class_pulse_responses`

  3. Removed Functions
    - `update_pulse_progress_timestamp()` function and trigger
*/

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_pulse_progress_timestamp_trigger ON pulse_response_progress;

-- Drop function if exists
DROP FUNCTION IF EXISTS update_pulse_progress_timestamp();

-- Drop table if exists
DROP TABLE IF EXISTS pulse_response_progress;

-- Remove columns from class_pulse_responses if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulse_responses' AND column_name = 'is_completed'
  ) THEN
    ALTER TABLE class_pulse_responses DROP COLUMN is_completed;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'class_pulse_responses' AND column_name = 'started_at'
  ) THEN
    ALTER TABLE class_pulse_responses DROP COLUMN started_at;
  END IF;
END $$;