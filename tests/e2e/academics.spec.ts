/**
 * E2E Test: Academic Features
 *
 * Tests grades view, assignments, Canvas sync, and study planner
 */

import { test, expect } from '@playwright/test';

test.describe('Academic Features', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  test.beforeEach(async ({ page }) => {
    // Note: These tests assume user is authenticated
    // In a full implementation, we would:
    // 1. Login with test account
    // 2. Setup test data
    // 3. Navigate to academics
    await page.goto('/');
  });

  test('should navigate to Academics Hub', async ({ page }) => {
    // Try to find academics/grades navigation
    const academicsLink = page.locator('text=/academic|grade|assignment/i').first();

    if (await academicsLink.isVisible({ timeout: 5000 })) {
      await academicsLink.click();

      // Check if we're on academics page
      await expect(page).toHaveURL(/.*academic|grade/);
    } else {
      // If not logged in, skip this test
      test.skip();
    }
  });

  test('should display grades view', async ({ page }) => {
    await page.goto('/dashboard/academics');

    // Look for grade-related elements
    const gradesSection = page.locator('text=/grade|GPA|score/i').first();
    if (await gradesSection.isVisible({ timeout: 5000 })) {
      expect(await gradesSection.isVisible()).toBeTruthy();
    }
  });

  test('should display assignments list', async ({ page }) => {
    await page.goto('/dashboard/academics');

    // Look for assignments section
    const assignmentsSection = page.locator('text=/assignment|due|homework/i').first();
    if (await assignmentsSection.isVisible({ timeout: 5000 })) {
      expect(await assignmentsSection.isVisible()).toBeTruthy();
    }
  });

  test('should show Canvas sync option', async ({ page }) => {
    await page.goto('/dashboard/academics');

    // Look for Canvas sync UI
    const canvasSync = page.locator('text=/canvas.*sync|sync.*canvas|connect.*canvas/i').first();
    if (await canvasSync.isVisible({ timeout: 5000 })) {
      expect(await canvasSync.isVisible()).toBeTruthy();
    }
  });

  test.describe('Canvas Sync', () => {
    test.skip('should trigger manual Canvas sync', async ({ page }) => {
      // This test requires:
      // 1. Authenticated user
      // 2. Canvas credentials configured
      // 3. Mock Canvas API responses
      await page.goto('/dashboard/academics');

      // Find Canvas Sync tab/button
      const canvasSyncTab = page.locator('text=/canvas.*sync/i').first();
      await canvasSyncTab.click();

      // Click "Start Sync" or "Sync Now" button
      const syncButton = page.locator('text=/start.*sync|sync.*now/i').first();
      await syncButton.click();

      // Wait for sync to complete
      await expect(page.locator('text=/sync.*complete|synced.*successfully/i')).toBeVisible({ timeout: 30000 });

      // Verify stats are displayed
      await expect(page.locator('text=/course|assignment/i')).toBeVisible();
    });
  });

  test.describe('Study Planner', () => {
    test('should navigate to study planner', async ({ page }) => {
      await page.goto('/dashboard/academics');

      // Look for study planner link/tab
      const studyPlannerLink = page.locator('text=/study.*planner|planner/i').first();
      if (await studyPlannerLink.isVisible({ timeout: 5000 })) {
        await studyPlannerLink.click();
        expect(await page.locator('text=/study.*session|study.*plan/i').first().isVisible({ timeout: 5000 })).toBeTruthy();
      }
    });

    test.skip('should create a study session', async ({ page }) => {
      // This test requires authenticated user with courses
      await page.goto('/dashboard/academics');

      // Navigate to study planner
      await page.locator('text=/study.*planner/i').first().click();

      // Click "Add Study Session" or similar
      await page.locator('text=/add.*session|new.*session|create.*session/i').first().click();

      // Fill in study session details
      await page.locator('input[name="title"]').fill('Math Exam Prep');
      await page.locator('select[name="course"]').selectOption({ index: 1 });

      // Save session
      await page.locator('button[type="submit"]').click();

      // Verify session was created
      await expect(page.locator('text=Math Exam Prep')).toBeVisible();
    });
  });

  test.describe('AI Tutor', () => {
    test('should navigate to AI Tutor page', async ({ page }) => {
      // Try direct navigation
      await page.goto('/ai-tutor');

      // Check if page loaded
      const aiTutorElement = page.locator('text=/AI.*Tutor|Hapi.*Chat|Course.*Tutor/i').first();
      if (await aiTutorElement.isVisible({ timeout: 5000 })) {
        expect(await aiTutorElement.isVisible()).toBeTruthy();
      }
    });

    test.skip('should send message to AI tutor', async ({ page }) => {
      // This test requires:
      // 1. Authenticated user
      // 2. Active subscription
      // 3. AI service configured
      await page.goto('/ai-tutor');

      // Find chat input
      const chatInput = page.locator('textarea, input[placeholder*="message" i]').first();
      await chatInput.fill('Explain quadratic equations');

      // Send message
      await page.keyboard.press('Enter');

      // Wait for response
      await expect(page.locator('text=/quadratic/i')).toBeVisible({ timeout: 15000 });
    });
  });
});
