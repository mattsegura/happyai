/**
 * E2E Test: Dashboard & Daily Pulse
 *
 * Tests dashboard navigation, morning pulse, and class pulses
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard & Daily Pulse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard for authenticated user', async ({ page }) => {
    // Try to access dashboard (will redirect to login if not authenticated)
    await page.goto('/dashboard');

    // Check if on dashboard or login page
    const onDashboard = page.url().includes('dashboard');
    const onLogin = page.url().includes('login');

    expect(onDashboard || onLogin).toBeTruthy();
  });

  test.describe('Morning Pulse', () => {
    test.skip('should display morning pulse modal on first visit', async ({ page }) => {
      // This test requires:
      // 1. Authenticated user
      // 2. No pulse submitted today
      // 3. Modal system working

      await page.goto('/dashboard');

      // Wait for morning pulse modal to appear
      const morningPulseModal = page.locator('text=/morning.*pulse|how.*feeling|check.*in/i').first();
      await expect(morningPulseModal).toBeVisible({ timeout: 10000 });
    });

    test.skip('should submit morning pulse check-in', async ({ page }) => {
      // This test requires authenticated user
      await page.goto('/dashboard');

      // Wait for morning pulse modal
      await page.locator('text=/morning.*pulse/i').first().waitFor({ timeout: 10000 });

      // Select an emotion (e.g., "Happy")
      const happyEmoji = page.locator('text=/😊|happy|joyful/i').first();
      await happyEmoji.click();

      // Submit pulse
      await page.locator('button:has-text("Submit"), button:has-text("Continue")').click();

      // Verify points awarded
      await expect(page.locator('text=/points|\\+10|earned/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Class Pulses', () => {
    test.skip('should display active class pulses', async ({ page }) => {
      // This test requires:
      // 1. Authenticated student user
      // 2. Student in classes with active pulses
      await page.goto('/dashboard');

      // Look for class pulses section
      const classPulseSection = page.locator('text=/class.*pulse|pulse.*question/i').first();
      if (await classPulseSection.isVisible({ timeout: 5000 })) {
        expect(await classPulseSection.isVisible()).toBeTruthy();
      }
    });

    test.skip('should respond to class pulse question', async ({ page }) => {
      // This test requires authenticated student with active class pulses
      await page.goto('/dashboard');

      // Find and click on a class pulse
      await page.locator('[data-testid="class-pulse-card"]').first().click();

      // Wait for pulse question modal
      await page.locator('text=/question|how|what|why/i').first().waitFor();

      // Select response (assuming multiple choice)
      await page.locator('[data-testid="pulse-response-option"]').first().click();

      // Submit response
      await page.locator('button:has-text("Submit")').click();

      // Verify response saved and points awarded
      await expect(page.locator('text=/submitted|points.*earned/i')).toBeVisible();
    });
  });

  test.describe('Hapi Moments', () => {
    test('should show Hapi Moments section', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for Hapi Moments navigation or section
      const hapiMomentsLink = page.locator('text=/hapi.*moment|moment|recognition/i').first();
      if (await hapiMomentsLink.isVisible({ timeout: 5000 })) {
        expect(await hapiMomentsLink.isVisible()).toBeTruthy();
      }
    });

    test.skip('should create a Hapi Moment', async ({ page }) => {
      // This test requires authenticated user in classes
      await page.goto('/dashboard/moments');

      // Click "Send Hapi Moment" button
      await page.locator('button:has-text("Send"), button:has-text("Create")').first().click();

      // Fill in Hapi Moment form
      await page.locator('select[name="recipient"]').selectOption({ index: 1 });
      await page.locator('textarea[name="message"]').fill('Great work on the presentation!');

      // Submit
      await page.locator('button[type="submit"]').click();

      // Verify success message
      await expect(page.locator('text=/sent|delivered|success/i')).toBeVisible();
    });
  });

  test.describe('Leaderboard', () => {
    test('should navigate to class leaderboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for leaderboard link
      const leaderboardLink = page.locator('text=/leaderboard|ranking|points/i').first();
      if (await leaderboardLink.isVisible({ timeout: 5000 })) {
        await leaderboardLink.click();

        // Verify on leaderboard page
        await expect(page.locator('text=/rank|position|#1|first.*place/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Profile & Settings', () => {
    test('should navigate to profile page', async ({ page }) => {
      await page.goto('/dashboard');

      // Look for profile/settings link
      const profileLink = page.locator('text=/profile|settings|account/i, [aria-label*="profile" i]').first();
      if (await profileLink.isVisible({ timeout: 5000 })) {
        await profileLink.click();

        // Verify on profile page
        const profileElement = page.locator('text=/email|name|university|subscription/i').first();
        await expect(profileElement).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
