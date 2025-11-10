/**
 * Google Calendar Service
 *
 * Main service for interacting with Google Calendar API v3
 * Handles OAuth, CRUD operations, and webhook management
 */

import { supabase } from '../supabase';
import {
  GOOGLE_CALENDAR_CONFIG,
  GOOGLE_CALENDAR_ENDPOINTS,
  DEFAULT_REMINDERS,
} from './googleCalendarConfig';
import {
  parseGoogleCalendarError,
  requiresTokenRefresh,
  GoogleCalendarNetworkError,
  GoogleCalendarAuthError,
  logGoogleCalendarError,
} from './googleCalendarErrors';
import type {
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleCalendarListResponse,
  GoogleEventsListResponse,
  GoogleWatchChannel,
  GoogleWatchResponse,
  GetEventsOptions,
  EventOptions,
  GoogleEventDateTime,
} from './googleCalendarTypes';

/**
 * Google Calendar Service Class
 */
class GoogleCalendarService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = GOOGLE_CALENDAR_CONFIG.API_BASE_URL;
  }

  // ============================================================================
  // OAUTH & TOKEN MANAGEMENT
  // ============================================================================

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CALENDAR_CONFIG.OAUTH.CLIENT_ID,
      redirect_uri: GOOGLE_CALENDAR_CONFIG.OAUTH.REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_CALENDAR_CONFIG.OAUTH.SCOPES.join(' '),
      access_type: 'offline', // Get refresh token
      prompt: 'consent', // Force consent screen to get refresh token
      state: state || crypto.randomUUID(),
    });

    return `${GOOGLE_CALENDAR_CONFIG.OAUTH.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Get access token for user and calendar
   */
  private async getAccessToken(calendarId: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new GoogleCalendarAuthError(
        'User not authenticated',
        401
      );
    }

    // Call database function to get and decrypt token
    const { data, error } = await supabase.rpc('get_google_calendar_token', {
      p_user_id: user.id,
      p_calendar_id: calendarId,
    });

    if (error || !data || !data[0]) {
      logGoogleCalendarError(
        new GoogleCalendarAuthError('Failed to retrieve token', 401),
        { user_id: user.id, calendar_id: calendarId, db_error: error }
      );
      throw new GoogleCalendarAuthError(
        'Google Calendar not connected. Please connect your account.',
        401
      );
    }

    const tokenData = data[0];

    // Check if token needs refresh
    // NOTE: Token refresh is handled automatically server-side via database function
    // The deprecated refreshAccessToken method should not be called
    if (tokenData.needs_refresh && tokenData.decrypted_refresh_token) {
      throw new GoogleCalendarAuthError(
        'Token refresh required. Please reconnect your Google Calendar.',
        401
      );
    }

    return tokenData.decrypted_access_token;
  }

  // ============================================================================
  // API REQUEST HELPERS
  // ============================================================================

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    calendarId: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const accessToken = await this.getAccessToken(calendarId);
      const url = `${this.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: AbortSignal.timeout(GOOGLE_CALENDAR_CONFIG.REQUEST_TIMEOUT),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const error = parseGoogleCalendarError(response, errorBody);

        // Attempt token refresh if needed
        if (requiresTokenRefresh(error)) {
          console.log('[Google Calendar] Token expired, retrying with refreshed token');
          // Retry once after refresh
          return this.makeRequest(endpoint, calendarId, options);
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new GoogleCalendarNetworkError(
          'Network error. Please check your connection.',
          error
        );
      }
      throw error;
    }
  }

  // ============================================================================
  // CALENDAR OPERATIONS
  // ============================================================================

  /**
   * Get list of user's calendars
   */
  async getCalendars(): Promise<GoogleCalendar[]> {
    // Get list of connected calendars for this user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new GoogleCalendarAuthError('User not authenticated', 401);

    const { data: connections } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .eq('sync_enabled', true);

    if (!connections || connections.length === 0) {
      return [];
    }

    // Use first connection to get calendar list (they all use same Google account)
    const firstConnection = connections[0];

    const response = await this.makeRequest<GoogleCalendarListResponse>(
      GOOGLE_CALENDAR_ENDPOINTS.CALENDAR_LIST,
      firstConnection.calendar_id,
      { method: 'GET' }
    );

    return response.items;
  }

  /**
   * Get specific calendar
   */
  async getCalendar(calendarId: string): Promise<GoogleCalendar> {
    return await this.makeRequest<GoogleCalendar>(
      GOOGLE_CALENDAR_ENDPOINTS.CALENDAR_GET(calendarId),
      calendarId,
      { method: 'GET' }
    );
  }

  // ============================================================================
  // EVENT OPERATIONS
  // ============================================================================

  /**
   * Get events from calendar
   */
  async getEvents(
    calendarId: string,
    options?: GetEventsOptions
  ): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams();

    if (options?.timeMin) params.set('timeMin', options.timeMin);
    if (options?.timeMax) params.set('timeMax', options.timeMax);
    if (options?.q) params.set('q', options.q);
    if (options?.showDeleted !== undefined)
      params.set('showDeleted', String(options.showDeleted));
    if (options?.singleEvents !== undefined)
      params.set('singleEvents', String(options.singleEvents));
    if (options?.orderBy) params.set('orderBy', options.orderBy);
    if (options?.syncToken) params.set('syncToken', options.syncToken);

    params.set(
      'maxResults',
      String(options?.maxResults || GOOGLE_CALENDAR_CONFIG.MAX_PAGE_SIZE)
    );

    if (options?.pageToken) params.set('pageToken', options.pageToken);

    const endpoint = `${GOOGLE_CALENDAR_ENDPOINTS.EVENTS_LIST(calendarId)}?${params.toString()}`;

    const response = await this.makeRequest<GoogleEventsListResponse>(
      endpoint,
      calendarId,
      { method: 'GET' }
    );

    // TODO: Handle pagination if needed
    return response.items;
  }

  /**
   * Get single event
   */
  async getEvent(
    calendarId: string,
    eventId: string
  ): Promise<GoogleCalendarEvent> {
    return await this.makeRequest<GoogleCalendarEvent>(
      GOOGLE_CALENDAR_ENDPOINTS.EVENT_GET(calendarId, eventId),
      calendarId,
      { method: 'GET' }
    );
  }

  /**
   * Create event
   */
  async createEvent(
    calendarId: string,
    event: Partial<GoogleCalendarEvent>,
    options?: EventOptions
  ): Promise<GoogleCalendarEvent> {
    const params = new URLSearchParams();
    if (options?.sendUpdates) params.set('sendUpdates', options.sendUpdates);
    if (options?.conferenceDataVersion)
      params.set('conferenceDataVersion', String(options.conferenceDataVersion));

    // Add default reminders if not specified
    if (!event.reminders) {
      event.reminders = DEFAULT_REMINDERS;
    }

    const endpoint = `${GOOGLE_CALENDAR_ENDPOINTS.EVENT_INSERT(calendarId)}${params.toString() ? '?' + params.toString() : ''}`;

    return await this.makeRequest<GoogleCalendarEvent>(
      endpoint,
      calendarId,
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    );
  }

  /**
   * Update event (full replacement)
   */
  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    options?: EventOptions
  ): Promise<GoogleCalendarEvent> {
    const params = new URLSearchParams();
    if (options?.sendUpdates) params.set('sendUpdates', options.sendUpdates);

    const endpoint = `${GOOGLE_CALENDAR_ENDPOINTS.EVENT_UPDATE(calendarId, eventId)}${params.toString() ? '?' + params.toString() : ''}`;

    return await this.makeRequest<GoogleCalendarEvent>(
      endpoint,
      calendarId,
      {
        method: 'PUT',
        body: JSON.stringify(event),
      }
    );
  }

  /**
   * Patch event (partial update)
   */
  async patchEvent(
    calendarId: string,
    eventId: string,
    changes: Partial<GoogleCalendarEvent>,
    options?: EventOptions
  ): Promise<GoogleCalendarEvent> {
    const params = new URLSearchParams();
    if (options?.sendUpdates) params.set('sendUpdates', options.sendUpdates);

    const endpoint = `${GOOGLE_CALENDAR_ENDPOINTS.EVENT_PATCH(calendarId, eventId)}${params.toString() ? '?' + params.toString() : ''}`;

    return await this.makeRequest<GoogleCalendarEvent>(
      endpoint,
      calendarId,
      {
        method: 'PATCH',
        body: JSON.stringify(changes),
      }
    );
  }

  /**
   * Delete event
   */
  async deleteEvent(
    calendarId: string,
    eventId: string,
    options?: EventOptions
  ): Promise<void> {
    const params = new URLSearchParams();
    if (options?.sendUpdates) params.set('sendUpdates', options.sendUpdates);

    const endpoint = `${GOOGLE_CALENDAR_ENDPOINTS.EVENT_DELETE(calendarId, eventId)}${params.toString() ? '?' + params.toString() : ''}`;

    await this.makeRequest<void>(endpoint, calendarId, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // WEBHOOK OPERATIONS
  // ============================================================================

  /**
   * Set up webhook for calendar changes
   */
  async watchCalendar(
    calendarId: string,
    webhookUrl: string,
    channelId?: string
  ): Promise<GoogleWatchResponse> {
    const channel: GoogleWatchChannel = {
      id: channelId || crypto.randomUUID(),
      type: 'web_hook',
      address: webhookUrl,
      params: {
        ttl: String(GOOGLE_CALENDAR_CONFIG.WEBHOOK.TTL_DAYS * 24 * 60 * 60 * 1000), // milliseconds
      },
    };

    if (GOOGLE_CALENDAR_CONFIG.WEBHOOK.VERIFICATION_TOKEN) {
      channel.token = GOOGLE_CALENDAR_CONFIG.WEBHOOK.VERIFICATION_TOKEN;
    }

    const response = await this.makeRequest<GoogleWatchResponse>(
      GOOGLE_CALENDAR_ENDPOINTS.EVENTS_WATCH(calendarId),
      calendarId,
      {
        method: 'POST',
        body: JSON.stringify(channel),
      }
    );

    // Store webhook info in database
    await supabase
      .from('calendar_connections')
      .update({
        webhook_channel_id: response.id,
        webhook_resource_id: response.resourceId,
        webhook_expiration: new Date(parseInt(response.expiration)).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('calendar_id', calendarId)
      .eq('provider', 'google');

    return response;
  }

  /**
   * Stop watching calendar
   */
  async stopWatching(channelId: string, resourceId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new GoogleCalendarAuthError('User not authenticated', 401);

    // Get any calendar ID from this user (needed for auth)
    const { data: connection } = await supabase
      .from('calendar_connections')
      .select('calendar_id')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .limit(1)
      .single();

    if (!connection) return;

    await this.makeRequest<void>(
      GOOGLE_CALENDAR_ENDPOINTS.CHANNELS_STOP,
      connection.calendar_id,
      {
        method: 'POST',
        body: JSON.stringify({
          id: channelId,
          resourceId: resourceId,
        }),
      }
    );

    // Clear webhook info from database
    await supabase
      .from('calendar_connections')
      .update({
        webhook_channel_id: null,
        webhook_resource_id: null,
        webhook_expiration: null,
        updated_at: new Date().toISOString(),
      })
      .eq('webhook_channel_id', channelId);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Convert Date to Google Event DateTime
   */
  toGoogleDateTime(date: Date, allDay: boolean = false, timeZone?: string): GoogleEventDateTime {
    if (allDay) {
      return {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
      };
    } else {
      return {
        dateTime: date.toISOString(),
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  }

  /**
   * Convert Google Event DateTime to Date
   */
  fromGoogleDateTime(googleDateTime: GoogleEventDateTime): Date {
    if (googleDateTime.date) {
      return new Date(googleDateTime.date);
    } else if (googleDateTime.dateTime) {
      return new Date(googleDateTime.dateTime);
    }
    throw new Error('Invalid Google DateTime format');
  }
}

// Export singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export class for testing
export { GoogleCalendarService };
