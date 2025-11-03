/**
 * Smart Notification System - Helper Functions
 *
 * This file contains utility functions used by the notification service
 */

import { NotificationPreferences, TimePreference } from './types';

// =====================================================
// DATE/TIME HELPERS
// =====================================================

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date | string): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate hours until a future date
 */
export function hoursUntil(futureDate: Date | string): number {
  const target = typeof futureDate === 'string' ? new Date(futureDate) : futureDate;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60)));
}

/**
 * Calculate minutes until a future date
 */
export function minutesUntil(futureDate: Date | string): number {
  const target = typeof futureDate === 'string' ? new Date(futureDate) : futureDate;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60)));
}

/**
 * Format time for display (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date for display (e.g., "Monday, Oct 30")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get start of day
 */
export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Add days to date
 */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Parse time string (HH:MM:SS) to Date object for today
 */
export function parseTime(timeString: string, _timezone?: string): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, seconds || 0, 0);
  return date;
}

// =====================================================
// QUIET HOURS LOGIC
// =====================================================

/**
 * Check if current time is within quiet hours
 */
export function isQuietHours(
  currentTime: Date,
  prefs: NotificationPreferences
): boolean {
  if (!prefs.quiet_hours_enabled) {
    return false;
  }

  const now = new Date(currentTime);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse quiet hours
  const [startHours, startMinutes] = prefs.quiet_hours_start.split(':').map(Number);
  const [endHours, endMinutes] = prefs.quiet_hours_end.split(':').map(Number);

  const startMinutesTotal = startHours * 60 + startMinutes;
  const endMinutesTotal = endHours * 60 + endMinutes;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (startMinutesTotal > endMinutesTotal) {
    return currentMinutes >= startMinutesTotal || currentMinutes <= endMinutesTotal;
  }

  // Regular quiet hours (e.g., 12:00 to 14:00)
  return currentMinutes >= startMinutesTotal && currentMinutes <= endMinutesTotal;
}

/**
 * Get the end time of quiet hours as a Date
 */
export function endOfQuietHours(prefs: NotificationPreferences): Date {
  const [hours, minutes] = prefs.quiet_hours_end.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  // If quiet hours end time has already passed today, return it for tomorrow
  if (date < new Date()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

// =====================================================
// TIMING LOGIC
// =====================================================

/**
 * Calculate optimal send time based on notification type and user preferences
 */
export function calculateOptimalSendTime(
  _userId: string,
  preference: TimePreference,
  prefs: NotificationPreferences
): Date {
  const now = new Date();

  // Immediate notifications
  if (preference.type === 'immediate') {
    if (isQuietHours(now, prefs)) {
      return endOfQuietHours(prefs);
    }
    return now;
  }

  // Get base scheduled time
  let scheduledTime = new Date(now);

  switch (preference.type) {
    case 'morning':
      scheduledTime.setHours(preference.hour || 9, preference.minute || 0, 0, 0);
      break;
    case 'afternoon':
      scheduledTime.setHours(preference.hour || 14, preference.minute || 0, 0, 0);
      break;
    case 'evening':
      scheduledTime.setHours(preference.hour || 19, preference.minute || 0, 0, 0);
      break;
    case 'weekend':
      // Next Saturday at 10am
      const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
      scheduledTime = addDays(now, daysUntilSaturday);
      scheduledTime.setHours(preference.hour || 10, preference.minute || 0, 0, 0);
      break;
  }

  // If time has passed today, schedule for tomorrow
  if (scheduledTime < now && preference.type !== 'weekend') {
    scheduledTime = addDays(scheduledTime, 1);
  }

  // Apply quiet hours
  if (isQuietHours(scheduledTime, prefs)) {
    scheduledTime = endOfQuietHours(prefs);
  }

  return scheduledTime;
}

// =====================================================
// TEMPLATE RENDERING
// =====================================================

/**
 * Render template with variables
 * Replaces {{variable}} with actual values
 */
export function renderTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }

  return result;
}

// =====================================================
// NOTIFICATION VALIDATION
// =====================================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(phone.replace(/[\s()-]/g, ''));
}

// =====================================================
// CHANNEL SELECTION
// =====================================================

/**
 * Get enabled notification channels based on preferences
 */
export function getEnabledChannels(prefs: NotificationPreferences): string[] {
  const channels: string[] = [];

  if (prefs.in_app_enabled) channels.push('in_app');
  if (prefs.email_enabled && prefs.email_address) channels.push('email');
  if (prefs.push_enabled) channels.push('push');
  if (prefs.sms_enabled && prefs.phone_number && prefs.phone_verified) channels.push('sms');

  // Always include in_app as fallback
  if (channels.length === 0) channels.push('in_app');

  return channels;
}

/**
 * Check if notification should use external channels based on priority
 */
export function shouldUseExternalChannels(
  priority: number,
  prefs: NotificationPreferences
): boolean {
  // Only use external channels for high-priority notifications (70+)
  if (priority < 70) return false;

  // Check if any external channels are enabled
  return prefs.email_enabled || prefs.push_enabled || prefs.sms_enabled;
}

// =====================================================
// PRIORITY ADJUSTMENT
// =====================================================

/**
 * Adjust notification priority based on context
 */
export function adjustPriority(
  basePriority: number,
  context: {
    hoursUntilDeadline?: number;
    moodSentiment?: number;
    previousAttempts?: number;
    userEngagement?: number;
  }
): number {
  let priority = basePriority;

  // Increase priority if deadline is very soon
  if (context.hoursUntilDeadline !== undefined && context.hoursUntilDeadline <= 24) {
    priority += 10;
  }

  // Increase priority if mood is low
  if (context.moodSentiment !== undefined && context.moodSentiment < 3) {
    priority += 5;
  }

  // Decrease priority if notification sent multiple times
  if (context.previousAttempts !== undefined && context.previousAttempts > 0) {
    priority -= context.previousAttempts * 5;
  }

  // Increase priority if user typically engages with this type
  if (context.userEngagement !== undefined && context.userEngagement > 0.7) {
    priority += 5;
  }

  // Clamp priority to valid range (0-100)
  return Math.max(0, Math.min(100, priority));
}

// =====================================================
// DATA AGGREGATION
// =====================================================

/**
 * Calculate average sentiment from mood array
 */
export function calculateAverageSentiment(moods: { sentiment: number }[]): number {
  if (moods.length === 0) return 3; // Neutral default

  const sum = moods.reduce((acc, mood) => acc + mood.sentiment, 0);
  return sum / moods.length;
}

/**
 * Detect mood trend (improving, declining, stable)
 */
export function detectMoodTrend(
  moods: { sentiment: number; check_date: string }[]
): 'improving' | 'declining' | 'stable' {
  if (moods.length < 3) return 'stable';

  // Sort by date
  const sorted = [...moods].sort(
    (a, b) => new Date(a.check_date).getTime() - new Date(b.check_date).getTime()
  );

  // Calculate trend
  const recentAvg = calculateAverageSentiment(sorted.slice(-3));
  const olderAvg = calculateAverageSentiment(sorted.slice(0, 3));

  const diff = recentAvg - olderAvg;

  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

/**
 * Count consecutive days with low mood
 */
export function countConsecutiveLowDays(
  moods: { sentiment: number; check_date: string }[],
  threshold: number = 3
): number {
  if (moods.length === 0) return 0;

  // Sort by date descending (most recent first)
  const sorted = [...moods].sort(
    (a, b) => new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
  );

  let count = 0;
  for (const mood of sorted) {
    if (mood.sentiment < threshold) {
      count++;
    } else {
      break; // Stop at first non-low mood
    }
  }

  return count;
}

// =====================================================
// WORKLOAD CALCULATION
// =====================================================

/**
 * Calculate workload percentage for a given time period
 */
export function calculateWorkloadPercentage(
  assignments: { due_at?: string; points_possible: number }[],
  studySessions: { start_time: string; end_time: string }[],
  exams: { start_at: string }[],
  startDate: Date,
  endDate: Date
): number {
  // This is a simplified calculation
  // In a real implementation, you'd factor in:
  // - Available hours per day
  // - Estimated time per assignment
  // - Scheduled events blocking time
  // - User's typical study patterns

  const assignmentsInRange = assignments.filter((a) => {
    if (!a.due_at) return false;
    const dueDate = new Date(a.due_at);
    return dueDate >= startDate && dueDate <= endDate;
  });

  const sessionsInRange = studySessions.filter((s) => {
    const startTime = new Date(s.start_time);
    return startTime >= startDate && startTime <= endDate;
  });

  const examsInRange = exams.filter((e) => {
    const examDate = new Date(e.start_at);
    return examDate >= startDate && examDate <= endDate;
  });

  // Simple heuristic: each assignment = 2 hours, each exam = 5 hours prep
  const assignmentHours = assignmentsInRange.length * 2;
  const sessionHours = sessionsInRange.reduce((acc, s) => {
    const duration =
      (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000;
    return acc + duration;
  }, 0);
  const examHours = examsInRange.length * 5;

  const totalHours = assignmentHours + sessionHours + examHours;

  // Available hours per day (assuming 8 hours of productive time per day)
  const days = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const availableHours = days * 8;

  // Return as percentage (capped at 100%)
  return Math.min(100, Math.round((totalHours / availableHours) * 100));
}

// =====================================================
// EXPORTS
// =====================================================

export const NotificationHelpers = {
  // Date/Time
  daysBetween,
  hoursUntil,
  minutesUntil,
  formatTime,
  formatDate,
  startOfDay,
  endOfDay,
  addDays,
  parseTime,

  // Quiet Hours
  isQuietHours,
  endOfQuietHours,

  // Timing
  calculateOptimalSendTime,

  // Templates
  renderTemplate,

  // Validation
  isValidEmail,
  isValidPhoneNumber,

  // Channels
  getEnabledChannels,
  shouldUseExternalChannels,

  // Priority
  adjustPriority,

  // Data Aggregation
  calculateAverageSentiment,
  detectMoodTrend,
  countConsecutiveLowDays,
  calculateWorkloadPercentage,
};
