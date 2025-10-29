/**
 * Google Calendar OAuth Callback Edge Function
 *
 * Handles OAuth callback from Google, exchanges code for tokens,
 * and stores encrypted tokens in database
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get code and state from request body (POST) or URL params (GET)
    let code: string | null = null;
    let state: string | null = null;
    let error: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json();
      code = body.code;
      state = body.state;
    } else {
      const url = new URL(req.url);
      code = url.searchParams.get('code');
      state = url.searchParams.get('state');
      error = url.searchParams.get('error');
    }

    // Handle OAuth error
    if (error) {
      console.error('[OAuth] Error from Google:', error);
      const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=${encodeURIComponent(error)}`
      );
    }

    // Validate code
    if (!code) {
      console.error('[OAuth] Missing authorization code');
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[OAuth] Received authorization code');

    // Get environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('[OAuth] Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Exchange code for tokens
    console.log('[OAuth] Exchanging code for tokens...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[OAuth] Token exchange failed:', errorData);
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();
    console.log('[OAuth] Tokens received successfully');

    // Get user's calendar list
    console.log('[OAuth] Fetching calendar list...');
    const calendarsResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!calendarsResponse.ok) {
      console.error('[OAuth] Failed to fetch calendars');
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=calendar_fetch_failed`
      );
    }

    const calendarsData = await calendarsResponse.json();
    const primaryCalendar = calendarsData.items?.find((cal: any) => cal.primary);

    if (!primaryCalendar) {
      console.error('[OAuth] No primary calendar found');
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=no_primary_calendar`
      );
    }

    console.log('[OAuth] Primary calendar:', primaryCalendar.id);

    // Get user from state parameter (contains user session)
    // In production, decode the state to get user session token
    // For now, we'll use the service role to store the token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[OAuth] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Extract user ID from state (should be passed from frontend)
    // Format: userId|randomString
    let userId: string | null = null;
    if (state) {
      const parts = state.split('|');
      userId = parts[0];
    }

    if (!userId) {
      console.error('[OAuth] Missing user ID in state');
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=invalid_state`
      );
    }

    // Store tokens in database using RPC function
    console.log('[OAuth] Storing tokens in database...');
    const { data, error: storeError } = await supabase.rpc(
      'store_google_calendar_connection',
      {
        p_user_id: userId,
        p_calendar_id: primaryCalendar.id,
        p_calendar_name: primaryCalendar.summary,
        p_access_token: tokens.access_token,
        p_refresh_token: tokens.refresh_token,
        p_token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
        p_scope: tokens.scope,
        p_calendar_timezone: primaryCalendar.timeZone || 'UTC',
      }
    );

    if (storeError) {
      console.error('[OAuth] Failed to store tokens:', storeError);
      return Response.redirect(
        `${appUrl}/academics?google_calendar=error&error=storage_failed`
      );
    }

    console.log('[OAuth] Tokens stored successfully');

    // Return JSON response for POST requests (from client)
    if (req.method === 'POST') {
      return new Response(
        JSON.stringify({
          success: true,
          calendar_id: primaryCalendar.id,
          calendar_name: primaryCalendar.summary,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Set up webhook for calendar changes (optional, can be done later)
    try {
      const webhookUrl = `${supabaseUrl}/functions/v1/google-calendar-webhook`;
      const channelId = `hapi-${userId}-${Date.now()}`;

      const watchResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(primaryCalendar.id)}/events/watch`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: channelId,
            type: 'web_hook',
            address: webhookUrl,
            token: Deno.env.get('GOOGLE_WEBHOOK_TOKEN'),
          }),
        }
      );

      if (watchResponse.ok) {
        const watchData = await watchResponse.json();
        console.log('[OAuth] Webhook set up successfully:', watchData);

        // Update connection with webhook info
        await supabase
          .from('calendar_connections')
          .update({
            webhook_channel_id: watchData.id,
            webhook_resource_id: watchData.resourceId,
            webhook_expiration: new Date(
              parseInt(watchData.expiration)
            ).toISOString(),
          })
          .eq('calendar_id', primaryCalendar.id)
          .eq('user_id', userId);
      } else {
        console.warn('[OAuth] Failed to set up webhook (non-critical)');
      }
    } catch (webhookError) {
      // Non-critical error, continue
      console.warn('[OAuth] Webhook setup error (non-critical):', webhookError);
    }

    // Redirect back to app with success
    console.log('[OAuth] OAuth flow complete, redirecting...');
    return Response.redirect(
      `${appUrl}/academics?google_calendar=connected&calendar_id=${encodeURIComponent(primaryCalendar.id)}`
    );
  } catch (error) {
    console.error('[OAuth] Unexpected error:', error);
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    return Response.redirect(
      `${appUrl}/academics?google_calendar=error&error=unexpected_error`
    );
  }
});
