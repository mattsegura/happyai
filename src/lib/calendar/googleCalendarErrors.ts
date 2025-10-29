/**
 * Google Calendar API Error Handling
 *
 * Custom error classes and error parsing utilities for Google Calendar API
 */

import { GOOGLE_CALENDAR_ERROR_CODES } from './googleCalendarConfig';
import type { GoogleCalendarErrorResponse } from './googleCalendarTypes';

/**
 * Base Google Calendar Error
 */
export class GoogleCalendarError extends Error {
  public code: number;
  public status?: string;
  public errors?: Array<{
    domain: string;
    reason: string;
    message: string;
  }>;

  constructor(
    message: string,
    code: number = 500,
    status?: string,
    errors?: any[]
  ) {
    super(message);
    this.name = 'GoogleCalendarError';
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Authentication Error (401, 403)
 */
export class GoogleCalendarAuthError extends GoogleCalendarError {
  constructor(message: string, code: number) {
    super(message, code);
    this.name = 'GoogleCalendarAuthError';
  }
}

/**
 * Rate Limit Error (429)
 */
export class GoogleCalendarRateLimitError extends GoogleCalendarError {
  public retryAfter?: number; // seconds

  constructor(message: string, retryAfter?: number) {
    super(message, GOOGLE_CALENDAR_ERROR_CODES.RATE_LIMIT_EXCEEDED);
    this.name = 'GoogleCalendarRateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Not Found Error (404)
 */
export class GoogleCalendarNotFoundError extends GoogleCalendarError {
  constructor(resource: string) {
    super(
      `Resource not found: ${resource}`,
      GOOGLE_CALENDAR_ERROR_CODES.NOT_FOUND
    );
    this.name = 'GoogleCalendarNotFoundError';
  }
}

/**
 * Conflict Error (409, 412)
 */
export class GoogleCalendarConflictError extends GoogleCalendarError {
  constructor(message: string, code: number = 409) {
    super(message, code);
    this.name = 'GoogleCalendarConflictError';
  }
}

/**
 * Network Error
 */
export class GoogleCalendarNetworkError extends GoogleCalendarError {
  public originalError: Error;

  constructor(message: string, originalError: Error) {
    super(message, 0);
    this.name = 'GoogleCalendarNetworkError';
    this.originalError = originalError;
  }
}

/**
 * Sync Error
 */
export class GoogleCalendarSyncError extends GoogleCalendarError {
  public syncType: string;
  public originalError?: Error;

  constructor(message: string, syncType: string, originalError?: Error) {
    super(message, 500);
    this.name = 'GoogleCalendarSyncError';
    this.syncType = syncType;
    this.originalError = originalError;
  }
}

/**
 * Parse Google Calendar API Error Response
 */
export function parseGoogleCalendarError(
  response: Response,
  body?: GoogleCalendarErrorResponse | null
): GoogleCalendarError {
  const status = response.status;
  const statusText = response.statusText;

  // If we have a parsed error body
  if (body?.error) {
    const { code, message, errors, status: errorStatus } = body.error;

    // Authentication errors
    if (
      code === GOOGLE_CALENDAR_ERROR_CODES.INVALID_CREDENTIALS ||
      code === GOOGLE_CALENDAR_ERROR_CODES.INSUFFICIENT_PERMISSIONS
    ) {
      return new GoogleCalendarAuthError(
        message || 'Authentication failed',
        code
      );
    }

    // Rate limit errors
    if (code === GOOGLE_CALENDAR_ERROR_CODES.RATE_LIMIT_EXCEEDED) {
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '60',
        10
      );
      return new GoogleCalendarRateLimitError(
        message || 'Rate limit exceeded',
        retryAfter
      );
    }

    // Not found errors
    if (code === GOOGLE_CALENDAR_ERROR_CODES.NOT_FOUND) {
      return new GoogleCalendarNotFoundError(
        message || 'Resource not found'
      );
    }

    // Conflict errors
    if (
      code === GOOGLE_CALENDAR_ERROR_CODES.CONFLICT ||
      code === GOOGLE_CALENDAR_ERROR_CODES.PRECONDITION_FAILED
    ) {
      return new GoogleCalendarConflictError(
        message || 'Conflict detected',
        code
      );
    }

    // Generic error with full details
    return new GoogleCalendarError(message, code, errorStatus, errors);
  }

  // Fallback to HTTP status codes
  switch (status) {
    case GOOGLE_CALENDAR_ERROR_CODES.INVALID_CREDENTIALS:
      return new GoogleCalendarAuthError(
        'Invalid credentials. Please re-authenticate with Google Calendar.',
        status
      );

    case GOOGLE_CALENDAR_ERROR_CODES.INSUFFICIENT_PERMISSIONS:
      return new GoogleCalendarAuthError(
        'Insufficient permissions. Please grant calendar access.',
        status
      );

    case GOOGLE_CALENDAR_ERROR_CODES.BAD_REQUEST:
      return new GoogleCalendarError(
        `Bad request: ${statusText}`,
        status
      );

    case GOOGLE_CALENDAR_ERROR_CODES.NOT_FOUND:
      return new GoogleCalendarNotFoundError('Resource not found');

    case GOOGLE_CALENDAR_ERROR_CODES.CONFLICT:
      return new GoogleCalendarConflictError('Conflict detected', status);

    case GOOGLE_CALENDAR_ERROR_CODES.RATE_LIMIT_EXCEEDED:
      const retryAfter = parseInt(
        response.headers.get('Retry-After') || '60',
        10
      );
      return new GoogleCalendarRateLimitError(
        'Rate limit exceeded. Please try again later.',
        retryAfter
      );

    case GOOGLE_CALENDAR_ERROR_CODES.BACKEND_ERROR:
    case GOOGLE_CALENDAR_ERROR_CODES.SERVICE_UNAVAILABLE:
      return new GoogleCalendarError(
        `Google Calendar service error: ${statusText}`,
        status
      );

    default:
      return new GoogleCalendarError(
        `Google Calendar API error: ${statusText}`,
        status
      );
  }
}

/**
 * Check if error requires token refresh
 */
export function requiresTokenRefresh(error: GoogleCalendarError): boolean {
  return (
    error instanceof GoogleCalendarAuthError &&
    error.code === GOOGLE_CALENDAR_ERROR_CODES.INVALID_CREDENTIALS
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: GoogleCalendarError): boolean {
  // Network errors are retryable
  if (error instanceof GoogleCalendarNetworkError) {
    return true;
  }

  // Rate limit errors are retryable (after delay)
  if (error instanceof GoogleCalendarRateLimitError) {
    return true;
  }

  // Temporary server errors are retryable
  if (
    error.code === GOOGLE_CALENDAR_ERROR_CODES.SERVICE_UNAVAILABLE ||
    error.code === GOOGLE_CALENDAR_ERROR_CODES.BACKEND_ERROR
  ) {
    return true;
  }

  return false;
}

/**
 * Get retry delay for retryable errors
 */
export function getRetryDelay(
  error: GoogleCalendarError,
  attempt: number
): number {
  // Rate limit errors have explicit retry-after
  if (error instanceof GoogleCalendarRateLimitError && error.retryAfter) {
    return error.retryAfter * 1000; // Convert to ms
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  return Math.min(1000 * Math.pow(2, attempt), 60000); // Max 60 seconds
}

/**
 * Format error message for user display
 */
export function formatErrorForUser(error: GoogleCalendarError): string {
  if (error instanceof GoogleCalendarAuthError) {
    return 'Please reconnect your Google Calendar account.';
  }

  if (error instanceof GoogleCalendarRateLimitError) {
    return `Rate limit exceeded. Please try again in ${error.retryAfter || 60} seconds.`;
  }

  if (error instanceof GoogleCalendarNotFoundError) {
    return 'Calendar or event not found. It may have been deleted.';
  }

  if (error instanceof GoogleCalendarConflictError) {
    return 'This event has been modified elsewhere. Please refresh and try again.';
  }

  if (error instanceof GoogleCalendarNetworkError) {
    return 'Network error. Please check your connection and try again.';
  }

  if (error instanceof GoogleCalendarSyncError) {
    return `Sync failed: ${error.message}`;
  }

  // Generic error
  return error.message || 'An error occurred with Google Calendar.';
}

/**
 * Log error with context
 */
export function logGoogleCalendarError(
  error: GoogleCalendarError,
  context: Record<string, any> = {}
): void {
  const logData = {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
    errors: error.errors,
    context,
    timestamp: new Date().toISOString(),
  };

  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // TODO: Send to Sentry, LogRocket, etc.
    console.error('[Google Calendar Error]', logData);
  } else {
    console.error('[Google Calendar Error]', logData);
  }
}
