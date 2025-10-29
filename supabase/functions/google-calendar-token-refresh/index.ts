/**
 * Google Calendar Token Refresh Edge Function
 *
 * Handles server-side token refresh to keep client secret secure
 * Called automatically by the database when tokens are about to expire
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
    // Get environment variables
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('[Token Refresh] Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { refresh_token, connection_id } = await req.json();

    if (!refresh_token || !connection_id) {
      return new Response(
        JSON.stringify({ error: 'Missing refresh_token or connection_id' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Token Refresh] Refreshing token for connection:', connection_id);

    // Refresh the token with Google
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('[Token Refresh] Token refresh failed:', errorData);
      return new Response(
        JSON.stringify({
          error: 'Token refresh failed',
          details: errorData
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokens = await tokenResponse.json();
    console.log('[Token Refresh] Tokens refreshed successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[Token Refresh] Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Update the connection with new access token (refresh token stays the same)
    // NOTE: The access_token will be encrypted by the database trigger
    const { error: updateError } = await supabase
      .from('calendar_connections')
      .update({
        access_token: tokens.access_token,
        token_expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', connection_id);

    if (updateError) {
      console.error('[Token Refresh] Failed to update database:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update database' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Token Refresh] Database updated successfully');

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        expires_in: tokens.expires_in,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[Token Refresh] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
