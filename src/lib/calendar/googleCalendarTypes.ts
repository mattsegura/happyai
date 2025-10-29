/**
 * Google Calendar API Type Definitions
 *
 * Based on Google Calendar API v3
 * https://developers.google.com/calendar/api/v3/reference
 */

/**
 * Google Calendar OAuth Token
 */
export interface GoogleCalendarToken {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in?: number; // seconds
  expires_at?: string; // ISO timestamp
  scope?: string;
}

/**
 * Google Calendar
 */
export interface GoogleCalendar {
  kind: 'calendar#calendarListEntry';
  etag: string;
  id: string; // Calendar identifier
  summary: string; // Title of the calendar
  description?: string;
  location?: string;
  timeZone: string;
  summaryOverride?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  hidden?: boolean;
  selected?: boolean;
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader';
  defaultReminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
  notificationSettings?: {
    notifications: Array<{
      type: string;
      method: string;
    }>;
  };
  primary?: boolean;
  deleted?: boolean;
}

/**
 * Google Calendar Event
 */
export interface GoogleCalendarEvent {
  kind: 'calendar#event';
  etag: string;
  id: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink?: string;
  created: string; // ISO timestamp
  updated: string; // ISO timestamp
  summary: string; // Event title
  description?: string;
  location?: string;
  colorId?: string;
  creator?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  start: GoogleEventDateTime;
  end: GoogleEventDateTime;
  endTimeUnspecified?: boolean;
  recurrence?: string[]; // RRULE strings
  recurringEventId?: string;
  originalStartTime?: GoogleEventDateTime;
  transparency?: 'opaque' | 'transparent';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  iCalUID: string;
  sequence: number;
  attendees?: Array<{
    id?: string;
    email?: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
    resource?: boolean;
    optional?: boolean;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    comment?: string;
    additionalGuests?: number;
  }>;
  attendeesOmitted?: boolean;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  hangoutLink?: string;
  conferenceData?: any;
  gadget?: any;
  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  source?: {
    url: string;
    title: string;
  };
  attachments?: Array<{
    fileUrl: string;
    title: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  eventType?: 'default' | 'outOfOffice' | 'focusTime';
}

/**
 * Google Event Date/Time
 */
export interface GoogleEventDateTime {
  date?: string; // YYYY-MM-DD for all-day events
  dateTime?: string; // RFC3339 timestamp for specific time events
  timeZone?: string;
}

/**
 * Google Calendar List Response
 */
export interface GoogleCalendarListResponse {
  kind: 'calendar#calendarList';
  etag: string;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendar[];
}

/**
 * Google Calendar Events List Response
 */
export interface GoogleEventsListResponse {
  kind: 'calendar#events';
  etag: string;
  summary: string; // Calendar title
  description?: string;
  updated: string; // ISO timestamp
  timeZone: string;
  accessRole: string;
  defaultReminders?: Array<{
    method: string;
    minutes: number;
  }>;
  nextPageToken?: string;
  nextSyncToken?: string;
  items: GoogleCalendarEvent[];
}

/**
 * Google Calendar Watch Channel (for webhooks)
 */
export interface GoogleWatchChannel {
  id: string; // Channel ID
  type: 'web_hook';
  address: string; // Webhook URL
  params?: {
    ttl?: string;
  };
  expiration?: number; // Unix timestamp in milliseconds
  resourceId?: string; // Opaque ID for the watched resource
  resourceUri?: string; // API URL for the watched resource
  token?: string; // Optional token for webhook verification
}

/**
 * Google Calendar Watch Response
 */
export interface GoogleWatchResponse {
  kind: 'api#channel';
  id: string;
  resourceId: string;
  resourceUri: string;
  expiration: string; // Unix timestamp in milliseconds as string
}

/**
 * Google Calendar Webhook Notification
 */
export interface GoogleWebhookNotification {
  channelId: string;
  resourceId: string;
  resourceUri: string;
  resourceState: 'sync' | 'exists' | 'not_exists';
  expiration?: string; // Unix timestamp in milliseconds
  token?: string;
}

/**
 * Options for fetching events
 */
export interface GetEventsOptions {
  timeMin?: string; // RFC3339 timestamp
  timeMax?: string; // RFC3339 timestamp
  q?: string; // Search query
  showDeleted?: boolean;
  singleEvents?: boolean; // Expand recurring events
  orderBy?: 'startTime' | 'updated';
  maxResults?: number;
  pageToken?: string;
  syncToken?: string; // For incremental sync
}

/**
 * Options for creating/updating events
 */
export interface EventOptions {
  sendUpdates?: 'all' | 'externalOnly' | 'none';
  conferenceDataVersion?: number;
  maxAttendees?: number;
  supportsAttachments?: boolean;
}

/**
 * Calendar sync status
 */
export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error';

/**
 * Calendar sync direction
 */
export type SyncDirection = 'both' | 'to_hapi' | 'to_google' | 'disabled';

/**
 * Event source system
 */
export type EventSource = 'canvas' | 'hapi' | 'google';

/**
 * Conflict resolution action
 */
export type ConflictResolution =
  | 'keep_canvas'
  | 'keep_hapi'
  | 'keep_google'
  | 'merge'
  | 'delete_all'
  | 'manual';

/**
 * Calendar connection (local database representation)
 */
export interface CalendarConnection {
  id: string;
  user_id: string;
  university_id: string;
  provider: 'google' | 'outlook' | 'apple';
  calendar_id: string;
  calendar_name?: string;
  calendar_timezone: string;
  access_token: string; // Encrypted
  refresh_token?: string; // Encrypted
  token_expires_at?: string;
  scope?: string;
  sync_enabled: boolean;
  sync_direction: SyncDirection;
  sync_canvas_events: boolean;
  sync_study_sessions: boolean;
  sync_external_events: boolean;
  last_sync_at?: string;
  last_sync_status?: 'success' | 'error' | 'partial' | 'pending';
  last_sync_error?: string;
  next_sync_at?: string;
  webhook_channel_id?: string;
  webhook_resource_id?: string;
  webhook_expiration?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Calendar event mapping (local database representation)
 */
export interface CalendarEventMapping {
  id: string;
  user_id: string;
  university_id: string;
  calendar_connection_id?: string;
  hapi_event_id?: string;
  hapi_event_type?: 'study_session' | 'canvas_event';
  canvas_event_id?: string;
  google_event_id?: string;
  event_title: string;
  event_start: string;
  event_end: string;
  event_description?: string;
  event_location?: string;
  all_day: boolean;
  source_system: EventSource;
  created_by_system: EventSource;
  last_modified_at: string;
  last_modified_by: 'canvas' | 'hapi' | 'google' | 'user';
  hapi_version_hash?: string;
  google_version_hash?: string;
  sync_status: SyncStatus;
  sync_error?: string;
  deleted_in_canvas: boolean;
  deleted_in_hapi: boolean;
  deleted_in_google: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Calendar sync conflict
 */
export interface CalendarSyncConflict {
  id: string;
  user_id: string;
  university_id: string;
  event_mapping_id?: string;
  conflict_type:
    | 'time_change'
    | 'content_change'
    | 'deletion_conflict'
    | 'duplicate_event'
    | 'location_change';
  conflict_description: string;
  canvas_version?: any;
  hapi_version?: any;
  google_version?: any;
  resolution_status: 'pending' | 'resolved' | 'ignored' | 'auto_resolved';
  resolution_action?: ConflictResolution;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  auto_resolve_attempted: boolean;
  auto_resolve_failed_reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Unified calendar event (for display)
 */
export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  start: string; // ISO timestamp
  end: string; // ISO timestamp
  allDay: boolean;
  description?: string;
  location?: string;
  source: EventSource;
  calendarName?: string;
  colorCode: string;
  editable: boolean; // Can user edit this event?
  deletable: boolean; // Can user delete this event?
  conflicted: boolean; // Has unresolved conflicts?
}

/**
 * Google Calendar API Error Response
 */
export interface GoogleCalendarErrorResponse {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      domain: string;
      reason: string;
      message: string;
      locationType?: string;
      location?: string;
    }>;
    status?: string;
  };
}
