/**
 * Subscription Management Hooks
 *
 * React hooks for managing subscriptions, invoices, and payment methods.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
  Subscription,
  Invoice,
  PaymentMethod,
  SubscriptionDetails,
  InvoiceDetails,
} from '../lib/types/payment';
import {
  formatCurrency,
  isSubscriptionActive,
  calculateDaysRemaining,
  getSubscriptionStatusDisplay,
} from '../lib/types/payment';

// =====================================================
// USE SUBSCRIPTION
// =====================================================

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    fetchSubscription();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  async function fetchSubscription() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Use maybeSingle() instead of single() to handle case where no subscription exists
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        const sub = data as Subscription;
        const details: SubscriptionDetails = {
          ...sub,
          is_active: isSubscriptionActive(sub),
          is_trialing: sub.status === 'trialing',
          days_remaining: calculateDaysRemaining(sub),
          renewal_date: sub.status === 'trialing' ? sub.trial_end : sub.current_period_end,
          amount_display: formatCurrency(sub.amount_cents, sub.currency),
        };
        setSubscription(details);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('[useSubscription] Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  }

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription: subscription ? isSubscriptionActive(subscription) : false,
    isTrialing: subscription?.is_trialing || false,
    daysRemaining: subscription?.days_remaining || 0,
    refetch: fetchSubscription,
  };
}

// =====================================================
// USE INVOICES
// =====================================================

export function useInvoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setInvoices([]);
      setLoading(false);
      return;
    }

    fetchInvoices();
  }, [user]);

  async function fetchInvoices() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const invoiceDetails: InvoiceDetails[] = (data as Invoice[]).map((invoice) => ({
        ...invoice,
        amount_display: formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency),
        status_display: getSubscriptionStatusDisplay(invoice.status as any),
        date_display: new Date(invoice.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }));

      setInvoices(invoiceDetails);
    } catch (err) {
      console.error('[useInvoices] Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
  };
}

// =====================================================
// USE PAYMENT METHODS
// =====================================================

export function usePaymentMethods() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPaymentMethods([]);
      setLoading(false);
      return;
    }

    fetchPaymentMethods();
  }, [user]);

  async function fetchPaymentMethods() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPaymentMethods(data as PaymentMethod[]);
    } catch (err) {
      console.error('[usePaymentMethods] Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payment methods');
    } finally {
      setLoading(false);
    }
  }

  return {
    paymentMethods,
    defaultPaymentMethod: paymentMethods.find((pm) => pm.is_default) || null,
    loading,
    error,
    refetch: fetchPaymentMethods,
  };
}

// =====================================================
// USE PREMIUM ACCESS
// =====================================================

/**
 * Check if user has premium access
 * (via own subscription or teacher's subscription)
 */
export function usePremiumAccess() {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessReason, setAccessReason] = useState<'own_subscription' | 'teacher_subscription' | null>(null);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    checkPremiumAccess();
  }, [user]);

  async function checkPremiumAccess() {
    if (!user) return;

    try {
      setLoading(true);

      // Check if user has own active subscription
      const { data: ownSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

      if (ownSub) {
        setHasAccess(true);
        setAccessReason('own_subscription');
        setLoading(false);
        return;
      }

      // Check if user is in a class with a paying teacher
      const { data: teacherAccess } = await supabase
        .from('class_members')
        .select(`
          class_id,
          classes!inner (
            teacher_id,
            profiles!inner (
              id,
              subscriptions!inner (
                status
              )
            )
          )
        `)
        .eq('user_id', user.id);

      const hasTeacherWithSubscription = teacherAccess?.some((cm: any) => {
        const teacher = cm.classes?.profiles;
        const subscriptions = teacher?.subscriptions;
        return subscriptions?.some((sub: any) => sub.status === 'active' || sub.status === 'trialing');
      });

      if (hasTeacherWithSubscription) {
        setHasAccess(true);
        setAccessReason('teacher_subscription');
      } else {
        setHasAccess(false);
        setAccessReason(null);
      }
    } catch (err) {
      console.error('[usePremiumAccess] Error checking premium access:', err);
      setHasAccess(false);
      setAccessReason(null);
    } finally {
      setLoading(false);
    }
  }

  return {
    hasAccess,
    loading,
    accessReason,
    refetch: checkPremiumAccess,
  };
}
