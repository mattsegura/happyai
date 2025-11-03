/**
 * Subscription Management Component
 *
 * Main page for viewing and managing subscription.
 */

import { Link } from 'react-router-dom';
import { useSubscription, useInvoices } from '../../hooks/useSubscription';
import { stripeClient } from '../../lib/stripe/stripeClient';
import { getSubscriptionStatusColor, PRICING_PLANS } from '../../lib/types/payment';
import { Loader2, CreditCard, FileText, AlertCircle, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export function SubscriptionManagement() {
  const { subscription, loading, hasActiveSubscription, isTrialing, daysRemaining, refetch } = useSubscription();
  const { invoices } = useInvoices();
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  const isMockMode = stripeClient.isMockMode();

  async function handleCancelSubscription() {
    if (!subscription) return;

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access at the end of your current billing period.'
    );

    if (!confirmed) return;

    setCanceling(true);

    try {
      await stripeClient.cancelSubscription(subscription.id, true);
      toast.success('Subscription will be canceled at the end of the billing period');
      refetch();
    } catch (error) {
      console.error('[Subscription] Cancel error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setCanceling(false);
    }
  }

  async function handleReactivateSubscription() {
    if (!subscription) return;

    setReactivating(true);

    try {
      await stripeClient.reactivateSubscription(subscription.id);
      toast.success('Subscription reactivated successfully!');
      refetch();
    } catch (error) {
      console.error('[Subscription] Reactivate error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to reactivate subscription');
    } finally {
      setReactivating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No subscription - show upgrade CTA
  if (!subscription) {
    return <NoSubscription />;
  }

  const plan = PRICING_PLANS[subscription.plan_name];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscription</h1>
          <p className="text-muted-foreground">Manage your HapiAI subscription and billing</p>
          {isMockMode && (
            <div className="mt-3 inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-400">
              🧪 Mock Mode
            </div>
          )}
        </div>

        {/* Current Plan */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">{plan.name}</h2>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionStatusColor(subscription.status)}`}>
              {isTrialing ? `Trial (${daysRemaining} days left)` : subscription.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold text-foreground">{subscription.amount_display}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isTrialing ? 'Trial ends' : 'Renews on'}</p>
                <p className="font-semibold text-foreground">
                  {subscription.renewal_date
                    ? new Date(subscription.renewal_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground">{hasActiveSubscription ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>

          {/* Cancellation Warning */}
          {subscription.cancel_at_period_end && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Subscription Ending
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your subscription will be canceled on{' '}
                  {subscription.current_period_end
                    ? new Date(subscription.current_period_end).toLocaleDateString()
                    : 'N/A'}
                  . You'll lose access to premium features after this date.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {subscription.cancel_at_period_end ? (
              <button
                onClick={handleReactivateSubscription}
                disabled={reactivating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {reactivating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reactivating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reactivate Subscription</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors disabled:opacity-50"
              >
                {canceling ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Billing History</h2>
            </div>
          </div>

          {invoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No invoices yet</p>
          ) : (
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                  <div>
                    <p className="font-semibold text-foreground">{invoice.description || 'Subscription Payment'}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date_display}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{invoice.amount_display}</p>
                    <p className={`text-sm ${invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {invoice.status_display}
                    </p>
                  </div>
                </div>
              ))}
              {invoices.length > 5 && (
                <p className="text-center text-sm text-muted-foreground">
                  Showing {Math.min(5, invoices.length)} of {invoices.length} invoices
                </p>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-foreground mb-3">Need Help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about your subscription? We're here to help.
          </p>
          <div className="flex gap-3">
            <a
              href="/support"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// No Subscription CTA
function NoSubscription() {
  const plan = PRICING_PLANS.student;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Active Subscription</h2>
          <p className="text-muted-foreground">
            Subscribe to unlock all premium features
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{plan.price_display}</p>
            <p className="text-sm text-muted-foreground mt-1">{plan.trial_days}-day free trial</p>
          </div>

          <div className="space-y-2 text-left">
            {plan.features.slice(0, 5).map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          to="/dashboard/subscription/checkout"
          className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Start Free Trial
        </Link>

        <p className="text-sm text-muted-foreground">
          No payment required during trial • Cancel anytime
        </p>
      </div>
    </div>
  );
}
