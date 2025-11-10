/**
 * Unit Tests for useSubscription Hook
 *
 * Tests subscription management hooks including:
 * - useSubscription
 * - useInvoices
 * - usePaymentMethods
 * - usePremiumAccess
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription, useInvoices, usePaymentMethods, usePremiumAccess } from '@/hooks/useSubscription';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

describe('useSubscription Hook', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockSubscription = {
    id: 'sub-123',
    user_id: 'user-123',
    status: 'active',
    plan_name: 'student',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    amount_cents: 1999,
    currency: 'usd',
    created_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSubscription', () => {
    it('should return null subscription when user is not logged in', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subscription).toBeNull();
      expect(result.current.hasActiveSubscription).toBe(false);
    });

    it('should fetch subscription for logged-in user', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
              }),
            }),
          }),
        }),
      });

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      vi.mocked(supabase).from = mockFrom;
      vi.mocked(supabase).channel = vi.fn().mockReturnValue(mockChannel);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.subscription).toBeDefined();
      expect(result.current.hasActiveSubscription).toBe(true);
    });

    it('should handle fetch errors gracefully', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('Network error') }),
              }),
            }),
          }),
        }),
      });

      const mockChannel = {
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
      };

      vi.mocked(supabase).from = mockFrom;
      vi.mocked(supabase).channel = vi.fn().mockReturnValue(mockChannel);

      const { result } = renderHook(() => useSubscription());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.subscription).toBeNull();
    });
  });

  describe('useInvoices', () => {
    const mockInvoices = [
      {
        id: 'inv-1',
        user_id: 'user-123',
        stripe_invoice_id: 'stripe-inv-1',
        amount_paid: 1999,
        amount_due: 1999,
        currency: 'usd',
        status: 'paid',
        created_at: new Date().toISOString(),
      },
    ];

    it('should return empty array when user is not logged in', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => useInvoices());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.invoices).toEqual([]);
    });

    it('should fetch invoices for logged-in user', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockInvoices, error: null }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => useInvoices());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.invoices.length).toBeGreaterThan(0);
    });
  });

  describe('usePaymentMethods', () => {
    const mockPaymentMethods = [
      {
        id: 'pm-1',
        user_id: 'user-123',
        stripe_payment_method_id: 'pm_test_123',
        type: 'card',
        card_brand: 'visa',
        card_last4: '4242',
        is_default: true,
        created_at: new Date().toISOString(),
      },
    ];

    it('should return empty array when user is not logged in', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => usePaymentMethods());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.paymentMethods).toEqual([]);
      expect(result.current.defaultPaymentMethod).toBeNull();
    });

    it('should fetch payment methods and identify default', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockPaymentMethods, error: null }),
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => usePaymentMethods());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.paymentMethods.length).toBeGreaterThan(0);
      expect(result.current.defaultPaymentMethod).toBeDefined();
      expect(result.current.defaultPaymentMethod?.is_default).toBe(true);
    });
  });

  describe('usePremiumAccess', () => {
    it('should return false when user is not logged in', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: null } as any);

      const { result } = renderHook(() => usePremiumAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasAccess).toBe(false);
      expect(result.current.accessReason).toBeNull();
    });

    it('should grant access for user with active subscription', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: mockSubscription, error: null }),
            }),
          }),
        }),
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => usePremiumAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.hasAccess).toBe(true);
      expect(result.current.accessReason).toBe('own_subscription');
    });

    it('should check teacher subscription when user has no subscription', async () => {
      vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call: check own subscription (none found)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                in: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }),
          };
        } else {
          // Second call: check teacher subscription
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
      });

      vi.mocked(supabase).from = mockFrom;

      const { result } = renderHook(() => usePremiumAccess());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Since no teacher subscription either, should return false
      expect(result.current.hasAccess).toBe(false);
    });
  });
});
