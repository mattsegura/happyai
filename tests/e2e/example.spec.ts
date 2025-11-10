/**
 * Example E2E Test
 *
 * This is a template for E2E tests using Playwright.
 * Expand this to cover all critical user flows.
 */

import { test, expect } from '@playwright/test';

test.describe('HapiAI Application', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');

    // Check if page loads
    await expect(page).toHaveTitle(/HapiAI|Hapi/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');

    // Find and click login button
    const loginButton = page.locator('text=Login, text=Sign In').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test.skip('should complete signup flow', async ({ page }) => {
    // TODO: Implement full signup flow
    // 1. Navigate to signup
    // 2. Fill in form
    // 3. Submit
    // 4. Verify redirect to dashboard
    await page.goto('/signup');
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test.skip('should complete daily pulse check-in', async ({ page }) => {
    // TODO: Implement pulse check-in flow
    // 1. Login
    // 2. Wait for morning pulse modal
    // 3. Select emotion
    // 4. Submit
    // 5. Verify points awarded
  });

  test.skip('should sync Canvas data', async ({ page }) => {
    // TODO: Implement Canvas sync flow
    // 1. Navigate to Academics Hub
    // 2. Click Canvas Sync tab
    // 3. Click "Start Sync" button
    // 4. Wait for sync to complete
    // 5. Verify stats displayed
  });
});

/**
 * ADDITIONAL E2E TESTS TO IMPLEMENT:
 *
 * 1. tests/e2e/onboarding.spec.ts
 *    - Signup flow
 *    - Profile completion
 *    - Canvas connection
 *
 * 2. tests/e2e/dailyPulse.spec.ts
 *    - Morning pulse check-in
 *    - Class pulse responses
 *    - Hapi Moments
 *
 * 3. tests/e2e/academics.spec.ts
 *    - View grades
 *    - View assignments
 *    - Use AI tutor
 *    - Create study plan
 *
 * 4. tests/e2e/subscription.spec.ts
 *    - Subscribe to plan
 *    - Cancel subscription
 *    - View billing history
 *
 * 5. tests/e2e/canvas-sync.spec.ts
 *    - Trigger manual sync
 *    - View synced data
 *    - Handle sync errors
 */
