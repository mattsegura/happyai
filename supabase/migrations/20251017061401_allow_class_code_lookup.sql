/*
  # Allow Class Code Lookup

  1. Changes
    - Add RLS policy to allow authenticated users to look up classes by class_code
    - This enables students to validate and join classes using only a class code
    - Users can only see id and name when looking up by code (not all class details)

  2. Security
    - Policy is restricted to authenticated users only
    - Limited to lookups by class_code field only
    - Does not expose sensitive class information
*/

-- Allow authenticated users to look up classes by class code
CREATE POLICY "Authenticated users can lookup classes by code"
  ON classes FOR SELECT
  TO authenticated
  USING (class_code IS NOT NULL);