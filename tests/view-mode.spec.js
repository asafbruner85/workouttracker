import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5174';

async function ensureLoggedIn(page) {
  const passwordField = page.locator('input[type="password"]');
  if (await passwordField.isVisible().catch(() => false)) {
    await passwordField.fill('asaf2024');
    await page.click('button:has-text("Login")');
    await page.waitForSelector('button:has-text("Logout")', { timeout: 5000 });
  }
}

test.describe('View mode persistence', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate first, then clear localStorage via evaluate (not addInitScript which runs on every reload)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await ensureLoggedIn(page);
  });

  test('daily view persists after page refresh', async ({ page }) => {
    // Start in default weekly view
    await expect(page.locator('button:has-text("Weekly")')).toHaveClass(/bg-blue-600/);

    // Switch to Daily
    await page.click('button:has-text("Daily")');
    await expect(page.locator('button:has-text("Daily")')).toHaveClass(/bg-blue-600/);

    // Confirm localStorage was written
    const stored = await page.evaluate(() => localStorage.getItem('viewMode'));
    expect(stored).toBe('daily');

    // Reload WITHOUT clearing localStorage
    await page.reload({ waitUntil: 'networkidle' });

    // Should still be on Daily
    await expect(page.locator('button:has-text("Daily")')).toHaveClass(/bg-blue-600/);
  });

  test('weekly view persists after page refresh', async ({ page }) => {
    // Switch to Daily first, then back to Weekly
    await page.click('button:has-text("Daily")');
    await page.click('button:has-text("Weekly")');
    await expect(page.locator('button:has-text("Weekly")')).toHaveClass(/bg-blue-600/);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('button:has-text("Weekly")')).toHaveClass(/bg-blue-600/);
  });

  test('monthly view persists after page refresh', async ({ page }) => {
    await page.click('button:has-text("Monthly")');
    await expect(page.locator('button:has-text("Monthly")')).toHaveClass(/bg-blue-600/);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.locator('button:has-text("Monthly")')).toHaveClass(/bg-blue-600/);
  });
});
