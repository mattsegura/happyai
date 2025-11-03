/**
 * Canvas OAuth Callback Edge Function
 *
 * This Supabase Edge Function handles the OAuth callback from Canvas.
 * It exchanges the authorization code for an access token server-side,
 * ensuring the client secret remains secure.
 *
 * Environment Variables Required:
 * - CANVAS_CLIENT_ID: Canvas OAuth client ID
 * - CANVAS_CLIENT_SECRET: Canvas OAuth client secret
 * - CANVAS_ENCRYPTION_KEY: Encryption key for storing tokens
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers
// In production, replace '*' with your actual domain (e.g., 'https://your-app.com')
const getAllowedOrigin = (requestOrigin: string | null): string => {
  // Development: Allow localhost
  if (requestOrigin?.includes('localhost') || requestOrigin?.includes('127.0.0.1')) {
    return requestOrigin;
  }

  // Production: Restrict to your domain
  // TODO: Replace with your actual production domain
  const allowedOrigins = [
    'https://your-app.com',
    'https://www.your-app.com',
    // Add your Vercel/Netlify preview URLs if needed
  ];

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  // Default: Return first allowed origin or localhost for development
  return Deno.env.get('ALLOWED_ORIGIN') || allowedOrigins[0] || 'http://localhost:5173';
};

const getCorsHeaders = (requestOrigin: string | null) => ({
  'Access-Control-Allow-Origin': getAllowedOrigin(requestOrigin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
});

serve(async (req) => {
  const requestOrigin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(requestOrigin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { code, state, canvasInstanceUrl, codeVerifier, redirectUri, useMock } = await req.json();

    if (!code || !canvasInstanceUrl || !codeVerifier || !redirectUri) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Canvas OAuth credentials from environment
    const clientId = Deno.env.get('CANVAS_CLIENT_ID');
    const clientSecret = Deno.env.get('CANVAS_CLIENT_SECRET');

    // Mock mode: Return fake token data for development/testing
    if (useMock || !clientId || !clientSecret) {
      console.log('🎭 Using mock Canvas OAuth (credentials not configured or mock requested)');

      const mockTokenData = {
        access_token: 'mock_canvas_token_' + Date.now(),
        token_type: 'Bearer',
        user: {
          id: 'mock_user_123',
          name: 'Mock Canvas User',
          global_id: 'mock_global_123',
        },
        refresh_token: 'mock_refresh_token_' + Date.now(),
        expires_in: 3600, // 1 hour
        canvas_region: 'us-east-1',
      };

      return new Response(
        JSON.stringify({
          success: true,
          token: mockTokenData,
          mock: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = `${canvasInstanceUrl}/login/oauth2/token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.json();
      console.error('Canvas token exchange failed:', errorBody);
      return new Response(
        JSON.stringify({
          error: 'Failed to exchange code for token',
          details: errorBody,
        }),
        {
          status: tokenResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tokenData = await tokenResponse.json();

    console.log('Token exchange successful:', {
      tokenType: tokenData.token_type,
      userId: tokenData.user?.id,
      expiresIn: tokenData.expires_in,
    });

    // Return token data to client (will be encrypted client-side before storage)
    return new Response(
      JSON.stringify({
        success: true,
        token: tokenData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Canvas OAuth callback error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
