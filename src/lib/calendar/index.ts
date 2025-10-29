/**
 * Google Calendar Integration
 *
 * Main export file for Google Calendar integration
 */

// Services
export { googleCalendarService, GoogleCalendarService } from './googleCalendarService';
export { calendarSyncService, CalendarSyncService } from './calendarSyncService';
export type { SyncResult, SyncProgressCallback } from './calendarSyncService';

// Configuration
export {
  GOOGLE_CALENDAR_CONFIG,
  GOOGLE_CALENDAR_ENDPOINTS,
  GOOGLE_CALENDAR_ERROR_CODES,
  DEFAULT_CALENDAR_SETTINGS,
  DEFAULT_REMINDERS,
  GOOGLE_EVENT_COLOR_IDS,
  OAUTH_SCOPES_INFO,
} from './googleCalendarConfig';

// Types
export type {
  GoogleCalendarToken,
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleEventDateTime,
  GoogleCalendarListResponse,
  GoogleEventsListResponse,
  GoogleWatchChannel,
  GoogleWatchResponse,
  GoogleWebhookNotification,
  GetEventsOptions,
  EventOptions,
  SyncStatus,
  SyncDirection,
  EventSource,
  ConflictResolution,
  CalendarConnection,
  CalendarEventMapping,
  CalendarSyncConflict,
  UnifiedCalendarEvent,
  GoogleCalendarErrorResponse,
} from './googleCalendarTypes';

// Errors
export {
  GoogleCalendarError,
  GoogleCalendarAuthError,
  GoogleCalendarRateLimitError,
  GoogleCalendarNotFoundError,
  GoogleCalendarConflictError,
  GoogleCalendarNetworkError,
  GoogleCalendarSyncError,
  parseGoogleCalendarError,
  requiresTokenRefresh,
  isRetryableError,
  getRetryDelay,
  formatErrorForUser,
  logGoogleCalendarError,
} from './googleCalendarErrors';

// Event Transformers
export {
  canvasEventToGoogleEvent,
  hapiStudySessionToGoogleEvent,
  googleEventToHapiEvent,
  generateEventHash,
  hasEventChanged,
  detectConflict,
  extractEventSource,
  isEventEditable,
  isEventDeletable,
  getEventColorBySource,
} from './eventTransformers';
