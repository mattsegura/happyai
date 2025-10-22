/*
  # Hapi.ai Initial Database Schema

  ## Overview
  This migration creates the complete database schema for the Hapi.ai student emotional wellness app.

  ## Tables Created

  1. **profiles** - Extended user profile information
  2. **classes** - Individual classroom groups
  3. **class_members** - Junction table linking students to classes
  4. **pulse_checks** - Daily morning emotional check-ins
  5. **class_pulses** - Teacher-posted questions with midnight expiration
  6. **class_pulse_responses** - Student answers to class pulses
  7. **hapi_moments** - Peer recognition and shoutouts
  8. **achievements** - Unlockable badges and milestones
  9. **sentiment_history** - Aggregated emotional trends

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure students access only their own data and class data
  - Authenticated users required for all operations
*/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  last_pulse_check_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  teacher_name text NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  class_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Class members junction table
CREATE TABLE IF NOT EXISTS class_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  class_points integer DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(user_id, class_id)
);

ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;

-- Now add class policy that references class_members
CREATE POLICY "Class members can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = classes.id
      AND class_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their class memberships"
  ON class_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their class memberships"
  ON class_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Class members can view other members in their classes"
  ON class_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_members cm
      WHERE cm.class_id = class_members.class_id
      AND cm.user_id = auth.uid()
    )
  );

-- Pulse checks table
CREATE TABLE IF NOT EXISTS pulse_checks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  emotion text NOT NULL,
  intensity integer DEFAULT 5,
  notes text,
  created_at timestamptz DEFAULT now(),
  check_date date DEFAULT CURRENT_DATE
);

ALTER TABLE pulse_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pulse checks"
  ON pulse_checks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pulse checks"
  ON pulse_checks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Class pulses table
CREATE TABLE IF NOT EXISTS class_pulses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  question_type text DEFAULT 'text',
  answer_choices jsonb,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE class_pulses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Class members can view pulses in their classes"
  ON class_pulses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = class_pulses.class_id
      AND class_members.user_id = auth.uid()
    )
  );

-- Class pulse responses table
CREATE TABLE IF NOT EXISTS class_pulse_responses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_pulse_id uuid REFERENCES class_pulses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  response_text text NOT NULL,
  points_earned integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  UNIQUE(class_pulse_id, user_id)
);

ALTER TABLE class_pulse_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pulse responses"
  ON class_pulse_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pulse responses"
  ON class_pulse_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Hapi moments table
CREATE TABLE IF NOT EXISTS hapi_moments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  sender_points integer DEFAULT 5,
  recipient_points integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hapi_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hapi moments they sent or received"
  ON hapi_moments FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert hapi moments they send"
  ON hapi_moments FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_type text NOT NULL,
  title text NOT NULL,
  description text,
  icon_name text,
  unlocked_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Sentiment history table
CREATE TABLE IF NOT EXISTS sentiment_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  emotion text NOT NULL,
  intensity integer DEFAULT 5,
  is_aggregate boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, class_id, date)
);

ALTER TABLE sentiment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sentiment history"
  ON sentiment_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_members_user_id ON class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_class_members_class_id ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_user_id ON pulse_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_checks_date ON pulse_checks(check_date);
CREATE INDEX IF NOT EXISTS idx_class_pulses_class_id ON class_pulses(class_id);
CREATE INDEX IF NOT EXISTS idx_class_pulses_expires_at ON class_pulses(expires_at);
CREATE INDEX IF NOT EXISTS idx_hapi_moments_sender ON hapi_moments(sender_id);
CREATE INDEX IF NOT EXISTS idx_hapi_moments_recipient ON hapi_moments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_history_user_date ON sentiment_history(user_id, date);
