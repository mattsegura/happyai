/**
 * Canvas OAuth Callback Component
 *
 * Handles the OAuth callback from Canvas after user authorization.
 * Exchanges authorization code for access token and redirects to academics page.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { canvasOAuth } from '@/lib/canvas';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function CanvasOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Canvas authorization...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get OAuth parameters from URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Check for OAuth errors
      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code || !state) {
        throw new Error('Missing authorization code or state parameter');
      }

      setMessage('Exchanging authorization code for access token...');

      // Get Canvas instance URL (you might want to store this in session storage during OAuth initiation)
      const canvasUrl = localStorage.getItem('canvas_oauth_instance_url') || 'https://canvas.instructure.com';

      // Handle OAuth callback
      await canvasOAuth.handleCallback(code, state, canvasUrl);

      // Clean up
      localStorage.removeItem('canvas_oauth_instance_url');

      setStatus('success');
      setMessage('Canvas connected successfully!');

      // Redirect to academics page after 2 seconds
      setTimeout(() => {
        navigate('/academics');
      }, 2000);
    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Failed to connect Canvas'
      );
    }
  };

  const handleRetry = () => {
    navigate('/academics');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status === 'loading' && (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting Canvas
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Canvas Connected
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                Connection Failed
              </>
            )}
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we connect your Canvas account'}
            {status === 'success' && 'Redirecting to academics page...'}
            {status === 'error' && 'There was a problem connecting your Canvas account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 text-sm bg-muted rounded-md">
            {message}
          </div>

          {status === 'error' && (
            <Button onClick={handleRetry} className="w-full">
              Return to Academics
            </Button>
          )}

          {status === 'success' && (
            <div className="text-sm text-center text-muted-foreground">
              You will be redirected automatically in a moment...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
