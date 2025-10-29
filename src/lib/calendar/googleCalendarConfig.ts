/**
 * Google Calendar API Configuration
 *
 * Configuration for Google Calendar API v3 integration
 */

/**
 * Google Calendar API Configuration
 */
export const GOOGLE_CALENDAR_CONFIG = {
  // API Base URL
  API_BASE_URL: 'https://www.googleapis.com/calendar/v3',

  // OAuth Configuration
  OAUTH: {
    AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
    TOKEN_URL: 'https://oauth2.googleapis.com/token',
    SCOPES: [
      'https://www.googleapis.com/auth/calendar', // Full calendar access
      'https://www.googleapis.com/auth/calendar.events', // Event access
    ],
    // Client ID and Secret should be in environment variables
    CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    REDIRECT_URI:
      import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
      'http://localhost:5173/api/auth/google/callback',
  },

  // Rate Limiting (Google Calendar API limits)
  RATE_LIMIT: {
    REQUESTS_PER_DAY: 10000, // Per project
    REQUESTS_PER_USER_DAY: 1000, // Reasonable per-user limit
    REQUESTS_PER_SECOND: 10, // Queries per second
  },

  // Request Configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_PAGE_SIZE: 250, // Max events per page (Google limit: 2500)

  // Sync Configuration
  SYNC_INTERVAL_MS: 15 * 60 * 1000, // 15 minutes (default)
  INCREMENTAL_SYNC_ENABLED: true,
  MAX_SYNC_RETRIES: 3,
  SYNC_RETRY_DELAY_MS: 5000,

  // Webhook Configuration
  WEBHOOK: {
    ENABLED: true,
    TTL_DAYS: 7, // Google webhook channels expire after ~7 days
    RENEWAL_BUFFER_HOURS: 24, // Renew 24 hours before expiration
    VERIFICATION_TOKEN: import.meta.env.VITE_GOOGLE_WEBHOOK_TOKEN || '',
  },

  // Cache Configuration
  CACHE: {
    ENABLED: true,
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // Max cached items
  },

  // Color Codes for Event Sources
  EVENT_COLORS: {
    CANVAS: '#4285F4', // Blue
    HAPI: '#9C27B0', // Purple
    GOOGLE: '#0B8043', // Green
  },

  // Conflict Resolution
  CONFLICT_RESOLUTION: {
    AUTO_RESOLVE_ENABLED: true,
    PRIORITY: ['canvas', 'hapi', 'google'] as const, // Priority order for auto-resolution
    MAX_CONFLICT_AGE_DAYS: 30, // Auto-ignore conflicts older than 30 days
  },

  // Feature Flags
  FEATURES: {
    SYNC_CANVAS_EVENTS: true,
    SYNC_STUDY_SESSIONS: true,
    SYNC_EXTERNAL_EVENTS: true,
    CONFLICT_DETECTION: true,
    AUTOMATIC_SYNC: true,
    WEBHOOK_NOTIFICATIONS: true,
  },
};

/**
 * Google Calendar API Endpoints
 */
export const GOOGLE_CALENDAR_ENDPOINTS = {
  // Calendar List
  CALENDAR_LIST: '/users/me/calendarList',
  CALENDAR_GET: (calendarId: string) => `/users/me/calendarList/${encodeURIComponent(calendarId)}`,

  // Events
  EVENTS_LIST: (calendarId: string) => `/calendars/${encodeURIComponent(calendarId)}/events`,
  EVENT_GET: (calendarId: string, eventId: string) =>
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  EVENT_INSERT: (calendarId: string) => `/calendars/${encodeURIComponent(calendarId)}/events`,
  EVENT_UPDATE: (calendarId: string, eventId: string) =>
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  EVENT_DELETE: (calendarId: string, eventId: string) =>
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
  EVENT_PATCH: (calendarId: string, eventId: string) =>
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,

  // Watch (Webhooks)
  EVENTS_WATCH: (calendarId: string) =>
    `/calendars/${encodeURIComponent(calendarId)}/events/watch`,
  CHANNELS_STOP: '/channels/stop',

  // Colors
  COLORS: '/colors',

  // FreeBusy
  FREEBUSY: '/freeBusy',
};

/**
 * Google Calendar Error Codes
 */
export const GOOGLE_CALENDAR_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 401,
  INSUFFICIENT_PERMISSIONS: 403,

  // Client errors
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PRECONDITION_FAILED: 412,

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 429,

  // Server errors
  BACKEND_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Default Calendar Settings
 */
export const DEFAULT_CALENDAR_SETTINGS = {
  syncDirection: 'both' as const,
  syncCanvasEvents: true,
  syncStudySessions: true,
  syncExternalEvents: true,
  sendUpdates: 'none' as const,
  conferenceDataVersion: 1,
  supportsAttachments: false,
};

/**
 * Google Calendar Reminders
 */
export const DEFAULT_REMINDERS = {
  useDefault: false,
  overrides: [
    { method: 'popup' as const, minutes: 30 }, // 30 minutes before
    { method: 'popup' as const, minutes: 10 }, // 10 minutes before
  ],
};

/**
 * Event Type Colors (Google Calendar color IDs)
 */
export const GOOGLE_EVENT_COLOR_IDS = {
  CANVAS_ASSIGNMENT: '9', // Blue
  HAPI_STUDY_SESSION: '3', // Purple
  CANVAS_EXAM: '11', // Red
  CANVAS_QUIZ: '6', // Orange
  GENERAL: '1', // Lavender (default)
} as const;

/**
 * OAuth Scopes Explanation
 */
export const OAUTH_SCOPES_INFO = {
  'https://www.googleapis.com/auth/calendar': {
    name: 'Full Calendar Access',
    description:
      'Allows the app to view and manage all your calendars and events',
    required: true,
  },
  'https://www.googleapis.com/auth/calendar.events': {
    name: 'Calendar Events',
    description: 'Allows the app to view and manage events on your calendars',
    required: true,
  },
};
