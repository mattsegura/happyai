// University type
export type University = {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  avatar_url: string | null;
  total_points: number;
  current_streak: number;
  last_pulse_check_date: string | null;
  university_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Class = {
  id: string;
  name: string;
  description: string | null;
  teacher_name: string;
  teacher_id: string | null;
  class_code: string;
  university_id: string;
  created_at: string;
  updated_at: string;
};

export type ClassMember = {
  id: string;
  user_id: string;
  class_id: string;
  class_points: number;
  university_id: string;
  joined_at: string;
};

export type PulseCheck = {
  id: string;
  user_id: string;
  class_id: string;
  emotion: string;
  intensity: number;
  notes: string | null;
  university_id: string;
  created_at: string;
  check_date: string;
};

export type ClassPulse = {
  id: string;
  class_id: string;
  teacher_id: string;
  question: string;
  question_type: string;
  answer_choices: string[] | null;
  expires_at: string;
  is_active: boolean;
  university_id: string;
  created_at: string;
};

export type ClassPulseResponse = {
  id: string;
  class_pulse_id: string;
  user_id: string;
  class_id: string;
  response_text: string;
  points_earned: number;
  university_id: string;
  created_at: string;
};

export type HapiMoment = {
  id: string;
  sender_id: string;
  recipient_id: string;
  class_id: string;
  message: string;
  sender_points: number;
  recipient_points: number;
  university_id: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string | null;
  icon_name: string | null;
  unlocked_at: string;
};

export type SentimentHistory = {
  id: string;
  user_id: string | null;
  class_id: string | null;
  date: string;
  emotion: string;
  intensity: number;
  is_aggregate: boolean;
  created_at: string;
};

export type OfficeHour = {
  id: string;
  teacher_id: string;
  class_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  max_queue_size: number;
  is_active: boolean;
  notes: string | null;
  university_id: string;
  created_at: string;
  updated_at: string;
};

export type OfficeHoursQueue = {
  id: string;
  office_hour_id: string;
  student_id: string;
  status: 'waiting' | 'in_session' | 'completed' | 'cancelled';
  reason: string | null;
  university_id: string;
  joined_at: string;
  started_at: string | null;
  completed_at: string | null;
  position: number | null;
};

export type CanvasToken = {
  id: string;
  user_id: string;
  university_id: string;
  canvas_instance_url: string;
  canvas_user_id: string | null;
  access_token: string; // Encrypted
  refresh_token: string | null; // Encrypted
  token_type: string;
  expires_at: string | null;
  scope: string | null;
  is_valid: boolean;
  last_validated_at: string | null;
  encryption_key_id: string;
  encrypted_at: string;
  token_hash: string | null;
  rotation_count: number;
  last_rotation_at: string | null;
  force_rotation: boolean;
  created_at: string;
  updated_at: string;
};

export type TeacherStudentNote = {
  id: string;
  teacher_id: string;
  student_id: string;
  class_id: string | null;
  note_text: string;
  note_type: 'general' | 'academic' | 'wellbeing' | 'behavioral' | 'intervention' | 'meeting';
  is_private: boolean;
  is_flagged: boolean;
  tags: string[];
  university_id: string;
  created_at: string;
  updated_at: string;
};

export * from './pulseTypes';

// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
