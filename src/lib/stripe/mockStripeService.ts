/**
 * Mock Stripe Service
 *
 * Simulates all Stripe payment operations for development/testing.
 * No API keys required - perfect for local development.
 */

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

// =====================================================
// MOCK DATA GENERATORS
// =====================================================

function generateMockId(prefix: string): string {
  return `${prefix}_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}-${number}`;
}

// =====================================================
// SUBSCRIPTION OPERATIONS
// =====================================================

export async function createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
  if (DEBUG) console.log('[Mock Stripe] Creating subscription:', params);

  const { user_id, plan_name, trial_days = 14 } = params;

  // Calculate trial period
  const now = new Date();
  const trialStart = now.toISOString();
  const trialEnd = new Date(now.getTime() + trial_days * 24 * 60 * 60 * 1000).toISOString();

  // Calculate current period (starts after trial)
  const periodStart = trialEnd;
  const periodEnd = new Date(new Date(trialEnd).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Get pricing based on plan
  const PRICING_PLANS = (await import('../types/payment')).PRICING_PLANS;
  const plan = PRICING_PLANS[plan_name];

  // Insert subscription into database
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id,
      stripe_customer_id: generateMockId('cus'),
      stripe_subscription_id: generateMockId('sub'),
      plan_name,
      status: 'trialing',
      current_period_start: periodStart,
      current_period_end: periodEnd,
      trial_start: trialStart,
      trial_end: trialEnd,
      amount_cents: plan.price_cents,
      currency: 'usd',
      billing_interval: plan.billing_interval,
      cancel_at_period_end: false,
      metadata: {
        mock_mode: true,
        created_via: 'mock_stripe_service',
      },
    })
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error creating subscription:', error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Subscription created successfully:', data);

  // Create initial invoice (for the first period after trial)
  await createMockInvoice({
    user_id,
    subscription_id: data.id,
    amount_cents: plan.price_cents,
    status: 'open', // Not paid yet (trial period)
    period_start: periodStart,
    period_end: periodEnd,
  });

  return data as Subscription;
}

export async function updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription> {
  if (DEBUG) console.log('[Mock Stripe] Updating subscription:', params);

  const { subscription_id, ...updates } = params;

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscription_id)
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error updating subscription:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Subscription updated successfully:', data);
  return data as Subscription;
}

export async function cancelSubscription(subscription_id: string, cancel_at_period_end: boolean = true): Promise<Subscription> {
  if (DEBUG) console.log('[Mock Stripe] Canceling subscription:', subscription_id, { cancel_at_period_end });

  const updates: Partial<Subscription> = {
    cancel_at_period_end,
  };

  // If immediate cancellation, update status
  if (!cancel_at_period_end) {
    updates.status = 'canceled';
    updates.canceled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', subscription_id)
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error canceling subscription:', error);
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Subscription canceled successfully:', data);
  return data as Subscription;
}

export async function reactivateSubscription(subscription_id: string): Promise<Subscription> {
  if (DEBUG) console.log('[Mock Stripe] Reactivating subscription:', subscription_id);

  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: false,
      status: 'active',
      canceled_at: null,
    })
    .eq('id', subscription_id)
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error reactivating subscription:', error);
    throw new Error(`Failed to reactivate subscription: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Subscription reactivated successfully:', data);
  return data as Subscription;
}

// =====================================================
// PAYMENT METHOD OPERATIONS
// =====================================================

export async function createPaymentMethod(params: CreatePaymentMethodParams): Promise<PaymentMethod> {
  if (DEBUG) console.log('[Mock Stripe] Creating payment method:', params);

  const { user_id, type, billing_name, billing_email, billing_address, is_default = false } = params;

  // If this is set as default, unset any existing default
  if (is_default) {
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', user_id);
  }

  // Generate mock card details
  const cardBrands = ['visa', 'mastercard', 'amex', 'discover'];
  const cardBrand = cardBrands[Math.floor(Math.random() * cardBrands.length)];
  const cardLast4 = Math.floor(1000 + Math.random() * 9000).toString();
  const cardExpMonth = params.card_exp_month || Math.floor(1 + Math.random() * 12);
  const cardExpYear = params.card_exp_year || new Date().getFullYear() + Math.floor(1 + Math.random() * 5);

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id,
      stripe_payment_method_id: generateMockId('pm'),
      type,
      card_brand: type === 'card' ? cardBrand : null,
      card_last4: type === 'card' ? cardLast4 : null,
      card_exp_month: type === 'card' ? cardExpMonth : null,
      card_exp_year: type === 'card' ? cardExpYear : null,
      card_country: 'US',
      billing_name,
      billing_email,
      billing_address,
      is_default,
      is_expired: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error creating payment method:', error);
    throw new Error(`Failed to create payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Payment method created successfully:', data);
  return data as PaymentMethod;
}

export async function deletePaymentMethod(payment_method_id: string): Promise<void> {
  if (DEBUG) console.log('[Mock Stripe] Deleting payment method:', payment_method_id);

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', payment_method_id);

  if (error) {
    console.error('[Mock Stripe] Error deleting payment method:', error);
    throw new Error(`Failed to delete payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Payment method deleted successfully');
}

export async function setDefaultPaymentMethod(payment_method_id: string, user_id: string): Promise<PaymentMethod> {
  if (DEBUG) console.log('[Mock Stripe] Setting default payment method:', payment_method_id);

  // Unset existing default
  await supabase
    .from('payment_methods')
    .update({ is_default: false })
    .eq('user_id', user_id);

  // Set new default
  const { data, error } = await supabase
    .from('payment_methods')
    .update({ is_default: true })
    .eq('id', payment_method_id)
    .eq('user_id', user_id)
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error setting default payment method:', error);
    throw new Error(`Failed to set default payment method: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Default payment method set successfully:', data);
  return data as PaymentMethod;
}

// =====================================================
// INVOICE OPERATIONS
// =====================================================

interface CreateMockInvoiceParams {
  user_id: string;
  subscription_id: string;
  amount_cents: number;
  status: 'paid' | 'open' | 'void';
  period_start: string;
  period_end: string;
}

async function createMockInvoice(params: CreateMockInvoiceParams): Promise<Invoice> {
  if (DEBUG) console.log('[Mock Stripe] Creating invoice:', params);

  const { user_id, subscription_id, amount_cents, status, period_start, period_end } = params;

  const invoiceNumber = generateInvoiceNumber();
  const now = new Date();
  const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Due in 7 days

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      user_id,
      subscription_id,
      stripe_invoice_id: generateMockId('in'),
      stripe_payment_intent_id: status === 'paid' ? generateMockId('pi') : null,
      amount_paid: status === 'paid' ? amount_cents : 0,
      amount_due: amount_cents,
      amount_remaining: status === 'paid' ? 0 : amount_cents,
      currency: 'usd',
      status,
      invoice_number: invoiceNumber,
      description: `HapiAI Student Plan - ${new Date(period_start).toLocaleDateString()} to ${new Date(period_end).toLocaleDateString()}`,
      invoice_pdf: `https://mock-stripe.com/invoices/${invoiceNumber}.pdf`,
      hosted_invoice_url: `https://mock-stripe.com/invoices/${invoiceNumber}`,
      period_start,
      period_end,
      due_date: dueDate,
      paid_at: status === 'paid' ? now.toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error creating invoice:', error);
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Invoice created successfully:', data);
  return data as Invoice;
}

export async function payInvoice(invoice_id: string): Promise<Invoice> {
  if (DEBUG) console.log('[Mock Stripe] Paying invoice:', invoice_id);

  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { data, error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      amount_paid: supabase.rpc('amount_due'),
      amount_remaining: 0,
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: generateMockId('pi'),
    })
    .eq('id', invoice_id)
    .select()
    .single();

  if (error) {
    console.error('[Mock Stripe] Error paying invoice:', error);
    throw new Error(`Failed to pay invoice: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Invoice paid successfully:', data);
  return data as Invoice;
}

// =====================================================
// CHECKOUT SESSION (for Stripe Checkout)
// =====================================================

export async function createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string; session_id: string }> {
  if (DEBUG) console.log('[Mock Stripe] Creating checkout session:', params);

  const { user_id, plan_name, success_url, trial_days = 14 } = params;

  // In mock mode, we simulate an immediate checkout
  // In production, this would return a Stripe Checkout URL

  // Create subscription directly (simulating successful checkout)
  const subscription = await createSubscription({
    user_id,
    plan_name,
    trial_days,
  });

  // Create a mock payment method
  await createPaymentMethod({
    user_id,
    type: 'card',
    billing_name: 'Mock User',
    billing_email: 'mock@example.com',
    billing_address: {
      line1: '123 Mock Street',
      city: 'Mock City',
      state: 'CA',
      postal_code: '12345',
      country: 'US',
    },
    is_default: true,
  });

  const sessionId = generateMockId('cs');

  if (DEBUG) console.log('[Mock Stripe] Checkout session created:', { session_id: sessionId, subscription_id: subscription.id });

  // Return mock checkout URL (in mock mode, this redirects to success immediately)
  return {
    url: `${success_url}?session_id=${sessionId}&subscription_id=${subscription.id}`,
    session_id: sessionId,
  };
}

// =====================================================
// CUSTOMER OPERATIONS
// =====================================================

export async function createCustomer(user_id: string, email: string, name: string): Promise<string> {
  if (DEBUG) console.log('[Mock Stripe] Creating customer:', { user_id, email, name });

  const customerId = generateMockId('cus');

  // Update profile with stripe_customer_id
  const { error } = await supabase
    .from('profiles')
    .update({ stripe_customer_id: customerId })
    .eq('id', user_id);

  if (error) {
    console.error('[Mock Stripe] Error creating customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  if (DEBUG) console.log('[Mock Stripe] Customer created successfully:', customerId);
  return customerId;
}
