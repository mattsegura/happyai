/**
 * Test Helper Utilities
 *
 * Reusable utilities for testing
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that includes common providers
 */
export function renderWithRouter(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

/**
 * Create mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock subscription object
 */
export function createMockSubscription(overrides = {}) {
  return {
    id: 'sub-123',
    user_id: 'user-123',
    stripe_customer_id: 'cus_123',
    stripe_subscription_id: 'sub_123',
    plan_name: 'student',
    status: 'active',
    amount_cents: 1999,
    currency: 'usd',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
    trial_start: null,
    trial_end: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock assignment object
 */
export function createMockAssignment(overrides = {}) {
  return {
    id: 'assignment-123',
    name: 'Math Homework',
    description: 'Complete exercises 1-10',
    due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    points_possible: 100,
    course_id: 'course-123',
    course_name: 'Math 101',
    user_id: 'user-123',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock unified event object
 */
export function createMockEvent(overrides = {}) {
  return {
    id: 'event-123',
    title: 'Study Session',
    type: 'study_session' as const,
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    duration: 120,
    ...overrides,
  };
}

/**
 * Create mock achievement object
 */
export function createMockAchievement(overrides = {}) {
  return {
    id: 'achievement-123',
    achievement_key: 'first_assignment',
    name: 'First Steps',
    description: 'Complete your first assignment',
    icon: '🎯',
    category: 'assignments' as const,
    tier: 'bronze' as const,
    points_reward: 50,
    criteria: {
      type: 'on_time_assignments',
      target: 1,
    },
    is_active: true,
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Create mock Supabase response
 */
export function createMockSupabaseResponse<T>(data: T, error: any = null) {
  return Promise.resolve({
    data,
    error,
    count: Array.isArray(data) ? data.length : data ? 1 : 0,
    status: error ? 400 : 200,
    statusText: error ? 'Error' : 'OK',
  });
}
