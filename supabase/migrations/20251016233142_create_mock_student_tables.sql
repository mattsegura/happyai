/*
  # Create Mock Student Tables

  ## Summary
  Creates tables to store mock student data for leaderboard display purposes.
  These tables mirror the structure of profiles and class_members but for non-authenticated mock users.

  ## Tables Created

  1. **mock_students** - Mock student profile data
     - id (uuid, primary key)
     - full_name (text)
     - email (text, unique)
     - total_points (integer)
     - current_streak (integer)
     - avatar_url (text, nullable)
     - achievements_count (integer)
     - hapi_moments_sent (integer)
     - pulse_responses_completed (integer)
     - created_at (timestamptz)

  2. **mock_class_members** - Links mock students to classes
     - id (uuid, primary key)
     - mock_student_id (uuid, foreign key to mock_students)
     - class_id (uuid, foreign key to classes)
     - class_points (integer)
     - joined_at (timestamptz)
     - UNIQUE constraint on (mock_student_id, class_id)

  ## Security
  - RLS enabled on both tables
  - All authenticated users can view mock student data
  - Mock students cannot be modified by regular users
*/

-- Create mock_students table
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

-- Create mock_class_members table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mock_class_members_class_id ON mock_class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_mock_class_members_mock_student_id ON mock_class_members(mock_student_id);
