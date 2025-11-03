/**
 * Stripe Client Wrapper
 *
 * Main entry point for all Stripe operations.
 * Automatically switches between mock and real Stripe based on environment variable.
 *
 * Usage:
 *   import { stripeClient } from '@/lib/stripe/stripeClient';
 *
 *   // Create subscription (works in both mock and real mode)
 *   const subscription = await stripeClient.createSubscription({
 *     user_id: userId,
 *     plan_name: 'student',
 *   });
 */

import * as mockStripeService from './mockStripeService';
import * as realStripeService from './realStripeService';
import type {
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CreatePaymentMethodParams,
  CheckoutSessionParams,
  Subscription,
  Invoice,
  PaymentMethod,
} from '../types/payment';

const USE_MOCK = import.meta.env.VITE_USE_PAYMENT_MOCK === 'true';
const DEBUG = import.meta.env.DEV;

// Log mode on initialization
if (DEBUG) {
  console.log(`[Stripe Client] Initialized in ${USE_MOCK ? 'MOCK' : 'REAL'} mode`);
}

// =====================================================
// STRIPE CLIENT INTERFACE
// =====================================================

export interface StripeClientInterface {
  // Subscription operations
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>;
  updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription>;
  cancelSubscription(subscription_id: string, cancel_at_period_end?: boolean): Promise<Subscription>;
  reactivateSubscription(subscription_id: string): Promise<Subscription>;

  // Payment method operations
  createPaymentMethod(params: CreatePaymentMethodParams): Promise<PaymentMethod>;
  deletePaymentMethod(payment_method_id: string): Promise<void>;
  setDefaultPaymentMethod(payment_method_id: string, user_id: string): Promise<PaymentMethod>;

  // Checkout operations
  createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string; session_id: string }>;

  // Customer operations
  createCustomer(user_id: string, email: string, name: string): Promise<string>;

  // Invoice operations
  payInvoice(invoice_id: string): Promise<Invoice>;

  // Utility
  isMockMode(): boolean;
}

// =====================================================
// STRIPE CLIENT IMPLEMENTATION
// =====================================================

class StripeClient implements StripeClientInterface {
  private service: typeof mockStripeService | typeof realStripeService;

  constructor() {
    this.service = USE_MOCK ? mockStripeService : realStripeService;

    if (DEBUG) {
      console.log(`[Stripe Client] Using ${USE_MOCK ? 'mock' : 'real'} Stripe service`);
    }
  }

  // Subscription operations
  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    return this.service.createSubscription(params);
  }

  async updateSubscription(params: UpdateSubscriptionParams): Promise<Subscription> {
    return this.service.updateSubscription(params);
  }

  async cancelSubscription(subscription_id: string, cancel_at_period_end: boolean = true): Promise<Subscription> {
    return this.service.cancelSubscription(subscription_id, cancel_at_period_end);
  }

  async reactivateSubscription(subscription_id: string): Promise<Subscription> {
    return this.service.reactivateSubscription(subscription_id);
  }

  // Payment method operations
  async createPaymentMethod(params: CreatePaymentMethodParams): Promise<PaymentMethod> {
    return this.service.createPaymentMethod(params);
  }

  async deletePaymentMethod(payment_method_id: string): Promise<void> {
    return this.service.deletePaymentMethod(payment_method_id);
  }

  async setDefaultPaymentMethod(payment_method_id: string, user_id: string): Promise<PaymentMethod> {
    return this.service.setDefaultPaymentMethod(payment_method_id, user_id);
  }

  // Checkout operations
  async createCheckoutSession(params: CheckoutSessionParams): Promise<{ url: string; session_id: string }> {
    return this.service.createCheckoutSession(params);
  }

  // Customer operations
  async createCustomer(user_id: string, email: string, name: string): Promise<string> {
    return this.service.createCustomer(user_id, email, name);
  }

  // Invoice operations
  async payInvoice(invoice_id: string): Promise<Invoice> {
    return this.service.payInvoice(invoice_id);
  }

  // Utility
  isMockMode(): boolean {
    return USE_MOCK;
  }
}

// =====================================================
// EXPORT SINGLETON INSTANCE
// =====================================================

export const stripeClient = new StripeClient();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Check if payment is configured (either mock mode or real Stripe keys)
 */
export function isPaymentConfigured(): boolean {
  if (USE_MOCK) {
    return true; // Mock mode always works
  }

  // Real mode requires publishable key
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  return !!publishableKey;
}

/**
 * Get payment configuration status
 */
export function getPaymentConfig(): {
  configured: boolean;
  mode: 'mock' | 'real';
  requiresSetup: boolean;
  missingKeys: string[];
} {
  const configured = isPaymentConfigured();
  const mode = USE_MOCK ? 'mock' : 'real';

  const missingKeys: string[] = [];
  if (!USE_MOCK) {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      missingKeys.push('VITE_STRIPE_PUBLISHABLE_KEY');
    }
  }

  return {
    configured,
    mode,
    requiresSetup: !configured,
    missingKeys,
  };
}
