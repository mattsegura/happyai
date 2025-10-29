/**
 * Canvas API Error Classes
 *
 * Custom error types for handling Canvas LMS API errors.
 * Provides specific error types for different failure scenarios.
 */

/**
 * Base Canvas API error
 */
export class CanvasApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly response?: any;
  public readonly timestamp: string;

  constructor(message: string, status: number, code?: string, response?: any) {
    super(message);
    this.name = 'CanvasApiError';
    this.status = status;
    this.code = code;
    this.response = response;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CanvasApiError);
    }
  }

  /**
   * Check if error is retryable
   */
  get isRetryable(): boolean {
    // Network errors, server errors, and rate limits are retryable
    return (
      this.status === 0 || // Network error
      this.status === 429 || // Rate limit
      this.status === 500 || // Internal server error
      this.status === 502 || // Bad gateway
      this.status === 503 || // Service unavailable
      this.status === 504 // Gateway timeout
    );
  }

  /**
   * Get user-friendly error message
   */
  get userMessage(): string {
    switch (this.status) {
      case 0:
        return 'Network error. Please check your internet connection.';
      case 401:
        return 'Canvas authentication failed. Please reconnect your Canvas account.';
      case 403:
        return 'Access denied. You may not have permission to access this Canvas resource.';
      case 404:
        return 'Canvas resource not found.';
      case 429:
        return 'Too many requests to Canvas. Please wait a moment and try again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Canvas service is temporarily unavailable. Please try again later.';
      default:
        return this.message || 'An error occurred while communicating with Canvas.';
    }
  }
}

/**
 * Authentication/Authorization errors (401, 403)
 */
export class CanvasAuthError extends CanvasApiError {
  constructor(message: string, status: 401 | 403, code?: string, response?: any) {
    super(message, status, code, response);
    this.name = 'CanvasAuthError';
  }

  get isRetryable(): boolean {
    return false; // Auth errors require user action
  }
}

/**
 * Rate limit exceeded error (429)
 */
export class CanvasRateLimitError extends CanvasApiError {
  public readonly retryAfter?: number; // Seconds to wait

  constructor(message: string, retryAfter?: number, response?: any) {
    super(message, 429, 'rate_limit_exceeded', response);
    this.name = 'CanvasRateLimitError';
    this.retryAfter = retryAfter;
  }

  get isRetryable(): boolean {
    return true;
  }

  get userMessage(): string {
    if (this.retryAfter) {
      const minutes = Math.ceil(this.retryAfter / 60);
      return `Rate limit exceeded. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
    }
    return 'Rate limit exceeded. Please wait a moment and try again.';
  }
}

/**
 * Resource not found error (404)
 */
export class CanvasNotFoundError extends CanvasApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(
    message: string,
    resourceType?: string,
    resourceId?: string,
    response?: any
  ) {
    super(message, 404, 'not_found', response);
    this.name = 'CanvasNotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  get isRetryable(): boolean {
    return false; // Resource not found won't be fixed by retrying
  }

  get userMessage(): string {
    if (this.resourceType) {
      return `Canvas ${this.resourceType} not found.`;
    }
    return 'Canvas resource not found.';
  }
}

/**
 * Network error (no response from server)
 */
export class CanvasNetworkError extends CanvasApiError {
  constructor(message: string, originalError?: Error) {
    super(message, 0, 'network_error', originalError);
    this.name = 'CanvasNetworkError';
  }

  get isRetryable(): boolean {
    return true;
  }

  get userMessage(): string {
    return 'Network error. Please check your internet connection and try again.';
  }
}

/**
 * Server error (500, 502, 503, 504)
 */
export class CanvasServerError extends CanvasApiError {
  constructor(message: string, status: 500 | 502 | 503 | 504, response?: any) {
    super(message, status, 'server_error', response);
    this.name = 'CanvasServerError';
  }

  get isRetryable(): boolean {
    return true;
  }

  get userMessage(): string {
    return 'Canvas service is temporarily unavailable. Please try again in a few minutes.';
  }
}

/**
 * Validation error (400)
 */
export class CanvasValidationError extends CanvasApiError {
  public readonly errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>, response?: any) {
    super(message, 400, 'validation_error', response);
    this.name = 'CanvasValidationError';
    this.errors = errors;
  }

  get isRetryable(): boolean {
    return false; // Validation errors require fixing the request
  }
}

/**
 * Token expired error (specific type of auth error)
 */
export class CanvasTokenExpiredError extends CanvasAuthError {
  constructor(message: string = 'Canvas access token has expired', response?: any) {
    super(message, 401, 'token_expired', response);
    this.name = 'CanvasTokenExpiredError';
  }

  get userMessage(): string {
    return 'Your Canvas connection has expired. Please reconnect your Canvas account.';
  }
}

/**
 * Sync error (wraps errors that occur during sync operations)
 */
export class CanvasSyncError extends Error {
  public readonly syncType: string;
  public readonly originalError: Error;
  public readonly timestamp: string;

  constructor(message: string, syncType: string, originalError: Error) {
    super(message);
    this.name = 'CanvasSyncError';
    this.syncType = syncType;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CanvasSyncError);
    }
  }

  get userMessage(): string {
    if (this.originalError instanceof CanvasApiError) {
      return this.originalError.userMessage;
    }
    return `Failed to sync ${this.syncType} from Canvas. ${this.originalError.message}`;
  }
}

/**
 * Parse Canvas API error response and create appropriate error instance
 */
export function parseCanvasError(
  response: Response,
  responseBody?: any
): CanvasApiError {
  const status = response.status;
  const statusText = response.statusText;

  // Extract error message from response body
  let message = statusText;
  let errors: Record<string, string[]> | undefined;

  if (responseBody) {
    if (typeof responseBody === 'object') {
      message = responseBody.message || responseBody.error || statusText;
      errors = responseBody.errors;
    } else if (typeof responseBody === 'string') {
      message = responseBody;
    }
  }

  // Parse retry-after header for rate limits
  let retryAfter: number | undefined;
  const retryAfterHeader = response.headers.get('Retry-After');
  if (retryAfterHeader) {
    retryAfter = parseInt(retryAfterHeader, 10);
  }

  // Create specific error type based on status code
  switch (status) {
    case 401:
      // Check if token expired
      if (message.toLowerCase().includes('expired') ||
          message.toLowerCase().includes('invalid_token')) {
        return new CanvasTokenExpiredError(message, responseBody);
      }
      return new CanvasAuthError(message, 401, undefined, responseBody);

    case 403:
      return new CanvasAuthError(message, 403, undefined, responseBody);

    case 404:
      return new CanvasNotFoundError(message, undefined, undefined, responseBody);

    case 429:
      return new CanvasRateLimitError(message, retryAfter, responseBody);

    case 400:
      return new CanvasValidationError(message, errors, responseBody);

    case 500:
    case 502:
    case 503:
    case 504:
      return new CanvasServerError(message, status as 500 | 502 | 503 | 504, responseBody);

    default:
      return new CanvasApiError(message, status, undefined, responseBody);
  }
}

/**
 * Check if error is a Canvas API error
 */
export function isCanvasError(error: unknown): error is CanvasApiError {
  return error instanceof CanvasApiError;
}

/**
 * Check if error requires token refresh
 */
export function requiresTokenRefresh(error: unknown): boolean {
  return error instanceof CanvasTokenExpiredError;
}

/**
 * Check if error requires user reauthentication
 */
export function requiresReauth(error: unknown): boolean {
  return error instanceof CanvasAuthError;
}
