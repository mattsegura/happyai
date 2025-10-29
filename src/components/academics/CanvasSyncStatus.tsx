/**
 * Canvas Sync Status Component
 *
 * Shows sync status, progress, and allows manual sync triggering.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { canvasSyncServiceEnhanced, type SyncStatus } from '@/lib/canvas';
import { Loader2, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export function CanvasSyncStatus() {
  const [lastSync, setLastSync] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLastSync();
  }, []);

  const loadLastSync = async () => {
    try {
      const status = await canvasSyncServiceEnhanced.getLastSyncStatus();
      setLastSync(status);
    } catch (err) {
      console.error('Failed to load sync status:', err);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    setSyncProgress(0);
    setSyncMessage('Starting sync...');

    try {
      const status = await canvasSyncServiceEnhanced.fullSync((message, progress) => {
        setSyncMessage(message);
        if (progress !== undefined) {
          setSyncProgress(progress);
        }
      });

      setLastSync(status);

      if (status.errors.length > 0) {
        setError(`Sync completed with ${status.errors.length} error(s)`);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
      setSyncMessage('');
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Sync Status
          {isSyncing && <Loader2 className="h-4 w-4 animate-spin" />}
          {!isSyncing && lastSync?.success && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {!isSyncing && lastSync && !lastSync.success && (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>
          {isSyncing
            ? 'Syncing Canvas data...'
            : lastSync
            ? `Last synced ${formatTimestamp(lastSync.syncedAt)}`
            : 'No sync performed yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{syncMessage}</span>
              <span className="font-medium">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </div>
        )}

        {lastSync && !isSyncing && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Courses</div>
              <div className="text-2xl font-bold">{lastSync.counts.courses || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Assignments</div>
              <div className="text-2xl font-bold">{lastSync.counts.assignments || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Submissions</div>
              <div className="text-2xl font-bold">{lastSync.counts.submissions || 0}</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Duration</div>
              <div className="text-2xl font-bold">{formatDuration(lastSync.duration)}</div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={isSyncing}
          className="w-full"
          variant={lastSync ? 'outline' : 'default'}
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {lastSync ? 'Sync Again' : 'Start Sync'}
            </>
          )}
        </Button>

        {lastSync && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Auto-sync {canvasOAuth.AUTO_SYNC_ENABLED ? 'enabled' : 'disabled'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
