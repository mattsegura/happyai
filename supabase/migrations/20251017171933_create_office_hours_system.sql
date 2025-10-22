/*
  # Create Office Hours and Queue System

  ## Overview
  This migration creates the database schema for the office hours and meetings feature in Hapi Labs.

  ## New Tables

  1. **office_hours** - Teacher-scheduled office hours sessions
    - `id` (uuid, primary key)
    - `teacher_id` (uuid, references auth.users)
    - `class_id` (uuid, references classes, nullable - can be general or class-specific)
    - `date` (date)
    - `start_time` (time)
    - `end_time` (time)
    - `meeting_link` (text, Zoom/Meet URL)
    - `max_queue_size` (integer, default 10)
    - `is_active` (boolean, default false)
    - `notes` (text, optional description)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. **office_hours_queue** - Students waiting in queue for office hours
    - `id` (uuid, primary key)
    - `office_hour_id` (uuid, references office_hours)
    - `student_id` (uuid, references auth.users)
    - `status` (text: 'waiting', 'in_session', 'completed', 'cancelled')
    - `reason` (text, optional - why student wants to meet)
    - `joined_at` (timestamptz)
    - `started_at` (timestamptz, nullable)
    - `completed_at` (timestamptz, nullable)
    - `position` (integer, auto-calculated)

  ## Security
  - Enable RLS on both tables
  - Students can view office hours for classes they're enrolled in
  - Students can manage their own queue entries
  - Teachers can view and manage all queue entries for their office hours

  ## Indexes
  - Index on date and teacher_id for fast lookups
  - Index on office_hour_id and status for queue queries
*/

-- Office Hours table
CREATE TABLE IF NOT EXISTS office_hours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  meeting_link text NOT NULL,
  max_queue_size integer DEFAULT 10,
  is_active boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE office_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view office hours for their classes"
  ON office_hours FOR SELECT
  TO authenticated
  USING (
    class_id IS NULL OR
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = office_hours.class_id
      AND class_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their own office hours"
  ON office_hours FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own office hours"
  ON office_hours FOR INSERT
  TO authenticated
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own office hours"
  ON office_hours FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own office hours"
  ON office_hours FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- Office Hours Queue table
CREATE TABLE IF NOT EXISTS office_hours_queue (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_hour_id uuid REFERENCES office_hours(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_session', 'completed', 'cancelled')),
  reason text,
  joined_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  position integer,
  UNIQUE(office_hour_id, student_id)
);

ALTER TABLE office_hours_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own queue entries"
  ON office_hours_queue FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can view queue entries for office hours they can access"
  ON office_hours_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM office_hours oh
      WHERE oh.id = office_hours_queue.office_hour_id
      AND (
        oh.class_id IS NULL OR
        EXISTS (
          SELECT 1 FROM class_members
          WHERE class_members.class_id = oh.class_id
          AND class_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Teachers can view queue entries for their office hours"
  ON office_hours_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM office_hours
      WHERE office_hours.id = office_hours_queue.office_hour_id
      AND office_hours.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can insert their own queue entries"
  ON office_hours_queue FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own queue entries"
  ON office_hours_queue FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can update queue entries for their office hours"
  ON office_hours_queue FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM office_hours
      WHERE office_hours.id = office_hours_queue.office_hour_id
      AND office_hours.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM office_hours
      WHERE office_hours.id = office_hours_queue.office_hour_id
      AND office_hours.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can delete their own queue entries"
  ON office_hours_queue FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Function to automatically set queue position
CREATE OR REPLACE FUNCTION set_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL AND NEW.status = 'waiting' THEN
    SELECT COALESCE(MAX(position), 0) + 1
    INTO NEW.position
    FROM office_hours_queue
    WHERE office_hour_id = NEW.office_hour_id
    AND status = 'waiting';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_queue_position_trigger
  BEFORE INSERT ON office_hours_queue
  FOR EACH ROW
  EXECUTE FUNCTION set_queue_position();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_office_hours_teacher_date ON office_hours(teacher_id, date);
CREATE INDEX IF NOT EXISTS idx_office_hours_class_date ON office_hours(class_id, date);
CREATE INDEX IF NOT EXISTS idx_office_hours_date ON office_hours(date);
CREATE INDEX IF NOT EXISTS idx_queue_office_hour_status ON office_hours_queue(office_hour_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_student ON office_hours_queue(student_id);
