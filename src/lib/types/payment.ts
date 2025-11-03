/**
 * Payment & Subscription Types
 *
 * Type definitions for Stripe payment integration.
 * Works with both mock mode and real Stripe API.
 */

// =====================================================
// DATABASE TYPES (matches Supabase schema)
// =====================================================

export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due' | 'incomplete' | 'unpaid';
export type PlanName = 'student' | 'teacher' | 'admin';
export type BillingInterval = 'month' | 'year';
export type Currency = 'usd' | 'eur' | 'gbp';
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible' | 'draft';
export type PaymentMethodType = 'card' | 'bank_account' | 'paypal';

export interface Subscription {
  id: string;
  user_id: string;

  // Stripe IDs (null in mock mode)
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;

  // Subscription details
  plan_name: PlanName;
  status: SubscriptionStatus;

  // Billing period
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;

  // Trial period
  trial_start: string | null;
  trial_end: string | null;

  // Pricing
  amount_cents: number;
  currency: Currency;
  billing_interval: BillingInterval;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  subscription_id: string | null;

  // Stripe IDs (null in mock mode)
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;

  // Invoice details
  amount_paid: number; // in cents
  amount_due: number; // in cents
  amount_remaining: number; // in cents
  currency: Currency;

  // Status
  status: InvoiceStatus;

  // Invoice metadata
  invoice_number: string | null;
  description: string | null;

  // URLs (Stripe-hosted)
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;

  // Billing period
  period_start: string | null;
  period_end: string | null;

  // Timestamps
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;

  // Stripe IDs (null in mock mode)
  stripe_payment_method_id: string | null;

  // Payment method details
  type: PaymentMethodType;

  // Card details
  card_brand: string | null;
  card_last4: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  card_country: string | null;

  // Bank account details
  bank_name: string | null;
  bank_last4: string | null;

  // Status
  is_default: boolean;
  is_expired: boolean;

  // Metadata
  billing_name: string | null;
  billing_email: string | null;
  billing_address: BillingAddress | null;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// =====================================================
// API TYPES (for Stripe operations)
// =====================================================

export interface CreateSubscriptionParams {
  user_id: string;
  plan_name: PlanName;
  payment_method_id?: string; // Optional in mock mode
  trial_days?: number;
}

export interface UpdateSubscriptionParams {
  subscription_id: string;
  plan_name?: PlanName;
  cancel_at_period_end?: boolean;
}

export interface CreatePaymentMethodParams {
  user_id: string;
  type: PaymentMethodType;

  // Card details (if type = 'card')
  card_number?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  card_cvc?: string;

  // Billing details
  billing_name: string;
  billing_email: string;
  billing_address: BillingAddress;

  is_default?: boolean;
}

export interface CheckoutSessionParams {
  user_id: string;
  plan_name: PlanName;
  success_url: string;
  cancel_url: string;
  trial_days?: number;
}

// =====================================================
// COMPUTED TYPES (for UI display)
// =====================================================

export interface SubscriptionDetails extends Subscription {
  is_active: boolean;
  is_trialing: boolean;
  days_remaining: number;
  renewal_date: string | null;
  amount_display: string; // e.g., "$19.99"
}

export interface InvoiceDetails extends Invoice {
  amount_display: string; // e.g., "$19.99"
  status_display: string; // e.g., "Paid"
  date_display: string; // e.g., "Nov 3, 2024"
}

// =====================================================
// PRICING PLANS
// =====================================================

export interface PricingPlan {
  id: PlanName;
  name: string;
  description: string;
  price_cents: number;
  price_display: string; // e.g., "$19.99/month"
  billing_interval: BillingInterval;
  trial_days: number;
  features: string[];
  stripe_price_id: string | null; // Price ID from Stripe Dashboard (null in mock mode)
  recommended?: boolean;
}

export const PRICING_PLANS: Record<PlanName, PricingPlan> = {
  student: {
    id: 'student',
    name: 'Student Plan',
    description: 'Perfect for individual students',
    price_cents: 1999, // $19.99
    price_display: '$19.99/month',
    billing_interval: 'month',
    trial_days: 14,
    stripe_price_id: import.meta.env.VITE_STRIPE_STUDENT_PLAN_PRICE_ID || null,
    recommended: true,
    features: [
      'Real-time grade tracking',
      'AI-powered study tutor',
      'Smart calendar & workload assistant',
      'Missing assignment alerts',
      'Mood tracking & insights',
      'Achievement badges & streaks',
      'Unlimited class enrollment',
      '14-day free trial',
    ],
  },
  teacher: {
    id: 'teacher',
    name: 'Teacher Plan',
    description: 'For educators managing classes',
    price_cents: 59900, // $599/semester (~$100/month)
    price_display: '$599/semester',
    billing_interval: 'month',
    trial_days: 14,
    stripe_price_id: import.meta.env.VITE_STRIPE_TEACHER_PLAN_PRICE_ID || null,
    features: [
      'All Student Plan features',
      'Class sentiment analytics',
      'Create class pulses & questions',
      'Student risk indicators',
      'Office hours management',
      'Feedback hub & templates',
      'Student progress tracking',
      'Free access for your students',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Admin Plan',
    description: 'For school administrators',
    price_cents: 0, // Custom pricing
    price_display: 'Custom pricing',
    billing_interval: 'month',
    trial_days: 30,
    stripe_price_id: null,
    features: [
      'All Teacher Plan features',
      'School-wide analytics',
      'Multi-tenancy support',
      'User management',
      'Bulk enrollment',
      'Custom branding',
      'Priority support',
      'Custom integrations',
    ],
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function formatCurrency(cents: number, currency: Currency = 'usd'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function getSubscriptionStatusDisplay(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: 'Active',
    trialing: 'Trial',
    canceled: 'Canceled',
    past_due: 'Past Due',
    incomplete: 'Incomplete',
    unpaid: 'Unpaid',
  };
  return statusMap[status] || status;
}

export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  const colorMap: Record<SubscriptionStatus, string> = {
    active: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20',
    trialing: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20',
    canceled: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20',
    past_due: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20',
    incomplete: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20',
    unpaid: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20',
  };
  return colorMap[status] || 'text-gray-600 bg-gray-50';
}

export function isSubscriptionActive(subscription: Subscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

export function calculateDaysRemaining(subscription: Subscription): number {
  if (!subscription) return 0;

  const endDate = subscription.status === 'trialing'
    ? subscription.trial_end
    : subscription.current_period_end;

  if (!endDate) return 0;

  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}
