/*
  # Add Follow-up Notes to Pulse Checks

  ## Changes
  
  1. Schema Updates
    - Add `followup_notes` column to `pulse_checks` table to store optional student explanations
    - Add `followup_points_awarded` column to track bonus points for completing follow-up
  
  ## Purpose
  
  This migration enables students to provide optional context about why they're feeling a certain way during morning pulse checks. Teachers will have access to these insights to better understand student wellbeing.
  
  ## Points System
  
  - Students earn bonus 5 points for completing the optional follow-up question
*/

-- Add followup_notes column to pulse_checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pulse_checks' AND column_name = 'followup_notes'
  ) THEN
    ALTER TABLE pulse_checks ADD COLUMN followup_notes text;
  END IF;
END $$;

-- Add followup_points_awarded column to track bonus points
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pulse_checks' AND column_name = 'followup_points_awarded'
  ) THEN
    ALTER TABLE pulse_checks ADD COLUMN followup_points_awarded integer DEFAULT 0;
  END IF;
END $$;