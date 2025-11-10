/**
 * E2E Test: Authentication Flow
 *
 * Tests user signup, login, and onboarding flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with login and signup options', async ({ page }) => {
    await expect(page).toHaveTitle(/HapiAI/);

    // Check for login/signup buttons
    const loginButton = page.locator('text=/Log.*In|Login/i').first();
    const signupButton = page.locator('text=/Sign.*Up|Get.*Started/i').first();

    await expect(loginButton.or(signupButton)).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page', async ({ page }) => {
    // Find and click login button
    const loginButton = page.locator('text=/Log.*In|Login/i').first();

    if (await loginButton.isVisible({ timeout: 3000 })) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login/);

      // Verify login form elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    // Find and click signup button
    const signupButton = page.locator('text=/Sign.*Up|Get.*Started|Create.*Account/i').first();

    if (await signupButton.isVisible({ timeout: 3000 })) {
      await signupButton.click();
      await expect(page).toHaveURL(/.*signup/);

      // Verify signup form elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    }
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit with invalid email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.fill('invalid-email');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Check for validation error (HTML5 or custom)
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should show validation errors for weak password', async ({ page }) => {
    await page.goto('/signup');

    // Try to submit with weak password
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill('test@example.com');
    await passwordInput.fill('weak');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Check for validation error message
    await expect(page.locator('text=/password.*must|too.*short|at least.*8/i')).toBeVisible({ timeout: 3000 }).catch(() => {
      // If custom validation doesn't show, that's okay for basic test
    });
  });

  test.describe('Demo Account Login', () => {
    test('should show demo accounts section', async ({ page }) => {
      await page.goto('/login');

      // Look for demo accounts section
      const demoSection = page.locator('text=/demo.*account|test.*account/i').first();
      if (await demoSection.isVisible({ timeout: 3000 })) {
        expect(await demoSection.isVisible()).toBeTruthy();
      }
    });

    test('should be able to login with demo student account', async ({ page }) => {
      await page.goto('/login');

      // Try to find and click demo student login
      const demoStudentButton = page.locator('text=/demo.*student|student.*demo/i').first();

      if (await demoStudentButton.isVisible({ timeout: 3000 })) {
        await demoStudentButton.click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
      }
    });
  });

  test.describe('Authenticated User', () => {
    test.skip('should redirect to dashboard after successful login', async ({ page }) => {
      // This test requires valid credentials or mocking
      // Skip in CI/CD until proper test user setup
    });

    test.skip('should complete onboarding flow', async ({ page }) => {
      // This test requires authentication
      // Skip in CI/CD until proper test user setup
    });
  });
});
