# Hapi.ai Setup Guide

## Database Setup

The database schema has been created with the following tables:
- `profiles` - User profiles with points and streaks
- `classes` - Classroom information
- `class_members` - Student-class relationships
- `pulse_checks` - Daily emotional check-ins
- `class_pulses` - Teacher questions (expire at midnight)
- `class_pulse_responses` - Student answers
- `hapi_moments` - Peer recognition
- `achievements` - Unlockable badges
- `sentiment_history` - Emotional trend data

## Creating Test Data

To test the application, you'll need to create some test data in your Supabase database.

### 1. Create a Test Class

Run this in the Supabase SQL Editor:

```sql
INSERT INTO classes (name, description, teacher_name, class_code)
VALUES
  ('Math 101', 'Introduction to Mathematics', 'Ms. Johnson', 'MATH101'),
  ('Science 201', 'General Science', 'Mr. Smith', 'SCI201');
```

### 2. Create Class Pulses (Teacher Questions)

After students join classes, teachers can post questions:

```sql
-- Get a class_id first
SELECT id FROM classes WHERE class_code = 'MATH101';

-- Then create a pulse (replace the class_id and teacher_id)
INSERT INTO class_pulses (class_id, teacher_id, question, expires_at, is_active)
VALUES
  (
    'YOUR_CLASS_ID_HERE',
    'YOUR_USER_ID_HERE',
    'How are you feeling about tomorrow''s quiz?',
    (CURRENT_DATE + INTERVAL '1 day')::timestamptz,
    true
  );
```

### 3. Using the App

1. **Sign Up**: Create a new account with email and password
2. **Join a Class**: Enter a class code (e.g., `MATH101` or `SCI201`)
3. **Complete Morning Pulse**: Check in with your emotions daily
4. **Answer Class Pulses**: Respond to teacher questions before midnight
5. **Send Hapi Moments**: Recognize classmates for positive actions
6. **Check Leaderboard**: See class rankings and compete for points

## Features

### Morning Pulse Check
- Daily emotional check-in
- Earn 10 points per check-in
- Build your streak for consecutive days

### Class Pulses
- Teacher-posted questions
- Expire at midnight automatically
- Earn 10 points per response

### Hapi Moments
- Send positive messages to classmates
- Both sender and recipient earn 5 points
- Build a supportive classroom community

### Leaderboard
- Class-specific rankings
- See your position and points
- Compete with classmates

### Points & Levels
- Level up every 100 points
- Track your total points across all activities
- Maintain streaks for daily engagement

## Environment Variables

The app requires the following environment variables (already configured in `.env`):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
