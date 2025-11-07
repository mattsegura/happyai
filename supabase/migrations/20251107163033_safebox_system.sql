-- =============================================
-- SafeBox Anonymous Feedback System
-- Phase 8 - Teacher View
-- =============================================
-- This migration creates tables for anonymous student feedback
-- with ZERO-KNOWLEDGE architecture (no way to identify authors)
-- =============================================

-- =============================================
-- Table: safebox_messages
-- Purpose: Store anonymous student feedback messages
-- CRITICAL: NO user_id column to ensure complete anonymity
-- =============================================
CREATE TABLE IF NOT EXISTS safebox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

  -- Message content
  message_text TEXT NOT NULL CHECK (char_length(message_text) > 0 AND char_length(message_text) <= 2000),

  -- AI Moderation results
  sentiment INTEGER CHECK (sentiment BETWEEN 1 AND 6), -- 1=most negative, 6=most positive
  ai_moderation_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_moderation_status IN ('pending', 'approved', 'flagged', 'rejected')),
  ai_detected_themes TEXT[], -- Array of theme tags (e.g., 'homework_load', 'teaching_style', 'class_pace')
  is_urgent BOOLEAN DEFAULT false, -- Flagged for urgent safety concerns
  moderation_notes TEXT, -- AI explanation for flagging

  -- Metadata
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Indexes for performance
  CONSTRAINT safebox_message_length CHECK (char_length(message_text) >= 10)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_safebox_messages_class_id ON safebox_messages(class_id);
CREATE INDEX IF NOT EXISTS idx_safebox_messages_submitted_at ON safebox_messages(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_safebox_messages_class_time ON safebox_messages(class_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_safebox_messages_urgent ON safebox_messages(is_urgent) WHERE is_urgent = true;
CREATE INDEX IF NOT EXISTS idx_safebox_messages_sentiment ON safebox_messages(sentiment) WHERE sentiment IS NOT NULL;

-- =============================================
-- Table: safebox_responses
-- Purpose: Store teacher's anonymous class-wide responses
-- Teachers can respond to collective feedback but NOT to individual messages
-- =============================================
CREATE TABLE IF NOT EXISTS safebox_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Response content
  response_text TEXT NOT NULL CHECK (char_length(response_text) > 0 AND char_length(response_text) <= 1000),

  -- Metadata
  posted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT safebox_response_length CHECK (char_length(response_text) >= 10)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_safebox_responses_class_id ON safebox_responses(class_id);
CREATE INDEX IF NOT EXISTS idx_safebox_responses_posted_at ON safebox_responses(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_safebox_responses_teacher_id ON safebox_responses(teacher_id);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on both tables
ALTER TABLE safebox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE safebox_responses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies for safebox_messages
-- =============================================

-- Students can insert messages (anonymous - no user tracking)
-- IMPORTANT: This policy allows ANY authenticated user to submit
-- We rely on app-level class membership checks, not database constraints
CREATE POLICY "Students can submit anonymous SafeBox messages"
  ON safebox_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow any authenticated user to submit

-- Teachers can view messages ONLY from their classes
CREATE POLICY "Teachers can view SafeBox messages from their classes"
  ON safebox_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = safebox_messages.class_id
      AND c.teacher_id = auth.uid()
    )
  );

-- Only system/admin can update messages (for moderation)
CREATE POLICY "Only admins can update SafeBox messages"
  ON safebox_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- No one can delete messages (preserve anonymity and audit trail)
-- Admins can use soft-delete via ai_moderation_status = 'rejected'

-- =============================================
-- RLS Policies for safebox_responses
-- =============================================

-- Teachers can insert responses ONLY for their classes
CREATE POLICY "Teachers can post SafeBox responses to their classes"
  ON safebox_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = safebox_responses.class_id
      AND c.teacher_id = auth.uid()
    )
    AND teacher_id = auth.uid()
  );

-- Teachers can view their own responses
CREATE POLICY "Teachers can view their own SafeBox responses"
  ON safebox_responses
  FOR SELECT
  TO authenticated
  USING (teacher_id = auth.uid());

-- Students can view responses for classes they're in
CREATE POLICY "Students can view SafeBox responses for their classes"
  ON safebox_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      WHERE cm.class_id = safebox_responses.class_id
      AND cm.user_id = auth.uid()
    )
  );

-- Teachers can update/delete their own responses
CREATE POLICY "Teachers can update their own SafeBox responses"
  ON safebox_responses
  FOR UPDATE
  TO authenticated
  USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own SafeBox responses"
  ON safebox_responses
  FOR DELETE
  TO authenticated
  USING (teacher_id = auth.uid());

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE safebox_messages IS 'Anonymous student feedback messages - ZERO-KNOWLEDGE architecture ensures complete anonymity';
COMMENT ON COLUMN safebox_messages.message_text IS 'Student feedback content (10-2000 characters)';
COMMENT ON COLUMN safebox_messages.ai_moderation_status IS 'AI moderation result: pending, approved, flagged, rejected';
COMMENT ON COLUMN safebox_messages.ai_detected_themes IS 'Array of AI-detected themes like homework_load, teaching_style, class_pace';
COMMENT ON COLUMN safebox_messages.is_urgent IS 'Flagged for urgent safety concerns (self-harm, bullying, etc.)';

COMMENT ON TABLE safebox_responses IS 'Teacher anonymous class-wide responses to SafeBox feedback';
COMMENT ON COLUMN safebox_responses.response_text IS 'Teacher response content (10-1000 characters)';
