/**
 * Calendar Sync Settings Component
 *
 * Allows users to configure sync settings and manually trigger sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { calendarSyncService } from '../../lib/calendar/calendarSyncService';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Settings,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface CalendarConnection {
  id: string;
  calendar_id: string;
  calendar_name: string;
  sync_enabled: boolean;
  sync_canvas_events: boolean;
  sync_study_sessions: boolean;
  sync_external_events: boolean;
  last_sync_at: string | null;
  last_sync_status: 'success' | 'error' | 'partial' | 'pending' | null;
  last_sync_error: string | null;
}

interface SyncStats {
  eventsCreated: number;
  eventsUpdated: number;
  eventsDeleted: number;
  conflictsDetected: number;
  errors: number;
}

export function CalendarSyncSettings() {
  const [connection, setConnection] = useState<CalendarConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadConnection();
  }, []);

  const loadConnection = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('calendar_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .eq('sync_enabled', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error loading connection:', fetchError);
        return;
      }

      setConnection(data);
    } catch (err) {
      console.error('Error loading connection:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (field: string, value: boolean) => {
    if (!connection) return;

    try {
      const { error: updateError } = await supabase
        .from('calendar_connections')
        .update({ [field]: value })
        .eq('id', connection.id);

      if (updateError) throw updateError;

      setConnection({ ...connection, [field]: value });
      setSuccess('Settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating setting:', err);
      setError('Failed to update settings');
    }
  };

  const triggerSync = async () => {
    if (!connection) return;

    try {
      setSyncing(true);
      setError(null);
      setSuccess(null);
      setSyncProgress(0);
      setSyncMessage('Starting sync...');
      setSyncStats(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Perform full sync with progress callback
      const result = await calendarSyncService.performFullSync(
        user.id,
        (message, progress) => {
          setSyncMessage(message);
          if (progress !== undefined) {
            setSyncProgress(progress);
          }
        }
      );

      if (result.success) {
        setSuccess('Sync completed successfully!');
        setSyncStats(result.stats);
        loadConnection(); // Reload to update last sync time
      } else {
        setError(`Sync completed with errors: ${result.errors.join(', ')}`);
        setSyncStats(result.stats);
      }
    } catch (err) {
      console.error('Error syncing:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
      setSyncProgress(0);
      setSyncMessage('');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-muted-foreground">Loading settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sync Settings
          </CardTitle>
          <CardDescription>No Google Calendar connected</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your Google Calendar to configure sync settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Sync Settings
        </CardTitle>
        <CardDescription>
          Configure what gets synced between Hapi and Google Calendar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Sync Progress */}
        {syncing && (
          <div className="space-y-2 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Syncing...</span>
              <span className="text-sm text-muted-foreground">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} />
            {syncMessage && (
              <p className="text-xs text-muted-foreground">{syncMessage}</p>
            )}
          </div>
        )}

        {/* Sync Stats (after sync completes) */}
        {syncStats && !syncing && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Events Created</p>
              <p className="text-2xl font-bold text-green-600">{syncStats.eventsCreated}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Events Updated</p>
              <p className="text-2xl font-bold text-blue-600">{syncStats.eventsUpdated}</p>
            </div>
            {syncStats.conflictsDetected > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conflicts Detected</p>
                <p className="text-2xl font-bold text-orange-600">{syncStats.conflictsDetected}</p>
              </div>
            )}
            {syncStats.errors > 0 && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{syncStats.errors}</p>
              </div>
            )}
          </div>
        )}

        {/* Sync Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-canvas">Sync Canvas Events</Label>
              <p className="text-sm text-muted-foreground">
                Sync Canvas assignments and exams to Google Calendar
              </p>
            </div>
            <Switch
              id="sync-canvas"
              checked={connection.sync_canvas_events}
              onCheckedChange={(checked) =>
                updateSetting('sync_canvas_events', checked)
              }
              disabled={syncing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-sessions">Sync Study Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Sync your Hapi study sessions to Google Calendar
              </p>
            </div>
            <Switch
              id="sync-sessions"
              checked={connection.sync_study_sessions}
              onCheckedChange={(checked) =>
                updateSetting('sync_study_sessions', checked)
              }
              disabled={syncing}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sync-external">Import Google Events</Label>
              <p className="text-sm text-muted-foreground">
                Show your Google Calendar events in Hapi
              </p>
            </div>
            <Switch
              id="sync-external"
              checked={connection.sync_external_events}
              onCheckedChange={(checked) =>
                updateSetting('sync_external_events', checked)
              }
              disabled={syncing}
            />
          </div>
        </div>

        {/* Manual Sync Button */}
        <div className="space-y-2">
          <Button
            onClick={triggerSync}
            disabled={syncing}
            className="w-full"
          >
            {syncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
          {connection.last_sync_at && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Last synced: {new Date(connection.last_sync_at).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Sync Status */}
        {connection.last_sync_status && (
          <div className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm text-muted-foreground">Sync Status</span>
            {connection.last_sync_status === 'success' ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Success
              </Badge>
            ) : connection.last_sync_status === 'error' ? (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Error
              </Badge>
            ) : connection.last_sync_status === 'partial' ? (
              <Badge variant="secondary">
                <AlertCircle className="mr-1 h-3 w-3" />
                Partial
              </Badge>
            ) : (
              <Badge variant="outline">
                <Clock className="mr-1 h-3 w-3" />
                Pending
              </Badge>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">How sync works:</p>
          <ul className="mt-2 space-y-1 text-muted-foreground">
            <li>• Canvas events are synced to Google (read-only)</li>
            <li>• Study sessions are synced to Google (editable in Hapi)</li>
            <li>• Google events are imported to Hapi (read-only)</li>
            <li>• Sync happens automatically every 15 minutes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
