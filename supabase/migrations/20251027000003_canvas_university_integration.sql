-- Migration: Canvas University Integration
-- This adds Canvas account ID tracking to universities for automatic Canvas sync matching

-- Step 1: Add canvas_account_id to universities table
ALTER TABLE universities
ADD COLUMN IF NOT EXISTS canvas_account_id TEXT UNIQUE;

-- Step 2: Add canvas_root_account_id to canvas_settings for user-level tracking
ALTER TABLE canvas_settings
ADD COLUMN IF NOT EXISTS canvas_root_account_id TEXT;

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_universities_canvas_account_id
ON universities(canvas_account_id)
WHERE canvas_account_id IS NOT NULL;

-- Step 4: Add helpful comments
COMMENT ON COLUMN universities.canvas_account_id IS
'Canvas root account ID for this university. Used to automatically match Canvas data to universities.';

COMMENT ON COLUMN canvas_settings.canvas_root_account_id IS
'Canvas root account ID from user enrollment. Used to verify user belongs to university.';

-- Step 5: Create function to match Canvas account to university
CREATE OR REPLACE FUNCTION get_university_id_by_canvas_account(canvas_account_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_university_id UUID;
BEGIN
  -- Try to find university by Canvas account ID
  SELECT id INTO v_university_id
  FROM universities
  WHERE canvas_account_id = canvas_account_id
    AND is_active = true
  LIMIT 1;

  -- If no match found, return NULL (caller should handle)
  RETURN v_university_id;
END;
$$;

GRANT EXECUTE ON FUNCTION get_university_id_by_canvas_account(TEXT) TO authenticated;

COMMENT ON FUNCTION get_university_id_by_canvas_account(TEXT) IS
'Returns university ID based on Canvas root account ID. Returns NULL if no match found.';
