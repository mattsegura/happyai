/**
 * Notification Service
 *
 * Handles in-app notifications and email notification triggers
 * for the Care Alerts system.
 */

import { supabase } from '../supabase';
import type { RiskSeverity } from '../alerts/atRiskDetection';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  enable_in_app: boolean;
  enable_email_alerts: boolean;
  email_alert_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  enable_push_alerts: boolean;
  enable_quiet_hours: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  notify_critical_alerts: boolean;
  notify_high_alerts: boolean;
  notify_medium_alerts: boolean;
  notify_emotional_alerts: boolean;
  notify_academic_alerts: boolean;
  notify_intervention_responses: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  notification_type: 'care_alert' | 'intervention_update' | 'student_recovery' | 'weekly_summary' | 'system_message';
  title: string;
  message: string;
  link_url: string | null;
  link_text: string | null;
  student_id: string | null;
  class_id: string | null;
  alert_id: string | null;
  severity: 'info' | 'medium' | 'high' | 'critical' | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If preferences don't exist, create default ones
      if (error.code === 'PGRST116') {
        return await createDefaultPreferences(userId);
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

/**
 * Create default notification preferences for a user
 */
async function createDefaultPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: userId,
        enable_in_app: true,
        enable_email_alerts: true,
        email_alert_frequency: 'immediate',
        enable_push_alerts: false,
        enable_quiet_hours: false,
        notify_critical_alerts: true,
        notify_high_alerts: true,
        notify_medium_alerts: true,
        notify_emotional_alerts: true,
        notify_academic_alerts: true,
        notify_intervention_responses: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating default preferences:', error);
    return null;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .update(preferences)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

/**
 * Check if user should receive notification based on preferences
 */
async function shouldNotify(
  userId: string,
  severity: RiskSeverity,
  type: 'emotional' | 'academic'
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs) return true; // Default to sending if no preferences

  // Check if in-app notifications are enabled
  if (!prefs.enable_in_app) return false;

  // Check severity preferences
  if (severity === 'critical' && !prefs.notify_critical_alerts) return false;
  if (severity === 'high' && !prefs.notify_high_alerts) return false;
  if (severity === 'medium' && !prefs.notify_medium_alerts) return false;

  // Check type preferences
  if (type === 'emotional' && !prefs.notify_emotional_alerts) return false;
  if (type === 'academic' && !prefs.notify_academic_alerts) return false;

  // Check quiet hours
  if (prefs.enable_quiet_hours && prefs.quiet_hours_start && prefs.quiet_hours_end) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const start = prefs.quiet_hours_start;
    const end = prefs.quiet_hours_end;

    // Simple time comparison (doesn't handle overnight ranges)
    if (start < end) {
      if (currentTime >= start && currentTime <= end) {
        return false; // In quiet hours
      }
    }
  }

  return true;
}

/**
 * Create a care alert notification
 */
export async function sendCareAlertNotification(
  teacherId: string,
  studentId: string,
  studentName: string,
  alertType: string,
  severity: RiskSeverity,
  alertId?: string
): Promise<boolean> {
  try {
    // Check if teacher should receive notification
    const type: 'emotional' | 'academic' =
      alertType.includes('academic') ? 'academic' : 'emotional';

    const shouldSend = await shouldNotify(teacherId, severity, type);
    if (!shouldSend) {
      return false;
    }

    // Call database function to create notification
    const { error } = await supabase.rpc('create_care_alert_notification', {
      teacher_id_param: teacherId,
      student_id_param: studentId,
      student_name_param: studentName,
      alert_type_param: alertType,
      severity_param: severity,
      alert_id_param: alertId || null,
    });

    if (error) throw error;

    // If email notifications are enabled, trigger email
    const prefs = await getNotificationPreferences(teacherId);
    if (prefs?.enable_email_alerts && prefs.email_alert_frequency === 'immediate') {
      await triggerEmailNotification(teacherId, studentName, alertType, severity);
    }

    return true;
  } catch (error) {
    console.error('Error sending care alert notification:', error);
    return false;
  }
}

/**
 * Trigger email notification (via Edge Function)
 */
async function triggerEmailNotification(
  teacherId: string,
  studentName: string,
  alertType: string,
  severity: RiskSeverity
): Promise<void> {
  try {
    // Call Edge Function to send email
    // Note: This assumes you have a send-care-alert-email Edge Function
    const { error } = await supabase.functions.invoke('send-care-alert-email', {
      body: {
        teacherId,
        studentName,
        alertType,
        severity,
      },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error triggering email notification:', error);
    // Don't throw - email is not critical, just log the error
  }
}

/**
 * Get all notifications for a user
 */
export async function getNotifications(
  userId: string,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_unread_notification_count', {
      user_uid: userId,
    });

    if (error) throw error;
    return data || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('mark_notification_read', {
      notification_id_param: notificationId,
      user_id_param: userId,
    });

    if (error) throw error;
    return data || false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('mark_all_notifications_read', {
      user_id_param: userId,
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Notification) => void
) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
