-- Migration: Link Canvas Courses to HapiAI Classes
-- This creates a unified class system where Canvas courses auto-create HapiAI classes

-- Add canvas_course_id column to classes table
ALTER TABLE classes ADD COLUMN IF NOT EXISTS canvas_course_id UUID REFERENCES canvas_courses(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_classes_canvas_course_id ON classes(canvas_course_id);

-- Create classes from existing canvas_courses (if they don't exist)
-- This handles the current BIO 201, CS 201, etc. issue
INSERT INTO classes (
  id,
  name,
  description,
  teacher_id,
  class_code,
  university_id,
  is_active,
  canvas_course_id,
  created_at
)
SELECT
  gen_random_uuid(),
  cc.name,
  'Synced from Canvas LMS',
  cc.user_id, -- Teacher is the user who owns the Canvas course
  cc.canvas_course_code,
  cc.university_id,
  true,
  cc.id,
  NOW()
FROM canvas_courses cc
WHERE NOT EXISTS (
  SELECT 1 FROM classes c
  WHERE c.canvas_course_id = cc.id
  OR UPPER(REPLACE(c.class_code, ' ', '')) = UPPER(REPLACE(cc.canvas_course_code, ' ', ''))
)
ON CONFLICT DO NOTHING;

-- Link existing classes to canvas_courses by matching class codes
UPDATE classes c
SET canvas_course_id = cc.id
FROM canvas_courses cc
WHERE c.canvas_course_id IS NULL
  AND UPPER(REPLACE(c.class_code, ' ', '')) = UPPER(REPLACE(cc.canvas_course_code, ' ', ''));

-- Add comment explaining the relationship
COMMENT ON COLUMN classes.canvas_course_id IS 'Links to Canvas LMS course for academic features (grades, assignments). Null for pure HapiAI social classes.';
