/**
 * Smart Notification System - Type Definitions
 *
 * This file contains all TypeScript types and interfaces for the notification system
 */

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export type NotificationType = 'deadline' | 'mood' | 'performance' | 'ai_suggestion' | 'achievement';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';
export type TriggerType = NotificationType;

// =====================================================
// DATABASE MODELS
// =====================================================

export interface NotificationTemplate {
  id: string;
  template_key: string;
  type: NotificationType;
  title_template: string;
  body_template: string;
  action_url_template?: string;
  action_label?: string;
  priority: number;
  is_active: boolean;
  description?: string;
  created_at: string;
}

export interface NotificationQueue {
  id: string;
  user_id: string;
  university_id: string;
  template_key?: string;
  notification_type: NotificationType;
  trigger_type: TriggerType;
  title: string;
  body: string;
  action_url?: string;
  action_label?: string;
  priority: number;
  scheduled_for: string;
  sent_at?: string;
  status: NotificationStatus;
  channels: NotificationChannel[];
  read_at?: string;
  clicked_at?: string;
  dismissed_at?: string;
  metadata?: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  // Channel preferences
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  // Type preferences
  deadline_notifications: boolean;
  mood_notifications: boolean;
  performance_notifications: boolean;
  ai_suggestions: boolean;
  achievement_notifications: boolean;
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // HH:MM:SS format
  quiet_hours_end: string;
  quiet_hours_timezone: string;
  // Frequency limits
  max_notifications_per_day: number;
  min_hours_between_notifications: number;
  // Contact info
  email_address?: string;
  phone_number?: string;
  phone_verified: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface NotificationTriggersLog {
  id: string;
  user_id: string;
  trigger_type: TriggerType;
  trigger_data?: Record<string, any>;
  notification_created: boolean;
  notification_id?: string;
  reason?: string;
  created_at: string;
}

// =====================================================
// SERVICE INTERFACES
// =====================================================

export interface CreateNotificationParams {
  templateKey: string;
  variables: Record<string, any>;
  scheduledFor: Date;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface UserContext {
  userId: string;
  universityId: string;
  // Academic data
  upcomingAssignments: AssignmentContext[];
  courses: CourseContext[];
  assignments: AssignmentContext[];
  submissions: SubmissionContext[];
  upcomingSessions: StudySessionContext[];
  calendarEvents: CalendarEventContext[];
  // Mood data
  recentMood?: MoodContext;
  moodTrend: MoodTrendContext;
  // Performance data
  missingAssignments: AssignmentContext[];
  lateSubmissions: SubmissionContext[];
  recentGrades: SubmissionContext[];
  // Counts
  assignmentCount: number;
}

export interface AssignmentContext {
  id: string;
  canvas_id: string;
  course_id: string;
  name: string;
  description?: string;
  due_at?: string;
  points_possible: number;
  submission_types?: string[];
  grading_type?: string;
  published: boolean;
  missing?: boolean;
  submitted?: boolean;
}

export interface SubmissionContext {
  id: string;
  user_id: string;
  assignment_id: string;
  course_id: string;
  score?: number;
  grade?: string;
  submitted_at?: string;
  graded_at?: string;
  workflow_state: string;
  late: boolean;
  missing: boolean;
  excused: boolean;
  feedback_text?: string;
}

export interface CourseContext {
  id: string;
  canvas_id: string;
  name: string;
  currentGrade?: number;
  previousGrade?: number;
  current_score?: number;
}

export interface StudySessionContext {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  course_id?: string;
}

export interface CalendarEventContext {
  id: string;
  title: string;
  start_at: string;
  end_at?: string;
  event_type?: string;
  course_id?: string;
}

export interface MoodContext {
  emotion: string;
  sentiment: number;
  intensity: number;
  check_date: string;
}

export interface MoodTrendContext {
  average: number;
  trend: 'improving' | 'declining' | 'stable';
  recentMoods: MoodContext[];
  consecutiveLowDays: number;
}

// =====================================================
// AI SUGGESTION TYPES
// =====================================================

export interface AIStudySuggestion {
  duration: number; // hours
  when: string; // e.g., "this evening", "tomorrow morning"
  reason: string;
  suggestedTime?: Date;
}

export interface AIReviewSuggestion {
  courseName: string;
  examDate: Date;
  daysUntil: number;
  topics: string[];
  priority: number;
}

export interface WorkloadAnalysis {
  nextWeekLoad: number; // percentage (0-100)
  breakdown: {
    assignments: number;
    studySessions: number;
    exams: number;
    other: number;
  };
  recommendations: string[];
}

// =====================================================
// NOTIFICATION DISPLAY TYPES
// =====================================================

export interface NotificationDisplayItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: number;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: Date;
  isRead: boolean;
  isNew: boolean;
}

// =====================================================
// HELPER TYPES
// =====================================================

export interface TimePreference {
  type: 'morning' | 'afternoon' | 'evening' | 'weekend' | 'immediate';
  hour?: number;
  minute?: number;
}

export interface DuplicateCheckParams {
  userId: string;
  templateKey: string;
  timeWindowHours: number;
}

export interface RateLimitCheckParams {
  userId: string;
  preferences: NotificationPreferences;
}

export interface TriggerCheckResult {
  shouldTrigger: boolean;
  reason: string;
  data?: Record<string, any>;
}
