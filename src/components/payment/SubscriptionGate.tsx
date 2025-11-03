/**
 * Subscription Gate Component
 *
 * Access control wrapper for premium features.
 * Shows paywall UI if user doesn't have active subscription.
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePremiumAccess } from '../../hooks/useSubscription';
import { Loader2, Lock, CreditCard, Users } from 'lucide-react';

interface SubscriptionGateProps {
  children: ReactNode;
  featureName?: string;
  showAccessReason?: boolean;
}

export function SubscriptionGate({ children, featureName = 'this feature', showAccessReason = false }: SubscriptionGateProps) {
  const { hasAccess, loading, accessReason } = usePremiumAccess();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show children if user has access
  if (hasAccess) {
    return (
      <>
        {showAccessReason && accessReason && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              {accessReason === 'own_subscription' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Active subscription</span>
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  <span>Free access via your teacher's subscription</span>
                </>
              )}
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  // Show paywall if no access
  return <SubscriptionRequired featureName={featureName} />;
}

// =====================================================
// SUBSCRIPTION REQUIRED (PAYWALL)
// =====================================================

interface SubscriptionRequiredProps {
  featureName: string;
}

function SubscriptionRequired({ featureName }: SubscriptionRequiredProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Lock Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Premium Feature</h2>
          <p className="text-muted-foreground">
            {featureName.charAt(0).toUpperCase() + featureName.slice(1)} is available with the Student Plan
          </p>
        </div>

        {/* Features List */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4 text-left">
          <h3 className="font-semibold text-foreground">Unlock with Student Plan:</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
              </div>
              <span>Real-time grade tracking & analysis</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
              </div>
              <span>AI-powered study tutor & calendar assistant</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
              </div>
              <span>Missing assignment alerts & grade projections</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
              </div>
              <span>Mood tracking & wellbeing insights</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
              </div>
              <span>Achievement badges & streaks</span>
            </li>
          </ul>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <p className="text-3xl font-bold text-foreground">$19.99<span className="text-lg font-normal text-muted-foreground">/month</span></p>
          <p className="text-sm text-muted-foreground">14-day free trial • Cancel anytime</p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            to="/subscription/checkout"
            className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            to="/subscription"
            className="block w-full px-6 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
          >
            View All Plans
          </Link>
        </div>

        {/* Alternative Access */}
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Students:</strong> Get free access when your teacher subscribes to the Teacher Plan
          </p>
        </div>
      </div>
    </div>
  );
}
