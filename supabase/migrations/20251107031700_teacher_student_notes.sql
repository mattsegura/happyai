/**
 * Teacher Student Notes Migration
 *
 * Creates a table for teachers to store private notes about individual students.
 * These notes are displayed in the student report page and help teachers track
 * interventions, observations, and follow-ups.
 *
 * Phase 3: Student Search & Reports
 */

-- Create teacher_student_notes table
CREATE TABLE IF NOT EXISTS teacher_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'academic', 'wellbeing', 'behavioral', 'intervention', 'meeting')),
  is_private BOOLEAN NOT NULL DEFAULT true,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_teacher_notes_teacher_student ON teacher_student_notes(teacher_id, student_id);
CREATE INDEX idx_teacher_notes_class ON teacher_student_notes(teacher_id, class_id);
CREATE INDEX idx_teacher_notes_created ON teacher_student_notes(teacher_id, created_at DESC);
CREATE INDEX idx_teacher_notes_flagged ON teacher_student_notes(teacher_id, is_flagged) WHERE is_flagged = true;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_teacher_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER teacher_notes_updated_at
  BEFORE UPDATE ON teacher_student_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_teacher_notes_updated_at();

-- Comments
COMMENT ON TABLE teacher_student_notes IS 'Private teacher notes about individual students';
COMMENT ON COLUMN teacher_student_notes.teacher_id IS 'Teacher who created the note';
COMMENT ON COLUMN teacher_student_notes.student_id IS 'Student the note is about';
COMMENT ON COLUMN teacher_student_notes.class_id IS 'Optional: Class context for the note';
COMMENT ON COLUMN teacher_student_notes.note_type IS 'Category of note (general, academic, wellbeing, behavioral, intervention, meeting)';
COMMENT ON COLUMN teacher_student_notes.is_private IS 'Whether note is visible only to the teacher (always true for now)';
COMMENT ON COLUMN teacher_student_notes.is_flagged IS 'Whether note is flagged for follow-up';
COMMENT ON COLUMN teacher_student_notes.tags IS 'Custom tags for organizing notes';

-- Row Level Security (RLS) Policies
ALTER TABLE teacher_student_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can only see their own notes
CREATE POLICY "Teachers can view their own student notes"
  ON teacher_student_notes
  FOR SELECT
  USING (auth.uid() = teacher_id);

-- Policy: Teachers can only create notes as themselves
CREATE POLICY "Teachers can create student notes"
  ON teacher_student_notes
  FOR INSERT
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can only update their own notes
CREATE POLICY "Teachers can update their own student notes"
  ON teacher_student_notes
  FOR UPDATE
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Teachers can only delete their own notes
CREATE POLICY "Teachers can delete their own student notes"
  ON teacher_student_notes
  FOR DELETE
  USING (auth.uid() = teacher_id);
