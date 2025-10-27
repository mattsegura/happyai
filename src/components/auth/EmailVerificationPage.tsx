import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, CheckCircle, RefreshCw, LogOut } from 'lucide-react';
import { AuthLayout } from './common/AuthLayout';
import { Button } from '../ui/button';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

interface EmailVerificationPageProps {
  email: string;
  onBack: () => void;
}

export function EmailVerificationPage({ email, onBack }: EmailVerificationPageProps) {
  const { signOut } = useAuth();
  const toast = useToast();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error('Failed to resend', error.message);
      } else {
        toast.success('Email sent!', 'Check your inbox for a new verification link.');
      }
    } catch (error) {
      toast.error('Error', 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      // Refresh the session to check if email is verified
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        toast.error('Not verified yet', 'Please check your email and click the verification link.');
      } else if (data?.user?.email_confirmed_at) {
        toast.success('Email verified!', 'Redirecting to your dashboard...');
        // The auth state change will handle the redirect automatically
      } else {
        toast.info('Not verified yet', 'Please check your email and click the verification link.');
      }
    } catch (error) {
      toast.error('Error', 'Failed to check verification status');
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    onBack();
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We sent a verification link to your email"
    >
      <div className="space-y-6">
        {/* Email Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-primary-600 shadow-lg">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 shadow-md">
              <span className="text-lg">✉️</span>
            </div>
          </div>
        </div>

        {/* Email Display */}
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-muted-foreground">Verification email sent to:</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{email}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Check your email inbox</p>
              <p className="text-xs text-muted-foreground">
                We sent a verification link to your email address
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Click the verification link</p>
              <p className="text-xs text-muted-foreground">
                The link will verify your email and activate your account
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-foreground">Return here and click "Check Verification"</p>
              <p className="text-xs text-muted-foreground">
                We'll verify your email status and log you in
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            fullWidth
            onClick={handleCheckVerification}
            isLoading={checking}
            className="bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700"
          >
            {checking ? 'Checking...' : 'Check Verification Status'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleResendEmail}
            isLoading={resending}
            className="border-2"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Resending...' : 'Resend Verification Email'}
          </Button>

          <Button
            variant="ghost"
            size="lg"
            fullWidth
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or click "Resend"
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
