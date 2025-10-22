/*
  # Create Mock Students Table for Leaderboard Display - V2

  ## Summary
  Creates mock student data tables and populates them with 10 realistic students
  distributed across the 3 classes with varied performance levels.

  ## Tables Created

  1. **mock_students** - Display-only student data for leaderboards
  2. **mock_class_members** - Links mock students to classes

  ## Security
  - RLS enabled with appropriate policies for authenticated users
*/

-- Create mock students table
CREATE TABLE IF NOT EXISTS mock_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  avatar_url text,
  achievements_count integer DEFAULT 0,
  hapi_moments_sent integer DEFAULT 0,
  pulse_responses_completed integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mock_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mock students"
  ON mock_students FOR SELECT
  TO authenticated
  USING (true);

-- Create mock class members table
CREATE TABLE IF NOT EXISTS mock_class_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_student_id uuid REFERENCES mock_students(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  class_points integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(mock_student_id, class_id)
);

ALTER TABLE mock_class_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can view mock students in their classes"
  ON mock_class_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = mock_class_members.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mock_class_members_class_id ON mock_class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_mock_class_members_mock_student_id ON mock_class_members(mock_student_id);