/**
 * Canvas Connection Card Component
 *
 * Displays Canvas connection status and provides connect/disconnect actions.
 * Shows sync status and allows manual sync triggering.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { canvasOAuth } from '@/lib/canvas';
import { CANVAS_CONFIG } from '@/lib/canvas/canvasConfig';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { CanvasUrlDialog } from './CanvasUrlDialog';

export function CanvasConnectionCard() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMockMode] = useState(CANVAS_CONFIG.USE_MOCK_DATA);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const connected = await canvasOAuth.isConnected();
      setIsConnected(connected);
    } catch (err) {
      console.error('Failed to check Canvas connection:', err);
      setError('Failed to check connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = () => {
    setShowUrlDialog(true);
  };

  const handleUrlSubmit = async (canvasUrl: string) => {
    setShowUrlDialog(false);
    setIsConnecting(true);
    setError(null);
    try {
      // Store Canvas URL for OAuth callback
      localStorage.setItem('canvas_oauth_instance_url', canvasUrl);

      // Initiate OAuth flow
      await canvasOAuth.initiate(canvasUrl);
      // User will be redirected to Canvas
    } catch (err) {
      console.error('Failed to initiate Canvas connection:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to connect to Canvas'
      );
      setIsConnecting(false);
      localStorage.removeItem('canvas_oauth_instance_url');
    }
  };

  const handleUrlCancel = () => {
    setShowUrlDialog(false);
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Canvas? Your synced data will remain.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await canvasOAuth.disconnect();
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to disconnect Canvas:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to disconnect from Canvas'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const isValid = await canvasOAuth.validateToken();
      if (isValid) {
        setIsConnected(true);
        alert('Canvas connection is valid!');
      } else {
        setIsConnected(false);
        setError('Canvas connection is invalid. Please reconnect.');
      }
    } catch (err) {
      console.error('Failed to validate Canvas connection:', err);
      setError('Failed to validate connection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CanvasUrlDialog
        open={showUrlDialog}
        onSubmit={handleUrlSubmit}
        onCancel={handleUrlCancel}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Canvas LMS Connection
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!isLoading && isConnected && (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
          {!isLoading && !isConnected && (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </CardTitle>
        <CardDescription>
          {isConnected
            ? 'Your Canvas account is connected and synced.'
            : 'Connect your Canvas account to sync courses, assignments, and grades.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {isConnected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground">Security & Privacy:</div>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Your Canvas credentials are never stored</li>
                <li>Access tokens are encrypted before storage</li>
                <li>You can disconnect at any time</li>
                <li>We only access data you explicitly authorize</li>
              </ul>
            </div>

            {!isMockMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidate}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Validate Connection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Connect your Canvas account to access your courses, assignments, and grades
              directly in Hapi. Your credentials are securely encrypted.
            </div>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || isLoading}
              className="w-full sm:w-auto"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Canvas'
              )}
            </Button>
          </div>
        )}

      </CardContent>
    </Card>
    </>
  );
}
