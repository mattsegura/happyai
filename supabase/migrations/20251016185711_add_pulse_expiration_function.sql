/*
  # Add Class Pulse Expiration Function

  ## Purpose
  This migration creates a database function to automatically mark Class Pulses
  as inactive when they expire at midnight.

  ## Changes
  1. Creates a function to check and update expired Class Pulses
  2. This function can be called periodically or triggered by the application

  ## Usage
  The function `expire_class_pulses()` can be called to mark all expired pulses as inactive:
  ```sql
  SELECT expire_class_pulses();
  ```
*/

-- Function to expire class pulses
CREATE OR REPLACE FUNCTION expire_class_pulses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE class_pulses
  SET is_active = false
  WHERE is_active = true
  AND expires_at < NOW();
END;
$$;
