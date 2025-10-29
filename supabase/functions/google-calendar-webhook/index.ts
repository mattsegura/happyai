/**
 * Google Calendar Webhook Handler Edge Function
 *
 * Receives push notifications from Google Calendar when calendars change
 * Triggers incremental sync for affected calendar
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-goog-channel-id, x-goog-channel-token, x-goog-resource-id, x-goog-resource-state, x-goog-resource-uri, x-goog-message-number',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract Google webhook headers
    const channelId = req.headers.get('x-goog-channel-id');
    const channelToken = req.headers.get('x-goog-channel-token');
    const resourceId = req.headers.get('x-goog-resource-id');
    const resourceState = req.headers.get('x-goog-resource-state');
    const resourceUri = req.headers.get('x-goog-resource-uri');
    const messageNumber = req.headers.get('x-goog-message-number');

    console.log('[Webhook] Received notification:', {
      channelId,
      resourceState,
      resourceId,
      messageNumber,
    });

    // Verify webhook token
    const expectedToken = Deno.env.get('GOOGLE_WEBHOOK_TOKEN');
    if (expectedToken && channelToken !== expectedToken) {
      console.error('[Webhook] Invalid token');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate required headers
    if (!channelId || !resourceState) {
      console.error('[Webhook] Missing required headers');
      return new Response(
        JSON.stringify({ error: 'Bad request' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle sync state (initial verification)
    if (resourceState === 'sync') {
      console.log('[Webhook] Sync verification received');
      return new Response('OK', {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[Webhook] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Find connection by channel ID
    const { data: connection, error: connectionError } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('webhook_channel_id', channelId)
      .single();

    if (connectionError || !connection) {
      console.error('[Webhook] Connection not found:', channelId);
      return new Response(
        JSON.stringify({ error: 'Connection not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Webhook] Connection found:', {
      userId: connection.user_id,
      calendarId: connection.calendar_id,
    });

    // Handle different resource states
    if (resourceState === 'exists') {
      // Calendar changed - trigger incremental sync
      console.log('[Webhook] Calendar changed, triggering sync...');

      // Get decrypted access token
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        'get_google_calendar_token',
        {
          p_user_id: connection.user_id,
          p_calendar_id: connection.calendar_id,
        }
      );

      if (tokenError || !tokenData || !tokenData[0]) {
        console.error('[Webhook] Failed to get token:', tokenError);
        return new Response('OK', {
          status: 200,
          headers: corsHeaders,
        });
      }

      const accessToken = tokenData[0].decrypted_access_token;

      // Fetch changed events from Google Calendar
      // Use incremental sync with syncToken if available
      const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // Last 24 hours
      const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Next 30 days

      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(connection.calendar_id)}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;

      const eventsResponse = await fetch(eventsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!eventsResponse.ok) {
        console.error('[Webhook] Failed to fetch events');
        return new Response('OK', {
          status: 200,
          headers: corsHeaders,
        });
      }

      const eventsData = await eventsResponse.json();
      const googleEvents = eventsData.items || [];

      console.log(`[Webhook] Found ${googleEvents.length} events to process`);

      // Process events (sync to Hapi)
      let eventsProcessed = 0;
      let eventsCreated = 0;
      let eventsUpdated = 0;

      for (const googleEvent of googleEvents) {
        try {
          // Skip events we created (have our extended properties)
          if (googleEvent.extendedProperties?.private?.source) {
            continue;
          }

          // Check if event already exists in mappings
          const { data: existingMapping } = await supabase
            .from('calendar_event_mappings')
            .select('*')
            .eq('user_id', connection.user_id)
            .eq('google_event_id', googleEvent.id)
            .eq('calendar_connection_id', connection.id)
            .single();

          // Generate hash for change detection
          const eventHash = generateEventHash(googleEvent);

          if (existingMapping) {
            // Update if changed
            if (eventHash !== existingMapping.google_version_hash) {
              await supabase
                .from('calendar_event_mappings')
                .update({
                  event_title: googleEvent.summary || 'Untitled Event',
                  event_start:
                    googleEvent.start?.dateTime || googleEvent.start?.date,
                  event_end: googleEvent.end?.dateTime || googleEvent.end?.date,
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
            // Create new mapping
            await supabase.from('calendar_event_mappings').insert({
              user_id: connection.user_id,
              calendar_connection_id: connection.id,
              google_event_id: googleEvent.id,
              event_title: googleEvent.summary || 'Untitled Event',
              event_start: googleEvent.start?.dateTime || googleEvent.start?.date,
              event_end: googleEvent.end?.dateTime || googleEvent.end?.date,
              event_description: googleEvent.description,
              event_location: googleEvent.location,
              all_day: !!googleEvent.start?.date,
              source_system: 'google',
              created_by_system: 'google',
              google_version_hash: eventHash,
              sync_status: 'synced',
            });

            eventsCreated++;
          }

          eventsProcessed++;
        } catch (error) {
          console.error('[Webhook] Error processing event:', error);
        }
      }

      console.log(
        `[Webhook] Sync complete: ${eventsProcessed} processed, ${eventsCreated} created, ${eventsUpdated} updated`
      );

      // Update connection last sync time
      await supabase
        .from('calendar_connections')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
        })
        .eq('id', connection.id);

      // Log sync operation
      await supabase.from('calendar_sync_log').insert({
        user_id: connection.user_id,
        calendar_connection_id: connection.id,
        sync_type: 'webhook_update',
        sync_direction: 'to_hapi',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        events_fetched: googleEvents.length,
        events_created: eventsCreated,
        events_updated: eventsUpdated,
        events_failed: 0,
      });
    } else if (resourceState === 'not_exists') {
      // Calendar was deleted
      console.log('[Webhook] Calendar deleted');

      await supabase
        .from('calendar_connections')
        .update({
          sync_enabled: false,
          last_sync_status: 'error',
          last_sync_error: 'Calendar deleted',
        })
        .eq('id', connection.id);
    }

    // Always return 200 OK to acknowledge receipt
    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);

    // Still return 200 to prevent Google from retrying
    return new Response('OK', {
      status: 200,
      headers: corsHeaders,
    });
  }
});

/**
 * Generate simple hash for event data
 */
function generateEventHash(event: any): string {
  const hashData = {
    summary: event.summary || '',
    description: event.description || '',
    start: event.start?.dateTime || event.start?.date || '',
    end: event.end?.dateTime || event.end?.date || '',
    location: event.location || '',
  };

  const jsonString = JSON.stringify(hashData);

  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash.toString(16);
}
