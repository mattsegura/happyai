/**
 * Checkout Flow Component
 *
 * Handles subscription checkout for Student Plan.
 * Works in both mock and real Stripe mode.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { stripeClient } from '../../lib/stripe/stripeClient';
import { PRICING_PLANS } from '../../lib/types/payment';
import { Loader2, CreditCard, CheckCircle2, PartyPopper } from 'lucide-react';
import toast from 'react-hot-toast';

export function CheckoutFlow() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const studentPlan = PRICING_PLANS.student;
  const isMockMode = stripeClient.isMockMode();

  // Redirect if already subscribed
  useEffect(() => {
    if (!subscriptionLoading && subscription && subscription.is_active) {
      navigate('/dashboard/subscription');
    }
  }, [subscription, subscriptionLoading, navigate]);

  async function handleCheckout() {
    if (!user || !profile) {
      toast.error('Please log in to continue');
      navigate('/auth/login');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const { url } = await stripeClient.createCheckoutSession({
        user_id: user.id,
        plan_name: 'student',
        success_url: `${window.location.origin}/dashboard/subscription/checkout?success=true`,
        cancel_url: `${window.location.origin}/dashboard/subscription/checkout?canceled=true`,
        trial_days: studentPlan.trial_days,
      });

      if (isMockMode) {
        // In mock mode, show success screen first
        setShowSuccess(true);
        setLoading(false);
      } else {
        // In real mode, Stripe will redirect to checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error('[Checkout] Error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setLoading(false);
    }
  }

  // Show success screen
  if (showSuccess) {
    return <SuccessScreen onContinue={() => navigate('/dashboard/subscription')} />;
  }

  // Show loading while checking subscription status
  if (subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Subscribe to Student Plan</h1>
          <p className="text-muted-foreground">Start your 14-day free trial today</p>
          {isMockMode && (
            <div className="mt-4 inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                🧪 Mock Mode - No real payment required
              </p>
            </div>
          )}
        </div>

        {/* Plan Summary */}
        <div className="bg-card border border-border rounded-lg p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{studentPlan.name}</h2>
              <p className="text-muted-foreground mt-1">{studentPlan.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-foreground">{studentPlan.price_display}</p>
              <p className="text-sm text-muted-foreground mt-1">{studentPlan.trial_days}-day free trial</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground mb-3">Included features:</h3>
            {studentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Information (Mock Mode Only) */}
        {isMockMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Mock Payment Mode</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  You're in mock mode - no real payment information is required. Clicking "Start Free Trial" will instantly create a subscription.
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  To enable real Stripe payments, set <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">VITE_USE_PAYMENT_MOCK=false</code> in your .env file and add your Stripe API keys.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
              . I understand that my free trial will start today and I'll be charged {studentPlan.price_display} after {studentPlan.trial_days} days unless I cancel before then.
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/subscription')}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading || !agreedToTerms}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Start Free Trial</span>
            )}
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            🔒 Secure payment processing {!isMockMode && 'powered by Stripe'}
          </p>
          <p className="text-sm text-muted-foreground">
            Cancel anytime • No hidden fees • 14-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}

// Success Screen Component
function SuccessScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <PartyPopper className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to HapiAI! 🎉</h1>
          <p className="text-muted-foreground">
            Your 14-day free trial has started
          </p>
        </div>

        {/* Features Unlocked */}
        <div className="bg-card border border-border rounded-lg p-6 text-left space-y-3">
          <h3 className="font-semibold text-foreground mb-3">You now have access to:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Real-time grade tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>AI-powered study tutor</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Smart calendar assistant</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Missing assignment alerts</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span>Mood tracking & insights</span>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Trial Period:</strong> You won't be charged until your 14-day trial ends. Cancel anytime before then at no cost.
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          View My Subscription
        </button>

        <p className="text-sm text-muted-foreground">
          You can manage your subscription anytime from your dashboard
        </p>
      </div>
    </div>
  );
}
