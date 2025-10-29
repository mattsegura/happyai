/**
 * Calendar Sync Service
 *
 * Orchestrates bi-directional sync between Canvas, Hapi, and Google Calendar
 * Handles conflict detection, resolution, and webhook processing
 */

import { supabase } from '../supabase';
import { googleCalendarService } from './googleCalendarService';
import {
  canvasEventToGoogleEvent,
  hapiStudySessionToGoogleEvent,
  generateEventHash,
} from './eventTransformers';
import {
  GoogleCalendarSyncError,
} from './googleCalendarErrors';
import type {
  CalendarConnection,
  GoogleWebhookNotification,
} from './googleCalendarTypes';

/**
 * Sync result type
 */
export interface SyncResult {
  success: boolean;
  syncType: string;
  syncedAt: string;
  stats: {
    eventsCreated: number;
    eventsUpdated: number;
    eventsDeleted: number;
    conflictsDetected: number;
    errors: number;
  };
  errors: string[];
  duration: number; // milliseconds
}

/**
 * Sync progress callback
 */
export type SyncProgressCallback = (message: string, progress?: number) => void;

/**
 * Calendar Sync Service
 */
class CalendarSyncService {
  private isSyncing = false;
  private syncLogId: string | null = null;

  /**
   * Check if sync is currently running
   */
  getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Get last sync status for user
   */
  async getLastSyncStatus(userId: string): Promise<SyncResult | null> {
    const { data, error } = await supabase
      .from('calendar_sync_log')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      success: true,
      syncType: data.sync_type,
      syncedAt: data.completed_at || data.started_at,
      stats: {
        eventsCreated: data.events_created || 0,
        eventsUpdated: data.events_updated || 0,
        eventsDeleted: data.events_deleted || 0,
        conflictsDetected: data.conflicts_detected || 0,
        errors: data.events_failed || 0,
      },
      errors: [],
      duration: data.duration_seconds ? data.duration_seconds * 1000 : 0,
    };
  }

  /**
   * Perform full bi-directional sync
   */
  async performFullSync(
    userId: string,
    onProgress?: SyncProgressCallback
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    this.isSyncing = true;
    const startTime = Date.now();
    const errors: string[] = [];
    const stats = {
      eventsCreated: 0,
      eventsUpdated: 0,
      eventsDeleted: 0,
      conflictsDetected: 0,
      errors: 0,
    };

    try {
      onProgress?.('Starting full sync...', 0);

      // Create sync log
      this.syncLogId = await this.createSyncLog(userId, 'full_sync');

      // Get user's Google Calendar connections
      const { data: connections } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google')
        .eq('sync_enabled', true);

      if (!connections || connections.length === 0) {
        throw new Error('No Google Calendar connections found');
      }

      onProgress?.('Found calendar connections', 10);

      // Sync each connection
      for (const connection of connections) {
        try {
          // 1. Sync Canvas events to Google
          if (connection.sync_canvas_events) {
            onProgress?.('Syncing Canvas events to Google...', 20);
            const canvasResult = await this.syncCanvasToGoogle(
              userId,
              connection,
              onProgress
            );
            stats.eventsCreated += canvasResult.eventsCreated;
            stats.eventsUpdated += canvasResult.eventsUpdated;
            stats.errors += canvasResult.errors;
          }

          // 2. Sync Hapi study sessions to Google
          if (connection.sync_study_sessions) {
            onProgress?.('Syncing study sessions to Google...', 50);
            const hapiResult = await this.syncHapiStudySessionsToGoogle(
              userId,
              connection,
              onProgress
            );
            stats.eventsCreated += hapiResult.eventsCreated;
            stats.eventsUpdated += hapiResult.eventsUpdated;
            stats.errors += hapiResult.errors;
          }

          // 3. Import Google external events to Hapi
          if (connection.sync_external_events) {
            onProgress?.('Importing Google events to Hapi...', 70);
            const googleResult = await this.syncGoogleToHapi(
              userId,
              connection,
              onProgress
            );
            stats.eventsCreated += googleResult.eventsCreated;
            stats.eventsUpdated += googleResult.eventsUpdated;
            stats.errors += googleResult.errors;
          }

          // 4. Detect and log conflicts
          onProgress?.('Detecting conflicts...', 90);
          const conflictsDetected = await this.detectConflicts(userId);
          stats.conflictsDetected += conflictsDetected;

          // Update connection last sync time
          await supabase
            .from('calendar_connections')
            .update({
              last_sync_at: new Date().toISOString(),
              last_sync_status: 'success',
              last_sync_error: null,
            })
            .eq('id', connection.id);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Connection ${connection.id}: ${errorMsg}`);
          stats.errors++;

          // Update connection with error
          await supabase
            .from('calendar_connections')
            .update({
              last_sync_status: 'error',
              last_sync_error: errorMsg,
            })
            .eq('id', connection.id);
        }
      }

      onProgress?.('Sync complete!', 100);

      const duration = Date.now() - startTime;

      // Complete sync log
      await this.completeSyncLog(
        this.syncLogId,
        'completed',
        stats,
        duration,
        errors.length > 0 ? errors.join('; ') : undefined
      );

      return {
        success: errors.length === 0,
        syncType: 'full_sync',
        syncedAt: new Date().toISOString(),
        stats,
        errors,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMsg);

      if (this.syncLogId) {
        await this.completeSyncLog(this.syncLogId, 'failed', stats, duration, errorMsg);
      }

      throw new GoogleCalendarSyncError(errorMsg, 'full_sync', error as Error);
    } finally {
      this.isSyncing = false;
      this.syncLogId = null;
    }
  }

  /**
   * Sync Canvas events to Google Calendar
   */
  private async syncCanvasToGoogle(
    userId: string,
    connection: CalendarConnection,
    onProgress?: SyncProgressCallback
  ): Promise<{ eventsCreated: number; eventsUpdated: number; errors: number }> {
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let errors = 0;

    // Get Canvas calendar events for this user
    const { data: canvasEvents } = await supabase
      .from('canvas_calendar_events')
      .select('*, canvas_courses(name, canvas_course_code)')
      .eq('user_id', userId)
      .gte('start_at', new Date().toISOString()) // Only future events
      .order('start_at', { ascending: true });

    if (!canvasEvents || canvasEvents.length === 0) {
      return { eventsCreated, eventsUpdated, errors };
    }

    onProgress?.(`Syncing ${canvasEvents.length} Canvas events...`);

    for (const canvasEvent of canvasEvents) {
      try {
        // Check if event already mapped
        const { data: existingMapping } = await supabase
          .from('calendar_event_mappings')
          .select('*')
          .eq('user_id', userId)
          .eq('canvas_event_id', canvasEvent.canvas_id)
          .eq('calendar_connection_id', connection.id)
          .single();

        const googleEvent = canvasEventToGoogleEvent(
          canvasEvent as any,
          connection.calendar_timezone
        );

        if (existingMapping && existingMapping.google_event_id) {
          // Update existing event
          const eventHash = generateEventHash(canvasEvent);

          // Only update if changed
          if (eventHash !== existingMapping.hapi_version_hash) {
            await googleCalendarService.patchEvent(
              connection.calendar_id,
              existingMapping.google_event_id,
              googleEvent,
              { sendUpdates: 'none' }
            );

            // Update mapping
            await supabase
              .from('calendar_event_mappings')
              .update({
                hapi_version_hash: eventHash,
                last_modified_at: new Date().toISOString(),
                last_modified_by: 'canvas',
                sync_status: 'synced',
              })
              .eq('id', existingMapping.id);

            eventsUpdated++;
          }
        } else {
          // Create new event
          const createdEvent = await googleCalendarService.createEvent(
            connection.calendar_id,
            googleEvent,
            { sendUpdates: 'none' }
          );

          // Create mapping
          await supabase.from('calendar_event_mappings').insert({
            user_id: userId,
            calendar_connection_id: connection.id,
            hapi_event_id: canvasEvent.id,
            hapi_event_type: 'canvas_event',
            canvas_event_id: canvasEvent.canvas_id,
            google_event_id: createdEvent.id,
            event_title: canvasEvent.title,
            event_start: canvasEvent.start_at,
            event_end: canvasEvent.end_at || canvasEvent.start_at,
            event_description: canvasEvent.description,
            event_location: canvasEvent.location_name,
            all_day: canvasEvent.all_day,
            source_system: 'canvas',
            created_by_system: 'canvas',
            hapi_version_hash: generateEventHash(canvasEvent),
            sync_status: 'synced',
          });

          eventsCreated++;
        }
      } catch (error) {
        console.error('Error syncing Canvas event:', error);
        errors++;
      }
    }

    return { eventsCreated, eventsUpdated, errors };
  }

  /**
   * Sync Hapi study sessions to Google Calendar
   */
  private async syncHapiStudySessionsToGoogle(
    userId: string,
    connection: CalendarConnection,
    onProgress?: SyncProgressCallback
  ): Promise<{ eventsCreated: number; eventsUpdated: number; errors: number }> {
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let errors = 0;

    // Get study sessions for this user
    const { data: studySessions } = await supabase
      .from('study_sessions')
      .select('*, canvas_courses(name)')
      .eq('user_id', userId)
      .gte('start_time', new Date().toISOString()) // Only future sessions
      .order('start_time', { ascending: true });

    if (!studySessions || studySessions.length === 0) {
      return { eventsCreated, eventsUpdated, errors };
    }

    onProgress?.(`Syncing ${studySessions.length} study sessions...`);

    for (const session of studySessions) {
      try {
        // Check if event already mapped
        const { data: existingMapping } = await supabase
          .from('calendar_event_mappings')
          .select('*')
          .eq('user_id', userId)
          .eq('hapi_event_id', session.id)
          .eq('hapi_event_type', 'study_session')
          .eq('calendar_connection_id', connection.id)
          .single();

        const courseName = (session as any).canvas_courses?.name;
        const googleEvent = hapiStudySessionToGoogleEvent(
          session as any,
          courseName,
          connection.calendar_timezone
        );

        if (existingMapping && existingMapping.google_event_id) {
          // Update existing event
          const eventHash = generateEventHash(session);

          if (eventHash !== existingMapping.hapi_version_hash) {
            await googleCalendarService.patchEvent(
              connection.calendar_id,
              existingMapping.google_event_id,
              googleEvent,
              { sendUpdates: 'none' }
            );

            await supabase
              .from('calendar_event_mappings')
              .update({
                hapi_version_hash: eventHash,
                last_modified_at: new Date().toISOString(),
                last_modified_by: 'hapi',
                sync_status: 'synced',
              })
              .eq('id', existingMapping.id);

            eventsUpdated++;
          }
        } else {
          // Create new event
          const createdEvent = await googleCalendarService.createEvent(
            connection.calendar_id,
            googleEvent,
            { sendUpdates: 'none' }
          );

          // Create mapping
          await supabase.from('calendar_event_mappings').insert({
            user_id: userId,
            calendar_connection_id: connection.id,
            hapi_event_id: session.id,
            hapi_event_type: 'study_session',
            google_event_id: createdEvent.id,
            event_title: session.title,
            event_start: session.start_time,
            event_end: session.end_time,
            event_description: session.description,
            all_day: false,
            source_system: 'hapi',
            created_by_system: 'hapi',
            hapi_version_hash: generateEventHash(session),
            sync_status: 'synced',
          });

          eventsCreated++;
        }
      } catch (error) {
        console.error('Error syncing study session:', error);
        errors++;
      }
    }

    return { eventsCreated, eventsUpdated, errors };
  }

  /**
   * Import Google external events to Hapi
   */
  private async syncGoogleToHapi(
    userId: string,
    connection: CalendarConnection,
    onProgress?: SyncProgressCallback
  ): Promise<{ eventsCreated: number; eventsUpdated: number; errors: number }> {
    let eventsCreated = 0;
    let eventsUpdated = 0;
    let errors = 0;

    try {
      // Fetch events from Google Calendar (next 30 days)
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const googleEvents = await googleCalendarService.getEvents(connection.calendar_id, {
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      if (!googleEvents || googleEvents.length === 0) {
        return { eventsCreated, eventsUpdated, errors };
      }

      onProgress?.(`Importing ${googleEvents.length} Google events...`);

      // Filter out events we created (have our extended properties)
      const externalEvents = googleEvents.filter(
        (event) => !event.extendedProperties?.private?.source
      );

      for (const googleEvent of externalEvents) {
        try {
          // Check if already mapped
          const { data: existingMapping } = await supabase
            .from('calendar_event_mappings')
            .select('*')
            .eq('user_id', userId)
            .eq('google_event_id', googleEvent.id)
            .eq('calendar_connection_id', connection.id)
            .single();

          const eventHash = generateEventHash(googleEvent);

          if (existingMapping) {
            // Update if changed
            if (eventHash !== existingMapping.google_version_hash) {
              await supabase
                .from('calendar_event_mappings')
                .update({
                  event_title: googleEvent.summary,
                  event_start: googleEvent.start.dateTime || googleEvent.start.date!,
                  event_end: googleEvent.end?.dateTime || googleEvent.end?.date!,
                  event_description: googleEvent.description,
                  event_location: googleEvent.location,
                  google_version_hash: eventHash,
                  last_modified_at: new Date().toISOString(),
                  last_modified_by: 'google',
                  sync_status: 'synced',
                })
                .eq('id', existingMapping.id);

              eventsUpdated++;
            }
          } else {
            // Create new mapping (store in database for unified calendar view)
            await supabase.from('calendar_event_mappings').insert({
              user_id: userId,
              calendar_connection_id: connection.id,
              google_event_id: googleEvent.id,
              event_title: googleEvent.summary,
              event_start: googleEvent.start.dateTime || googleEvent.start.date!,
              event_end: googleEvent.end?.dateTime || googleEvent.end?.date!,
              event_description: googleEvent.description,
              event_location: googleEvent.location,
              all_day: !!googleEvent.start.date,
              source_system: 'google',
              created_by_system: 'google',
              google_version_hash: eventHash,
              sync_status: 'synced',
            });

            eventsCreated++;
          }
        } catch (error) {
          console.error('Error importing Google event:', error);
          errors++;
        }
      }
    } catch (error) {
      console.error('Error fetching Google events:', error);
      errors++;
    }

    return { eventsCreated, eventsUpdated, errors };
  }

  /**
   * Detect conflicts across systems
   */
  private async detectConflicts(userId: string): Promise<number> {
    try {
      const { data } = await supabase.rpc('detect_calendar_conflicts', {
        p_user_id: userId,
      });

      return data || 0;
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      return 0;
    }
  }

  /**
   * Handle Google Calendar webhook notification
   */
  async handleGoogleWebhook(
    notification: GoogleWebhookNotification
  ): Promise<void> {
    console.log('[Calendar Sync] Webhook received:', notification);

    // Find connection by channel ID
    const { data: connection } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('webhook_channel_id', notification.channelId)
      .single();

    if (!connection) {
      console.warn('[Calendar Sync] No connection found for channel:', notification.channelId);
      return;
    }

    // Trigger incremental sync for this connection
    try {
      await this.syncGoogleToHapi(connection.user_id, connection);
    } catch (error) {
      console.error('[Calendar Sync] Webhook sync failed:', error);
    }
  }

  /**
   * Create sync log entry
   */
  private async createSyncLog(userId: string, syncType: string): Promise<string> {
    const { data, error } = await supabase
      .from('calendar_sync_log')
      .insert({
        user_id: userId,
        sync_type: syncType,
        status: 'started',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to create sync log');
    }

    return data.id;
  }

  /**
   * Complete sync log entry
   */
  private async completeSyncLog(
    logId: string,
    status: 'completed' | 'failed' | 'partial',
    stats: any,
    durationMs: number,
    errorMessage?: string
  ): Promise<void> {
    await supabase
      .from('calendar_sync_log')
      .update({
        status,
        completed_at: new Date().toISOString(),
        events_created: stats.eventsCreated,
        events_updated: stats.eventsUpdated,
        events_deleted: stats.eventsDeleted,
        conflicts_detected: stats.conflictsDetected,
        events_failed: stats.errors,
        error_message: errorMessage,
        duration_seconds: Math.floor(durationMs / 1000),
      })
      .eq('id', logId);
  }
}

// Export singleton
export const calendarSyncService = new CalendarSyncService();

// Export class for testing
export { CalendarSyncService };
