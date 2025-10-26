import { supabase } from './supabase';

// Only log in development mode
const DEBUG = import.meta.env.DEV;

/**
 * Audit Log Utility
 * Tracks all admin actions for compliance and debugging
 */

export type AdminAction =
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'create_class'
  | 'update_class'
  | 'delete_class'
  | 'enroll_student'
  | 'remove_student'
  | 'update_settings'
  | 'generate_report'
  | 'export_data';

export type TargetType = 'user' | 'class' | 'class_member' | 'settings' | 'report';

interface LogOptions {
  action: AdminAction;
  targetType: TargetType;
  targetId?: string;
  details?: Record<string, any>;
}

/**
 * Log an admin action to the audit trail
 * Automatically captures admin ID from current session
 */
export async function logAdminAction(options: LogOptions): Promise<void> {
  try {
    const { action, targetType, targetId, details } = options;

    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (DEBUG) console.warn('[Audit] No user session - skipping audit log');
      return;
    }

    // Insert audit log
    const { error } = await supabase.from('admin_audit_logs').insert({
      user_id: user.id,
      action,
      target_type: targetType,
      target_id: targetId || null,
      details: details || null,
    });

    if (error) {
      // Audit failures are critical - throw error instead of silent failure
      throw new Error(`Audit log failed: ${error.message}`);
    }

    if (DEBUG) console.log('[Audit] Logged action:', action, targetType, targetId);
  } catch (err) {
    if (DEBUG) console.error('[Audit] Exception logging action:', err);
    // Re-throw to ensure audit failures are visible
    throw err;
  }
}

/**
 * Get audit logs for a specific admin (optional)
 * If no adminId provided, returns all logs (admin-only)
 */
export async function getAuditLogs(adminId?: string, limit: number = 100) {
  try {
    let query = supabase
      .from('admin_audit_logs')
      .select(
        `
        id,
        action,
        target_type,
        target_id,
        details,
        created_at,
        profiles!admin_audit_logs_user_id_fkey(full_name, email)
      `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (adminId) {
      query = query.eq('user_id', adminId);
    }

    const { data, error } = await query;

    if (error) {
      if (DEBUG) console.error('[Audit] Error fetching logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    if (DEBUG) console.error('[Audit] Exception fetching logs:', err);
    return [];
  }
}

/**
 * Get audit logs for a specific target (user, class, etc.)
 */
export async function getTargetAuditLogs(targetType: TargetType, targetId: string) {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select(
        `
        id,
        action,
        details,
        created_at,
        profiles!admin_audit_logs_user_id_fkey(full_name, email)
      `
      )
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      if (DEBUG) console.error('[Audit] Error fetching target logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    if (DEBUG) console.error('[Audit] Exception fetching target logs:', err);
    return [];
  }
}

/**
 * Format action for display
 */
export function formatAction(action: AdminAction): string {
  const actionMap: Record<AdminAction, string> = {
    create_user: 'Created User',
    update_user: 'Updated User',
    delete_user: 'Deleted User',
    create_class: 'Created Class',
    update_class: 'Updated Class',
    delete_class: 'Deleted Class',
    enroll_student: 'Enrolled Student',
    remove_student: 'Removed Student',
    update_settings: 'Updated Settings',
    generate_report: 'Generated Report',
    export_data: 'Exported Data',
  };

  return actionMap[action] || action;
}

/**
 * Example usage:
 *
 * // When creating a user
 * await logAdminAction({
 *   action: 'create_user',
 *   targetType: 'user',
 *   targetId: newUserId,
 *   details: { email: 'user@example.com', role: 'student' }
 * });
 *
 * // When updating a class
 * await logAdminAction({
 *   action: 'update_class',
 *   targetType: 'class',
 *   targetId: classId,
 *   details: { old_name: 'Math 101', new_name: 'Mathematics 101' }
 * });
 */
