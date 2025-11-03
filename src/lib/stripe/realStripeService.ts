/**
 * Real Stripe Service
 *
 * Implements actual Stripe API operations for production use.
 * Requires Stripe API keys configured in environment variables.
 */

import { loadStripe, Stripe as StripeClient } from '@stripe/stripe-js';
import { supabase } from '../supabase';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CreatePaymentMethodParams,
  CheckoutSessionParams,
  Subscription,
  Invoice,
  PaymentMethod,
} from '../types/payment';

const DEBUG = import.meta.env.DEV;

// Initialize Stripe client
let stripePromise: Promise<StripeClient | null> | null = null;

function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('[Stripe] Publishable key not configured');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// =====================================================
// SUBSCRIPTION OPERATIONS
// =====================================================

export async function createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
  if (DEBUG) console.log('[Stripe] Creating subscription:', params);

  // Call Supabase Edge Function to create subscription server-side
  const { data, error } = await supabase.functions.invoke('stripe-create-subscription', {
    body: params,
  });

  if (error) {
    console.error('[Stripe] Error creating subscription:', error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Subscription created successfully:', data);
  return data.subscription as Subscription;
}

export async function updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription> {
  if (DEBUG) console.log('[Stripe] Updating subscription:', params);

  const { data, error } = await supabase.functions.invoke('stripe-update-subscription', {
    body: params,
  });

  if (error) {
    console.error('[Stripe] Error updating subscription:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Subscription updated successfully:', data);
  return data.subscription as Subscription;
}

export async function cancelSubscription(
  subscription_id: string,
  cancel_at_period_end: boolean = true
): Promise<Subscription> {
  if (DEBUG) console.log('[Stripe] Canceling subscription:', subscription_id, { cancel_at_period_end });

  const { data, error } = await supabase.functions.invoke('stripe-cancel-subscription', {
    body: { subscription_id, cancel_at_period_end },
  });

  if (error) {
    console.error('[Stripe] Error canceling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Subscription canceled successfully:', data);
  return data.subscription as Subscription;
}

export async function reactivateSubscription(subscription_id: string): Promise<Subscription> {
  if (DEBUG) console.log('[Stripe] Reactivating subscription:', subscription_id);

  const { data, error } = await supabase.functions.invoke('stripe-reactivate-subscription', {
    body: { subscription_id },
  });

  if (error) {
    console.error('[Stripe] Error reactivating subscription:', error);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Subscription reactivated successfully:', data);
  return data.subscription as Subscription;
}

// =====================================================
// PAYMENT METHOD OPERATIONS
// =====================================================

export async function createPaymentMethod(params: CreatePaymentMethodParams): Promise<PaymentMethod> {
  if (DEBUG) console.log('[Stripe] Creating payment method:', params);

  // In real Stripe, this would use Stripe Elements (card element) instead of raw card data
  // For now, we'll call the Edge Function to create payment method
  // In production, use: stripe.createPaymentMethod({ type: 'card', card: cardElement })

  const { data, error } = await supabase.functions.invoke('stripe-create-payment-method', {
    body: {
      user_id: params.user_id,
      card_number: params.card_number,
      card_exp_month: params.card_exp_month,
      card_exp_year: params.card_exp_year,
      card_cvc: params.card_cvc,
      billing_name: params.billing_name,
      billing_email: params.billing_email,
      billing_address: params.billing_address,
      is_default: params.is_default,
    },
  });

  if (error) {
    console.error('[Stripe] Error creating payment method:', error);
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Payment method created successfully:', data);
  return data.payment_method as PaymentMethod;
}

export async function deletePaymentMethod(payment_method_id: string): Promise<void> {
  if (DEBUG) console.log('[Stripe] Deleting payment method:', payment_method_id);

  const { error } = await supabase.functions.invoke('stripe-delete-payment-method', {
    body: { payment_method_id },
  });

  if (error) {
    console.error('[Stripe] Error deleting payment method:', error);
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Payment method deleted successfully');
}

export async function setDefaultPaymentMethod(payment_method_id: string, user_id: string): Promise<PaymentMethod> {
  if (DEBUG) console.log('[Stripe] Setting default payment method:', payment_method_id);

  const { data, error } = await supabase.functions.invoke('stripe-set-default-payment-method', {
    body: { payment_method_id, user_id },
  });

  if (error) {
    console.error('[Stripe] Error setting default payment method:', error);
    throw new Error(`Failed to set default payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Default payment method set successfully:', data);
  return data.payment_method as PaymentMethod;
}

// =====================================================
// CHECKOUT SESSION (for Stripe Checkout)
// =====================================================

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string; session_id: string }> {
  if (DEBUG) console.log('[Stripe] Creating checkout session:', params);

  const { data, error } = await supabase.functions.invoke('stripe-create-checkout-session', {
    body: params,
  });

  if (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Checkout session created:', data);

  // In production with real Stripe, this would redirect to Stripe Checkout
  // For now, just return the URL from the Edge Function
  return {
    url: data.url,
    session_id: data.session_id,
  };
}

// =====================================================
// CUSTOMER OPERATIONS
// =====================================================

export async function createCustomer(user_id: string, email: string, name: string): Promise<string> {
  if (DEBUG) console.log('[Stripe] Creating customer:', { user_id, email, name });

  const { data, error } = await supabase.functions.invoke('stripe-create-customer', {
    body: { user_id, email, name },
  });

  if (error) {
    console.error('[Stripe] Error creating customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Customer created successfully:', data.customer_id);
  return data.customer_id;
}

// =====================================================
// INVOICE OPERATIONS
// =====================================================

export async function payInvoice(invoice_id: string): Promise<Invoice> {
  if (DEBUG) console.log('[Stripe] Paying invoice:', invoice_id);

  const { data, error } = await supabase.functions.invoke('stripe-pay-invoice', {
    body: { invoice_id },
  });

  if (error) {
    console.error('[Stripe] Error paying invoice:', error);
    throw new Error(`Failed to pay invoice: ${error.message}`);
  }

  if (DEBUG) console.log('[Stripe] Invoice paid successfully:', data);
  return data.invoice as Invoice;
}
