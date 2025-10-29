/**
 * Google Calendar Connect Component
 *
 * Allows users to connect/disconnect their Google Calendar
 * Shows connection status and triggers OAuth flow
 */

import { useState, useEffect } from 'react';
import { googleCalendarService } from '../../lib/calendar';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, Calendar, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CalendarConnection {
  id: string;
  calendar_id: string;
  calendar_name: string;
  sync_enabled: boolean;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'error' | 'partial' | 'pending' | null;
  last_sync_error: string | null;
  created_at: string;
}

export function GoogleCalendarConnect() {
  const [connection, setConnection] = useState<CalendarConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const googleCalendarStatus = urlParams.get('google_calendar');
    const errorParam = urlParams.get('error');

    // Handle OAuth callback with code
    if (code && state) {
      handleOAuthCallback(code, state);
      return;
    }

    // Handle redirect results
    if (googleCalendarStatus === 'connected') {
      setSuccessMessage('Google Calendar connected successfully!');
      loadConnection();
      window.history.replaceState({}, '', window.location.pathname);
    } else if (googleCalendarStatus === 'error') {
      setError(`Failed to connect Google Calendar: ${errorParam || 'Unknown error'}`);
      window.history.replaceState({}, '', window.location.pathname);
    }

    loadConnection();
  }, []);

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setConnecting(true);
      setError(null);

      // Call Edge Function with the code
      const { data, error: functionError } = await supabase.functions.invoke(
        'google-calendar-oauth-callback',
        {
          body: { code, state },
        }
      );

      if (functionError) {
        console.error('Edge Function error:', functionError);
        setError(functionError.message || 'Failed to connect calendar');
        setConnecting(false);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Success!
      setSuccessMessage('Google Calendar connected successfully!');
      await loadConnection();
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      window.history.replaceState({}, '', window.location.pathname);
    } finally {
      setConnecting(false);
    }
  };

  const loadConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned (not an error)
        console.error('Error loading connection:', fetchError);
        setError('Failed to load connection status');
        return;
      }

      setConnection(data);
    } catch (err) {
      console.error('Error loading connection:', err);
      setError('Failed to load connection status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Generate OAuth URL with user ID in state
      const state = `${user.id}|${crypto.randomUUID()}`;
      const authUrl = googleCalendarService.getAuthUrl(state);

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error starting OAuth flow:', err);
      setError('Failed to start connection process');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;

    try {
      setDisconnecting(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Stop webhook if active
      if (connection.id) {
        const { data: conn } = await supabase
          .from('calendar_connections')
          .select('webhook_channel_id, webhook_resource_id')
          .eq('id', connection.id)
          .single();

        if (conn && conn.webhook_channel_id && conn.webhook_resource_id) {
          try {
            await googleCalendarService.stopWatching(
              conn.webhook_channel_id,
              conn.webhook_resource_id
            );
          } catch (webhookError) {
            console.warn('Failed to stop webhook (non-critical):', webhookError);
          }
        }
      }

      // Delete connection
      const { error: deleteError } = await supabase
        .from('calendar_connections')
        .delete()
        .eq('id', connection.id);

      if (deleteError) {
        throw deleteError;
      }

      setConnection(null);
      setSuccessMessage('Google Calendar disconnected successfully');
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect Google Calendar');
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar
        </CardTitle>
        <CardDescription>
          Sync your Canvas assignments and study sessions with Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Message */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        {connection ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{connection.calendar_name || 'Google Calendar'}</span>
                  {connection.sync_enabled ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="mr-1 h-3 w-3" />
                      Disabled
                    </Badge>
                  )}
                </div>
                {connection.last_sync_at && (
                  <p className="text-sm text-muted-foreground">
                    Last synced: {new Date(connection.last_sync_at).toLocaleString()}
                  </p>
                )}
                {connection.last_sync_status === 'error' && connection.last_sync_error && (
                  <p className="text-sm text-destructive">
                    Sync error: {connection.last_sync_error}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  'Disconnect'
                )}
              </Button>
            </div>

            {/* Info Box */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>What gets synced:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                <li>• Canvas assignments and events → Google Calendar (Blue)</li>
                <li>• Hapi study sessions → Google Calendar (Purple)</li>
                <li>• Google external events → Hapi (displayed in unified view)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">No Google Calendar connected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your Google Calendar to sync assignments and study sessions automatically
              </p>
              <Button onClick={handleConnect} disabled={connecting} className="mt-4">
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Connect Google Calendar
                  </>
                )}
              </Button>
            </div>

            {/* Benefits */}
            <div className="space-y-2 rounded-lg bg-muted p-4">
              <p className="font-medium text-sm">Benefits of connecting:</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Automatic sync of Canvas deadlines</li>
                <li>✓ Study sessions appear in your calendar</li>
                <li>✓ Real-time updates when events change</li>
                <li>✓ View all academic events in one place</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
