import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Link2, Unlink, Loader2, AlertCircle } from 'lucide-react';
import { canvasOAuth } from '../../lib/canvas';
import { CANVAS_CONFIG } from '../../lib/canvas/canvasConfig';

export function CanvasSetup() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasInstanceUrl, setCanvasInstanceUrl] = useState(CANVAS_CONFIG.INSTANCE_URL);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const connected = await canvasOAuth.isConnected(canvasInstanceUrl);
      setIsConnected(connected);
    } catch (err) {
      console.error('Error checking Canvas connection:', err);
      setError('Failed to check Canvas connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Initiate OAuth flow - this will redirect to Canvas
      await canvasOAuth.initiate(canvasInstanceUrl);
    } catch (err: any) {
      console.error('Error connecting to Canvas:', err);
      setError(err.message || 'Failed to connect to Canvas');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect from Canvas? You will need to reconnect to access Canvas data.')) {
      return;
    }

    try {
      setIsDisconnecting(true);
      setError(null);

      await canvasOAuth.disconnect(canvasInstanceUrl);
      setIsConnected(false);
    } catch (err: any) {
      console.error('Error disconnecting from Canvas:', err);
      setError(err.message || 'Failed to disconnect from Canvas');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Mock mode message
  if (CANVAS_CONFIG.USE_MOCK_DATA) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-3xl p-8 border-2 border-amber-200 dark:border-amber-800 shadow-lg">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">Canvas Integration - Demo Mode</h3>
            <p className="text-muted-foreground mb-4">
              Canvas integration is currently in <span className="font-semibold text-amber-600 dark:text-amber-400">mock data mode</span>.
              You're seeing sample courses and assignments for demonstration purposes.
            </p>
            <div className="bg-card rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-foreground mb-2">To connect to real Canvas:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Get Canvas Developer Key credentials from your Canvas Admin</li>
                <li>Add credentials to <code className="px-2 py-1 bg-muted rounded text-xs">.env</code> file</li>
                <li>Set <code className="px-2 py-1 bg-muted rounded text-xs">VITE_USE_CANVAS_MOCK=false</code></li>
                <li>Restart the application</li>
                <li>Return here and click "Connect Canvas Account"</li>
              </ol>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-muted-foreground">
                All Canvas features are functional with mock data. No API connection needed.
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-card rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-muted-foreground">Checking Canvas connection...</span>
        </div>
      </div>
    );
  }

  // Connected state
  if (isConnected) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-3xl p-8 border-2 border-green-200 dark:border-green-800 shadow-lg">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Canvas Connected</h3>
              <p className="text-sm text-muted-foreground">
                Your Canvas account is connected and syncing.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Canvas Instance:</span>
            <span className="font-medium text-foreground">{canvasInstanceUrl}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium text-green-600 dark:text-green-400">Active</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-start space-x-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="w-full py-3 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isDisconnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Disconnecting...</span>
            </>
          ) : (
            <>
              <Unlink className="w-5 h-5" />
              <span>Disconnect Canvas</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Not connected state
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-3xl p-8 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
      <div className="flex items-start space-x-4 mb-6">
        <div className="flex-shrink-0">
          <Link2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-2">Connect Canvas Account</h3>
          <p className="text-muted-foreground mb-4">
            Connect your Canvas LMS account to automatically import courses, assignments, grades, and student data.
          </p>

          <div className="bg-card rounded-xl p-4 mb-4 space-y-2">
            <h4 className="font-semibold text-sm text-foreground mb-2">What you'll get:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Automatic course and student roster sync</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Real-time assignment and grade updates</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Academic analytics and insights</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Calendar integration</span>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <label htmlFor="canvas-url" className="block text-sm font-medium text-foreground mb-2">
              Canvas Instance URL
            </label>
            <input
              id="canvas-url"
              type="text"
              value={canvasInstanceUrl}
              onChange={(e) => setCanvasInstanceUrl(e.target.value)}
              placeholder="https://canvas.university.edu"
              className="w-full px-4 py-2 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter your institution's Canvas URL (without trailing slash)
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start space-x-2">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                <span>Connect Canvas Account</span>
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Your Canvas credentials are encrypted and securely stored. HapiAI never stores your Canvas password.
          </p>
        </div>
      </div>
    </div>
  );
}
