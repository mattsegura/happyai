/**
 * Canvas OAuth Service
 *
 * Handles OAuth 2.0 authentication flow for Canvas LMS.
 * Implements authorization code flow with PKCE for security.
 *
 * Flow:
 * 1. User clicks "Connect Canvas" → initiate()
 * 2. User authorizes on Canvas → Canvas redirects to callback
 * 3. Callback page calls handleCallback() → exchanges code for token
 * 4. Token stored encrypted in Supabase
 */

import { supabase } from '../supabase';
import { CANVAS_CONFIG, CANVAS_OAUTH_ENDPOINTS } from './canvasConfig';
import {
  encryptToken,
  decryptToken,
  generateOAuthState,
  generatePKCE,
  redactToken,
} from './canvasEncryption';
import {
  CanvasAuthError,
  CanvasTokenExpiredError,
  parseCanvasError,
} from './canvasErrors';

/**
 * Canvas OAuth token response
 */
export type CanvasOAuthToken = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
  refresh_token?: string;
  expires_in?: number;
};

/**
 * Stored token information
 */
export type StoredCanvasToken = {
  id: string;
  user_id: string;
  university_id: string;
  access_token: string; // Encrypted
  refresh_token?: string; // Encrypted
  token_type: string;
  expires_at?: string;
  canvas_instance_url: string;
  canvas_user_id: string;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * OAuth state stored in session storage
 */
type OAuthState = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  timestamp: number;
};

const OAUTH_STATE_KEY = 'canvas_oauth_state';
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Canvas OAuth Service
 */
class CanvasOAuthService {
  /**
   * Initiate OAuth flow - redirects user to Canvas authorization page
   *
   * @param canvasInstanceUrl - The Canvas instance URL (e.g., https://canvas.university.edu)
   * @param redirectUri - Optional custom redirect URI (defaults to config)
   */
  async initiate(
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL,
    redirectUri: string = CANVAS_CONFIG.REDIRECT_URI
  ): Promise<void> {
    // Validate client ID is configured
    if (!CANVAS_CONFIG.CLIENT_ID) {
      throw new Error(
        'Canvas OAuth client ID not configured. Please set VITE_CANVAS_CLIENT_ID environment variable.'
      );
    }

    // Generate OAuth state and PKCE challenge
    const state = generateOAuthState();
    const { codeVerifier, codeChallenge } = await generatePKCE();

    // Store state in session storage for callback verification
    const oauthState: OAuthState = {
      state,
      codeVerifier,
      redirectUri,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(oauthState));

    // Build authorization URL
    const authUrl = new URL(CANVAS_OAUTH_ENDPOINTS.AUTHORIZE(canvasInstanceUrl));
    authUrl.searchParams.set('client_id', CANVAS_CONFIG.CLIENT_ID);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', CANVAS_CONFIG.OAUTH_SCOPES);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('[Canvas OAuth] Initiating OAuth flow:', {
      instanceUrl: canvasInstanceUrl,
      redirectUri,
      state: redactToken(state),
    });

    // Redirect to Canvas authorization page
    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth callback - exchange authorization code for access token
   *
   * @param code - Authorization code from Canvas
   * @param state - State parameter for CSRF protection
   * @param canvasInstanceUrl - The Canvas instance URL
   * @returns Token information
   */
  async handleCallback(
    code: string,
    state: string,
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL
  ): Promise<StoredCanvasToken> {
    console.log('[Canvas OAuth] Handling callback:', {
      code: redactToken(code),
      state: redactToken(state),
      instanceUrl: canvasInstanceUrl,
    });

    // Retrieve and validate stored state
    const storedStateStr = sessionStorage.getItem(OAUTH_STATE_KEY);
    if (!storedStateStr) {
      throw new CanvasAuthError(
        'OAuth state not found. Please try connecting Canvas again.',
        401
      );
    }

    const storedState: OAuthState = JSON.parse(storedStateStr);

    // Verify state matches (CSRF protection)
    if (storedState.state !== state) {
      throw new CanvasAuthError(
        'OAuth state mismatch. Possible CSRF attack detected.',
        403
      );
    }

    // Check state hasn't expired
    if (Date.now() - storedState.timestamp > STATE_EXPIRY_MS) {
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      throw new CanvasAuthError(
        'OAuth state expired. Please try connecting Canvas again.',
        401
      );
    }

    // Exchange authorization code for access token
    try {
      const token = await this.exchangeCodeForToken(
        code,
        storedState.codeVerifier,
        storedState.redirectUri,
        canvasInstanceUrl
      );

      // Store token in Supabase
      const storedToken = await this.storeToken(token, canvasInstanceUrl);

      // Clean up state
      sessionStorage.removeItem(OAUTH_STATE_KEY);

      console.log('[Canvas OAuth] Token stored successfully:', {
        userId: storedToken.user_id,
        canvasUserId: storedToken.canvas_user_id,
        expiresAt: storedToken.expires_at,
      });

      return storedToken;
    } catch (error) {
      sessionStorage.removeItem(OAUTH_STATE_KEY);
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * Uses Supabase Edge Function for secure token exchange (recommended for production)
   */
  private async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    canvasInstanceUrl: string
  ): Promise<CanvasOAuthToken> {
    console.log('[Canvas OAuth] Exchanging code for token');

    // Option 1: Use Supabase Edge Function (recommended - keeps client secret secure)
    const useEdgeFunction = true; // Set to false for direct token exchange (dev only)

    if (useEdgeFunction) {
      return this.exchangeViaEdgeFunction(
        code,
        codeVerifier,
        redirectUri,
        canvasInstanceUrl
      );
    }

    // Option 2: Direct token exchange (dev/testing only - exposes client secret)
    return this.exchangeDirectly(code, codeVerifier, redirectUri, canvasInstanceUrl);
  }

  /**
   * Exchange code for token via Supabase Edge Function (secure)
   */
  private async exchangeViaEdgeFunction(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    canvasInstanceUrl: string
  ): Promise<CanvasOAuthToken> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new CanvasAuthError('User session not found', 401);
    }

    const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/canvas-oauth-callback`;

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri,
        canvasInstanceUrl,
        useMock: CANVAS_CONFIG.USE_MOCK_DATA, // Pass mock flag to Edge Function
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new CanvasAuthError(
        errorBody?.error || 'Failed to exchange code for token',
        response.status as 401 | 403
      );
    }

    const result = await response.json();
    return result.token;
  }

  /**
   * Exchange code for token directly (NOT RECOMMENDED for production)
   * This exposes the client secret in the browser
   */
  private async exchangeDirectly(
    code: string,
    codeVerifier: string,
    redirectUri: string,
    canvasInstanceUrl: string
  ): Promise<CanvasOAuthToken> {
    const tokenUrl = CANVAS_OAUTH_ENDPOINTS.TOKEN(canvasInstanceUrl);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CANVAS_CONFIG.CLIENT_ID,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const responseBody = await response.json().catch(() => null);
      throw parseCanvasError(response, responseBody);
    }

    const token: CanvasOAuthToken = await response.json();

    console.log('[Canvas OAuth] Token received:', {
      tokenType: token.token_type,
      userId: token.user.id,
      hasRefreshToken: !!token.refresh_token,
      expiresIn: token.expires_in,
    });

    return token;
  }

  /**
   * Store encrypted token in Supabase
   */
  private async storeToken(
    token: CanvasOAuthToken,
    canvasInstanceUrl: string
  ): Promise<StoredCanvasToken> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new CanvasAuthError('User not authenticated', 401);
    }

    // Get user's university ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('university_id')
      .eq('id', user.id)
      .single();

    if (!profile?.university_id) {
      throw new Error('User university not found');
    }

    // Encrypt tokens
    const encryptedAccessToken = await encryptToken(token.access_token);
    const encryptedRefreshToken = token.refresh_token
      ? await encryptToken(token.refresh_token)
      : null;

    // Calculate expiry time
    const expiresAt = token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : null;

    // Upsert token to database
    const { data, error } = await supabase
      .from('canvas_tokens')
      .upsert({
        user_id: user.id,
        university_id: profile.university_id,
        canvas_instance_url: canvasInstanceUrl,
        canvas_user_id: String(token.user.id),
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_type: token.token_type,
        expires_at: expiresAt,
        is_valid: true,
        last_validated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,canvas_instance_url',
      })
      .select()
      .single();

    if (error) {
      console.error('[Canvas OAuth] Failed to store token:', error);
      throw new Error(`Failed to store Canvas token: ${error.message}`);
    }

    return data;
  }

  /**
   * Get stored token for current user
   */
  async getToken(
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL
  ): Promise<{ token: string; expiresAt?: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('canvas_instance_url', canvasInstanceUrl)
      .eq('is_valid', true)
      .single();

    if (error || !data) {
      return null;
    }

    // Check if token is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      console.log('[Canvas OAuth] Token expired, attempting refresh');
      return this.refreshToken(data);
    }

    // Decrypt token
    const decryptedToken = await decryptToken(data.access_token);

    return {
      token: decryptedToken,
      expiresAt: data.expires_at,
    };
  }

  /**
   * Refresh expired access token using refresh token
   */
  private async refreshToken(
    storedToken: StoredCanvasToken
  ): Promise<{ token: string; expiresAt?: string } | null> {
    if (!storedToken.refresh_token) {
      console.log('[Canvas OAuth] No refresh token available');
      return null;
    }

    try {
      const decryptedRefreshToken = await decryptToken(storedToken.refresh_token);
      const tokenUrl = CANVAS_OAUTH_ENDPOINTS.TOKEN(storedToken.canvas_instance_url);

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: CANVAS_CONFIG.CLIENT_ID,
        refresh_token: decryptedRefreshToken,
      });

      console.log('[Canvas OAuth] Refreshing access token');

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);
        throw parseCanvasError(response, responseBody);
      }

      const newToken: CanvasOAuthToken = await response.json();

      // Update stored token
      const encryptedAccessToken = await encryptToken(newToken.access_token);
      const expiresAt = newToken.expires_in
        ? new Date(Date.now() + newToken.expires_in * 1000).toISOString()
        : null;

      const { error: updateError } = await supabase
        .from('canvas_tokens')
        .update({
          access_token: encryptedAccessToken,
          expires_at: expiresAt,
          last_validated_at: new Date().toISOString(),
        })
        .eq('id', storedToken.id);

      if (updateError) {
        console.error('[Canvas OAuth] Failed to update refreshed token:', updateError);
        return null;
      }

      console.log('[Canvas OAuth] Token refreshed successfully');

      return {
        token: newToken.access_token,
        expiresAt: expiresAt ?? undefined,
      };
    } catch (error) {
      console.error('[Canvas OAuth] Token refresh failed:', error);

      // Mark token as invalid if refresh fails
      await supabase
        .from('canvas_tokens')
        .update({ is_valid: false })
        .eq('id', storedToken.id);

      throw new CanvasTokenExpiredError(
        'Failed to refresh Canvas token. Please reconnect your Canvas account.'
      );
    }
  }

  /**
   * Revoke Canvas access token and remove from database
   */
  async disconnect(
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get stored token
    const { data: storedToken } = await supabase
      .from('canvas_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('canvas_instance_url', canvasInstanceUrl)
      .single();

    if (storedToken) {
      try {
        // Decrypt token
        const decryptedToken = await decryptToken(storedToken.access_token);

        // Revoke token on Canvas
        const revokeUrl = CANVAS_OAUTH_ENDPOINTS.REVOKE(canvasInstanceUrl);
        await fetch(revokeUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${decryptedToken}`,
          },
        });

        console.log('[Canvas OAuth] Token revoked on Canvas');
      } catch (error) {
        console.error('[Canvas OAuth] Failed to revoke token on Canvas:', error);
        // Continue with local deletion even if revocation fails
      }

      // Delete token from database
      const { error } = await supabase
        .from('canvas_tokens')
        .delete()
        .eq('id', storedToken.id);

      if (error) {
        console.error('[Canvas OAuth] Failed to delete token:', error);
        throw new Error(`Failed to disconnect Canvas: ${error.message}`);
      }

      console.log('[Canvas OAuth] Token deleted from database');
    }
  }

  /**
   * Check if user has a valid Canvas connection
   */
  async isConnected(
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL
  ): Promise<boolean> {
    // In mock mode, always return true (no real connection needed)
    if (CANVAS_CONFIG.USE_MOCK_DATA) {
      return true;
    }

    const token = await this.getToken(canvasInstanceUrl);
    return token !== null;
  }

  /**
   * Validate stored token by making a test API call
   */
  async validateToken(
    canvasInstanceUrl: string = CANVAS_CONFIG.INSTANCE_URL
  ): Promise<boolean> {
    const tokenData = await this.getToken(canvasInstanceUrl);
    if (!tokenData) {
      return false;
    }

    try {
      // Test token with a simple API call
      const testUrl = `${CANVAS_CONFIG.API_BASE_URL}/users/self`;
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
        },
      });

      const isValid = response.ok;

      // Update validation timestamp
      if (isValid) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('canvas_tokens')
            .update({ last_validated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('canvas_instance_url', canvasInstanceUrl);
        }
      }

      return isValid;
    } catch (error) {
      console.error('[Canvas OAuth] Token validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const canvasOAuth = new CanvasOAuthService();
