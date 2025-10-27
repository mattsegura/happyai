import toast from 'react-hot-toast';
import { supabase } from './supabase';

const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Self-Hosted Error Handler
 * - Shows user-friendly toast messages
 * - Logs to Supabase database (with automatic deduplication)
 * - Sanitizes sensitive data before logging
 * - Tracks affected users and devices
 */

interface ErrorContext {
  action?: string;
  userId?: string;
  component?: string;
  metadata?: Record<string, any>;
}

// Sensitive keys that should never be logged
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'api_key', 'access_token', 'refresh_token', 'apikey'];

/**
 * Sanitize object to remove sensitive data
 */
function sanitizeData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Get browser/device information
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let osName = 'Unknown';
  let deviceType = 'desktop';

  // Detect browser
  if (ua.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.includes('Edg/')) {
    browserName = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }

  // Detect OS
  if (ua.includes('Windows')) osName = 'Windows';
  else if (ua.includes('Mac')) osName = 'macOS';
  else if (ua.includes('Linux')) osName = 'Linux';
  else if (ua.includes('Android')) osName = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) osName = 'iOS';

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    deviceType = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    deviceType = 'tablet';
  }

  return {
    userAgent: ua,
    browserName,
    browserVersion,
    osName,
    deviceType,
  };
}

/**
 * Generate error fingerprint for deduplication
 */
function generateErrorFingerprint(
  error: Error | string,
  component?: string,
  action?: string
): string {
  const message = typeof error === 'string' ? error : error.message;
  const stack = typeof error === 'string' ? '' : error.stack || '';

  // Take first 3 lines of stack trace (most relevant)
  const stackLines = stack.split('\n').slice(0, 3).join('\n');

  // Create fingerprint from message + stack + component + action
  const fingerprintString = `${message}|${stackLines}|${component || ''}|${action || ''}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprintString.length; i++) {
    const char = fingerprintString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `${Math.abs(hash).toString(36)}`;
}

/**
 * Log error to Supabase database
 */
async function logErrorToDatabase(
  error: Error | string,
  context?: ErrorContext
): Promise<void> {
  try {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const browserInfo = getBrowserInfo();
    const fingerprint = generateErrorFingerprint(errorObj, context?.component, context?.action);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get university context from stored user context
    const universityId = typeof window !== 'undefined' ? (window as any).__userContext?.universityId : null;

    // Prepare error log data
    const errorData = {
      error_fingerprint: fingerprint,
      error_message: errorObj.message,
      error_stack: errorObj.stack || null,
      component: context?.component || null,
      action: context?.action || null,
      user_id: user?.id || null,
      university_id: universityId || null,
      metadata: sanitizeData(context?.metadata || {}),
      user_agent: browserInfo.userAgent,
      browser_name: browserInfo.browserName,
      browser_version: browserInfo.browserVersion,
      os_name: browserInfo.osName,
      device_type: browserInfo.deviceType,
      url: window.location.href,
    };

    // Try to insert/update error log using upsert
    const { data: existingError } = await supabase
      .from('error_logs')
      .select('id, occurrence_count')
      .eq('error_fingerprint', fingerprint)
      .single();

    if (existingError) {
      // Update existing error (increment count, update last_seen)
      await supabase
        .from('error_logs')
        .update({
          last_seen_at: new Date().toISOString(),
          occurrence_count: existingError.occurrence_count + 1,
        })
        .eq('id', existingError.id);

      // Track affected user
      if (user?.id) {
        await supabase
          .from('error_affected_users')
          .upsert(
            {
              error_log_id: existingError.id,
              user_id: user.id,
              university_id: universityId || null,
              last_affected_at: new Date().toISOString(),
              occurrence_count: 1, // Will be incremented by trigger
            },
            {
              onConflict: 'error_log_id,user_id',
            }
          );
      }
    } else {
      // Insert new error log
      const { data: newError } = await supabase
        .from('error_logs')
        .insert(errorData)
        .select('id')
        .single();

      // Track affected user
      if (newError && user?.id) {
        await supabase.from('error_affected_users').insert({
          error_log_id: newError.id,
          user_id: user.id,
          university_id: universityId || null,
        });
      }
    }
  } catch (dbError) {
    // Failed to log to database - always log this to console for debugging
    console.error('[ErrorHandler] Failed to log error to database:', dbError);
    console.error('[ErrorHandler] Original error that failed to log:', error);
  }
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;

  // Map common errors to friendly messages
  const errorMap: Record<string, string> = {
    'Network request failed': 'Connection issue. Please check your internet.',
    'Failed to fetch': 'Unable to connect to server. Please try again.',
    'Timeout': 'Request timed out. Please try again.',
    'Unauthorized': 'Please log in to continue.',
    '403': 'You don\'t have permission for this action.',
    '404': 'Resource not found.',
    '500': 'Server error. Our team has been notified.',
    'PGRST': 'Database error. Please try again.',
  };

  for (const [key, friendlyMsg] of Object.entries(errorMap)) {
    if (message.includes(key)) {
      return friendlyMsg;
    }
  }

  // Return original message if it's user-friendly already
  if (message.length < 100 && !message.includes('Error:') && !message.includes('Exception')) {
    return message;
  }

  return 'Something went wrong. Please try again.';
}

/**
 * Handle errors with user feedback and logging
 */
export function handleError(
  error: Error | string,
  context?: ErrorContext
): void {
  const errorObj = typeof error === 'string' ? new Error(error) : error;
  const userMessage = getUserFriendlyMessage(errorObj);

  // Show user-friendly toast notification
  toast.error(userMessage, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#EF4444',
      color: '#fff',
      fontWeight: 500,
    },
  });

  // Log to Supabase database (async - don't block UI)
  logErrorToDatabase(errorObj, context).catch(() => {
    // Silent failure - error logging shouldn't break the app
  });

  // Log to console in development
  if (!IS_PRODUCTION) {
    console.error(`[${context?.component || 'App'}] ${context?.action || 'Error'}:`, errorObj);
    if (context?.metadata) {
      console.error('Context:', sanitizeData(context.metadata));
    }
  }
}

/**
 * Handle success messages
 */
export function handleSuccess(message: string): void {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10B981',
      color: '#fff',
      fontWeight: 500,
    },
  });
}

/**
 * Handle info messages
 */
export function handleInfo(message: string): void {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      background: '#3B82F6',
      color: '#fff',
      fontWeight: 500,
    },
  });
}

/**
 * Handle warning messages
 */
export function handleWarning(message: string): void {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      background: '#F59E0B',
      color: '#fff',
      fontWeight: 500,
    },
  });
}

/**
 * Track custom events (non-errors)
 * Note: For self-hosted version, this is a no-op
 * You can extend this to log to a custom analytics table if needed
 */
export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): void {
  if (!IS_PRODUCTION) {
    console.log(`[Event] ${eventName}`, properties);
  }
  // Self-hosted: Could add custom event logging to Supabase here
}

/**
 * Set user context for error tracking
 * In self-hosted version, user context is automatically captured
 * from Supabase auth in logErrorToDatabase()
 */
export function setUserContext(userId: string, email?: string, role?: string, universityId?: string): void {
  // Store university context for error logging
  if (typeof window !== 'undefined') {
    (window as any).__userContext = { userId, email, role, universityId };
  }
  if (!IS_PRODUCTION) {
    console.log('[UserContext] Set:', { userId, email, role, universityId });
  }
}

/**
 * Clear user context (on logout)
 * In self-hosted version, no action needed as context is fetched on error
 */
export function clearUserContext(): void {
  // No action needed - context is fetched fresh on each error
  if (!IS_PRODUCTION) {
    console.log('[UserContext] Cleared');
  }
}
