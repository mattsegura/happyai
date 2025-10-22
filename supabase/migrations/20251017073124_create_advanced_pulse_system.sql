/*
  # Advanced Multi-Question Pulse System

  ## Overview
  This migration creates a comprehensive pulse check system supporting 11 different question types
  with multi-question pulses, progress tracking, and flexible response storage.

  ## New Tables Created

  1. **pulse_check_sets**
     - Replaces the simple class_pulses with full pulse sets
     - Fields: id, class_id, teacher_id, title, description, expires_at, is_active, is_draft, 
       scheduled_for, total_points, created_at, updated_at
     - Represents a complete pulse check that can contain multiple questions

  2. **pulse_questions**
     - Individual questions within a pulse set
     - Fields: id, pulse_set_id, question_text, question_type, position, is_required, 
       points_value, configuration, created_at
     - Supports 11 question types via the question_type enum
     - Uses JSONB for flexible configuration per question type

  3. **question_options**
     - Answer choices for poll, multiple choice, and ranking questions
     - Fields: id, question_id, option_text, option_value, position, created_at
     - Ordered by position for proper display

  4. **pulse_responses**
     - Stores student responses to pulse questions
     - Fields: id, pulse_set_id, user_id, class_id, is_completed, total_points_earned, 
       started_at, completed_at, created_at
     - Tracks completion status and timing

  5. **question_responses**
     - Individual question answers with flexible JSONB storage
     - Fields: id, pulse_response_id, question_id, user_id, response_data, points_earned, 
       answered_at
     - response_data stored as JSONB to handle all question types

  6. **response_progress**
     - Tracks partial completion for save-and-continue functionality
     - Fields: id, pulse_set_id, user_id, last_question_id, progress_data, updated_at
     - Allows students to resume incomplete pulses

  7. **pulse_templates**
     - Reusable pulse templates for teachers
     - Fields: id, creator_id, template_name, description, category, is_public, 
       template_data, usage_count, created_at, updated_at
     - Stores complete pulse configuration as JSONB

  ## Question Types Supported
  - poll: Simple voting with options
  - multiple_choice_single: Choose one answer
  - multiple_choice_multi: Choose multiple answers
  - open_ended: Long-form text response
  - slider: Numeric value selection
  - calendar: Date selection (single, range, multiple)
  - rating_scale: Numeric rating with visual indicators
  - ranking: Order items by preference
  - short_answer: Brief text response with word limit
  - yes_no_maybe: Three-option quick response
  - likert_scale: Agreement scale for statements

  ## Security
  - RLS enabled on all tables
  - Teachers can only create/edit their own pulse sets
  - Students can only view active pulses for their classes
  - Students can only submit responses to their own class pulses
  - Teachers can view all responses for their classes

  ## Indexes
  - Foreign key indexes for performance
  - Composite indexes for common queries
  - JSONB indexes for response_data queries
*/

-- Create question type enum
DO $$ BEGIN
  CREATE TYPE question_type_enum AS ENUM (
    'poll',
    'multiple_choice_single',
    'multiple_choice_multi',
    'open_ended',
    'slider',
    'calendar',
    'rating_scale',
    'ranking',
    'short_answer',
    'yes_no_maybe',
    'likert_scale'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create pulse_check_sets table
CREATE TABLE IF NOT EXISTS pulse_check_sets (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  is_draft boolean DEFAULT false,
  scheduled_for timestamptz,
  total_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pulse_questions table
CREATE TABLE IF NOT EXISTS pulse_questions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pulse_set_id uuid NOT NULL REFERENCES pulse_check_sets(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type question_type_enum NOT NULL,
  position integer NOT NULL DEFAULT 0,
  is_required boolean DEFAULT true,
  points_value integer DEFAULT 10,
  configuration jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create question_options table
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  question_id uuid NOT NULL REFERENCES pulse_questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_value text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create pulse_responses table
CREATE TABLE IF NOT EXISTS pulse_responses (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pulse_set_id uuid NOT NULL REFERENCES pulse_check_sets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  total_points_earned integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(pulse_set_id, user_id)
);

-- Create question_responses table
CREATE TABLE IF NOT EXISTS question_responses (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pulse_response_id uuid NOT NULL REFERENCES pulse_responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES pulse_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_data jsonb NOT NULL,
  points_earned integer DEFAULT 0,
  answered_at timestamptz DEFAULT now(),
  UNIQUE(pulse_response_id, question_id)
);

-- Create response_progress table
CREATE TABLE IF NOT EXISTS response_progress (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  pulse_set_id uuid NOT NULL REFERENCES pulse_check_sets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_question_id uuid REFERENCES pulse_questions(id) ON DELETE SET NULL,
  progress_data jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(pulse_set_id, user_id)
);

-- Create pulse_templates table
CREATE TABLE IF NOT EXISTS pulse_templates (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  is_public boolean DEFAULT false,
  template_data jsonb NOT NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pulse_check_sets_class_id ON pulse_check_sets(class_id);
CREATE INDEX IF NOT EXISTS idx_pulse_check_sets_teacher_id ON pulse_check_sets(teacher_id);
CREATE INDEX IF NOT EXISTS idx_pulse_check_sets_active ON pulse_check_sets(is_active, expires_at);

CREATE INDEX IF NOT EXISTS idx_pulse_questions_pulse_set_id ON pulse_questions(pulse_set_id);
CREATE INDEX IF NOT EXISTS idx_pulse_questions_position ON pulse_questions(pulse_set_id, position);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_position ON question_options(question_id, position);

CREATE INDEX IF NOT EXISTS idx_pulse_responses_pulse_set_id ON pulse_responses(pulse_set_id);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_user_id ON pulse_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_completed ON pulse_responses(is_completed, pulse_set_id);

CREATE INDEX IF NOT EXISTS idx_question_responses_pulse_response_id ON question_responses(pulse_response_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON question_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_data ON question_responses USING gin(response_data);

CREATE INDEX IF NOT EXISTS idx_response_progress_user_pulse ON response_progress(user_id, pulse_set_id);

CREATE INDEX IF NOT EXISTS idx_pulse_templates_creator ON pulse_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_pulse_templates_category ON pulse_templates(category, is_public);

-- Enable Row Level Security
ALTER TABLE pulse_check_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pulse_check_sets
CREATE POLICY "Teachers can create pulse sets for their classes"
  ON pulse_check_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = teacher_id AND
    EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = pulse_check_sets.class_id
      AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view their own pulse sets"
  ON pulse_check_sets FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Students can view active pulse sets for their classes"
  ON pulse_check_sets FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    is_draft = false AND
    expires_at > now() AND
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = pulse_check_sets.class_id
      AND class_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update their own pulse sets"
  ON pulse_check_sets FOR UPDATE
  TO authenticated
  USING (auth.uid() = teacher_id)
  WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own pulse sets"
  ON pulse_check_sets FOR DELETE
  TO authenticated
  USING (auth.uid() = teacher_id);

-- RLS Policies for pulse_questions
CREATE POLICY "Teachers can manage questions for their pulse sets"
  ON pulse_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_questions.pulse_set_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view questions for active pulses in their classes"
  ON pulse_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_check_sets
      JOIN class_members ON class_members.class_id = pulse_check_sets.class_id
      WHERE pulse_check_sets.id = pulse_questions.pulse_set_id
      AND class_members.user_id = auth.uid()
      AND pulse_check_sets.is_active = true
      AND pulse_check_sets.is_draft = false
      AND pulse_check_sets.expires_at > now()
    )
  );

-- RLS Policies for question_options
CREATE POLICY "Teachers can manage options for their questions"
  ON question_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_questions
      JOIN pulse_check_sets ON pulse_check_sets.id = pulse_questions.pulse_set_id
      WHERE pulse_questions.id = question_options.question_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view options for accessible questions"
  ON question_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_questions
      JOIN pulse_check_sets ON pulse_check_sets.id = pulse_questions.pulse_set_id
      JOIN class_members ON class_members.class_id = pulse_check_sets.class_id
      WHERE pulse_questions.id = question_options.question_id
      AND class_members.user_id = auth.uid()
      AND pulse_check_sets.is_active = true
      AND pulse_check_sets.is_draft = false
    )
  );

-- RLS Policies for pulse_responses
CREATE POLICY "Students can create responses for their class pulses"
  ON pulse_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.user_id = auth.uid()
      AND class_members.class_id = pulse_responses.class_id
    ) AND
    EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_responses.pulse_set_id
      AND pulse_check_sets.class_id = pulse_responses.class_id
      AND pulse_check_sets.is_active = true
      AND pulse_check_sets.expires_at > now()
    )
  );

CREATE POLICY "Students can view their own responses"
  ON pulse_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view responses for their pulse sets"
  ON pulse_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_check_sets
      WHERE pulse_check_sets.id = pulse_responses.pulse_set_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own incomplete responses"
  ON pulse_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND is_completed = false)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for question_responses
CREATE POLICY "Students can create their own question responses"
  ON question_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM pulse_responses
      WHERE pulse_responses.id = question_responses.pulse_response_id
      AND pulse_responses.user_id = auth.uid()
    )
  );

CREATE POLICY "Students can view their own question responses"
  ON question_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Teachers can view question responses for their pulses"
  ON question_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pulse_responses
      JOIN pulse_check_sets ON pulse_check_sets.id = pulse_responses.pulse_set_id
      WHERE pulse_responses.id = question_responses.pulse_response_id
      AND pulse_check_sets.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can update their own incomplete question responses"
  ON question_responses FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM pulse_responses
      WHERE pulse_responses.id = question_responses.pulse_response_id
      AND pulse_responses.is_completed = false
    )
  )
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for response_progress
CREATE POLICY "Students can manage their own progress"
  ON response_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pulse_templates
CREATE POLICY "Teachers can create templates"
  ON pulse_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Teachers can view their own templates"
  ON pulse_templates FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id OR is_public = true);

CREATE POLICY "Teachers can update their own templates"
  ON pulse_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Teachers can delete their own templates"
  ON pulse_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Create function to update pulse_check_sets.updated_at
CREATE OR REPLACE FUNCTION update_pulse_check_sets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pulse_check_sets updated_at
DROP TRIGGER IF EXISTS pulse_check_sets_updated_at ON pulse_check_sets;
CREATE TRIGGER pulse_check_sets_updated_at
  BEFORE UPDATE ON pulse_check_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_check_sets_updated_at();

-- Create function to update pulse_templates.updated_at
CREATE OR REPLACE FUNCTION update_pulse_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for pulse_templates updated_at
DROP TRIGGER IF EXISTS pulse_templates_updated_at ON pulse_templates;
CREATE TRIGGER pulse_templates_updated_at
  BEFORE UPDATE ON pulse_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_pulse_templates_updated_at();

-- Create function to calculate total points for a pulse set
CREATE OR REPLACE FUNCTION calculate_pulse_set_points(pulse_set_uuid uuid)
RETURNS integer AS $$
  SELECT COALESCE(SUM(points_value), 0)::integer
  FROM pulse_questions
  WHERE pulse_set_id = pulse_set_uuid;
$$ LANGUAGE sql STABLE;