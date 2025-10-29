/**
 * Google Calendar OAuth Callback Handler
 *
 * Handles the OAuth callback from Google and calls the Edge Function
 * with proper authentication
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function GoogleCalendarOAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Get code and state from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(`OAuth error: ${error}`);
        setTimeout(() => {
          navigate('/academics?google_calendar=error&error=' + error);
        }, 2000);
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setErrorMessage('Missing OAuth code or state');
        setTimeout(() => {
          navigate('/academics?google_calendar=error&error=missing_code');
        }, 2000);
        return;
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('error');
        setErrorMessage('User not authenticated');
        setTimeout(() => {
          navigate('/academics?google_calendar=error&error=not_authenticated');
        }, 2000);
        return;
      }

      // Call Edge Function with authentication
      const { data, error: functionError } = await supabase.functions.invoke(
        'google-calendar-oauth-callback',
        {
          body: {
            code,
            state,
          },
        }
      );

      if (functionError) {
        console.error('Edge Function error:', functionError);
        setStatus('error');
        setErrorMessage(functionError.message || 'Failed to connect calendar');
        setTimeout(() => {
          navigate('/academics?google_calendar=error&error=function_error');
        }, 2000);
        return;
      }

      // Success!
      setStatus('success');
      setTimeout(() => {
        navigate('/academics?google_calendar=connected');
      }, 1000);

    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      setTimeout(() => {
        navigate('/academics?google_calendar=error&error=unknown');
      }, 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Connecting Google Calendar...</h2>
            <p className="text-muted-foreground">Please wait while we complete the connection</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Success!</h2>
            <p className="text-muted-foreground">Google Calendar connected successfully</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-12 w-12 mx-auto rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Connection Failed</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
