/**
 * Date Utilities
 *
 * Centralized date formatting and manipulation utilities.
 * Use these instead of inline date formatting to maintain consistency.
 *
 * Created: 2025-11-04 (Phase 3: Code Deduplication)
 */

/**
 * Get current date/time as ISO string
 * Use this instead of: new Date().toISOString()
 */
export function getCurrentDateISO(): string {
  return new Date().toISOString();
}

/**
 * Format date to local date string
 * Use this instead of: new Date(date).toLocaleDateString()
 */
export function formatDateLocal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString();
}

/**
 * Format date to local date and time string
 * Use this instead of: new Date(date).toLocaleString()
 */
export function formatDateTimeLocal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

/**
 * Format date to readable format (e.g., "Jan 15, 2025")
 */
export function formatDateReadable(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date to short format (e.g., "Jan 15")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTimeOnly(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * Imported from utils.ts for consistency
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return then.toLocaleDateString();
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < new Date().getTime();
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > new Date().getTime();
}

/**
 * Check if a date is within the next N days
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const future = new Date();
  future.setDate(future.getDate() + days);
  return d.getTime() <= future.getTime() && d.getTime() >= new Date().getTime();
}

/**
 * Get date N days from now
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get date N days ago
 */
export function subtractDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Get start of day (midnight)
 */
export function startOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (11:59:59.999 PM)
 */
export function endOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get number of days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get number of hours between two dates
 */
export function hoursBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (1000 * 60 * 60));
}

/**
 * Format duration in milliseconds to human readable (e.g., "2h 30m")
 */
export function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return 'Less than a minute';
  }
}

/**
 * Check if date is due soon (within 24 hours)
 */
export function isDueSoon(dueDate: Date | string): boolean {
  return isWithinDays(dueDate, 1) && isFuture(dueDate);
}

/**
 * Check if date is overdue
 */
export function isOverdue(dueDate: Date | string): boolean {
  return isPast(dueDate);
}

/**
 * Format date for API calls (ISO 8601)
 */
export function formatForAPI(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Parse date string safely
 * Returns null if invalid
 */
export function parseDateSafe(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Get week number of year
 */
export function getWeekNumber(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  const oneJan = new Date(d.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
}

/**
 * Get day of week name (e.g., "Monday")
 */
export function getDayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get month name (e.g., "January")
 */
export function getMonthName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'long' });
}
