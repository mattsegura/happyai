import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, BookOpen, FileText, Calendar, Package } from 'lucide-react';
import { canvasSyncServiceEnhanced } from '../../lib/canvas';
import type { SyncStatus } from '../../lib/canvas';
import { CANVAS_CONFIG } from '../../lib/canvas/canvasConfig';

export function CanvasSyncStatus() {
  const [lastSync, setLastSync] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ message: string; progress?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Load last sync status on mount
  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const connected = await canvasSyncServiceEnhanced.isConnected();
      setIsConnected(connected);

      if (connected) {
        const status = await canvasSyncServiceEnhanced.getLastSyncStatus();
        setLastSync(status);
      }
    } catch (err) {
      console.error('Error loading sync status:', err);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setError(null);
      setSyncProgress({ message: 'Starting sync...', progress: 0 });

      const status = await canvasSyncServiceEnhanced.fullSync((message, progress) => {
        setSyncProgress({ message, progress });
      });

      setLastSync(status);
      setSyncProgress(null);

      if (status.errors.length > 0) {
        setError(`Sync completed with ${status.errors.length} error(s)`);
      }
    } catch (err: any) {
      console.error('Error syncing Canvas:', err);
      setError(err.message || 'Failed to sync Canvas data');
      setSyncProgress(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatLastSyncTime = (syncedAt: string): string => {
    const date = new Date(syncedAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  // Mock mode message
  if (CANVAS_CONFIG.USE_MOCK_DATA) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-3xl p-8 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <RefreshCw className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">Canvas Sync Status</h3>
            <p className="text-muted-foreground mb-4">
              Automatic sync is active with <span className="font-semibold text-purple-600 dark:text-purple-400">preview data</span>.
              Canvas data is populated and updates automatically.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-1">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-muted-foreground">Courses</span>
                </div>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-muted-foreground">Assignments</span>
                </div>
                <p className="text-2xl font-bold text-foreground">42</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-1">
                  <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Events</span>
                </div>
                <p className="text-2xl font-bold text-foreground">18</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-1">
                  <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs text-muted-foreground">Modules</span>
                </div>
                <p className="text-2xl font-bold text-foreground">23</p>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Last synced: Just now (automatic)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="bg-card rounded-3xl p-8 shadow-lg border-2 border-border">
        <div className="flex items-start space-x-4">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">Canvas Not Connected</h3>
            <p className="text-muted-foreground">
              Connect your Canvas account above to enable automatic data syncing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Syncing state
  if (isSyncing && syncProgress) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
        <div className="flex items-start space-x-4 mb-6">
          <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">Syncing Canvas Data</h3>
            <p className="text-muted-foreground">{syncProgress.message}</p>
          </div>
        </div>

        {syncProgress.progress !== undefined && (
          <div className="mb-4">
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">{syncProgress.progress}%</p>
          </div>
        )}
      </div>
    );
  }

  // Synced state
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-3xl p-8 border-2 border-green-200 dark:border-green-800 shadow-lg">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Canvas Data Synced</h3>
            {lastSync && (
              <p className="text-sm text-muted-foreground">
                Last synced {formatLastSyncTime(lastSync.syncedAt)} • Took {formatDuration(lastSync.duration)}
              </p>
            )}
          </div>
        </div>
      </div>

      {lastSync && lastSync.counts && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {lastSync.counts.courses !== undefined && (
            <div className="bg-card rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-1">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-muted-foreground">Courses</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{lastSync.counts.courses}</p>
            </div>
          )}
          {lastSync.counts.assignments !== undefined && (
            <div className="bg-card rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-1">
                <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-xs text-muted-foreground">Assignments</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{lastSync.counts.assignments}</p>
            </div>
          )}
          {lastSync.counts.calendar_events !== undefined && (
            <div className="bg-card rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-1">
                <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs text-muted-foreground">Events</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{lastSync.counts.calendar_events}</p>
            </div>
          )}
          {lastSync.counts.modules !== undefined && (
            <div className="bg-card rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-1">
                <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs text-muted-foreground">Modules</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{lastSync.counts.modules}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-600 dark:text-yellow-400">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        <span>Sync Now</span>
      </button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Canvas data syncs automatically every {Math.floor(CANVAS_CONFIG.SYNC_INTERVAL_MS / 60000)} minutes.
      </p>
    </div>
  );
}
