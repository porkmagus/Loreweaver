import { test, expect } from '@playwright/test';

test('app loads and shows dashboard with seeded world', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.locator('text=Dashboard')).toBeVisible();
  await expect(page.locator('text=Aethelgard')).toBeVisible();
});

test('onboarding page renders correctly', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.locator('text=Welcome to Loreweaver')).toBeVisible();
  await expect(page.locator('text=Describe a world and')).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.locator('button:has-text("Generate World")')).toBeVisible();
});

test('dashboard displays stat cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Worlds')).toBeVisible();
  await expect(page.locator('text=Characters')).toBeVisible();
  await expect(page.locator('text=Lore Entries')).toBeVisible();
  await expect(page.locator('text=Timeline Events')).toBeVisible();
});

test('navigation works across main pages', async ({ page }) => {
  await page.goto('/');

  await page.click('text=Worlds');
  await expect(page.locator('h1:has-text("Worlds")')).toBeVisible();

  await page.click('text=Characters');
  await expect(page.locator('h1:has-text("Characters")')).toBeVisible();

  await page.click('text=Lore');
  await expect(page.locator('h1:has-text("Lore")')).toBeVisible();

  await page.click('text=Timeline');
  await expect(page.locator('h1:has-text("Timeline")')).toBeVisible();

  await page.click('text=Chat');
  await expect(page.locator('h1:has-text("Chat")')).toBeVisible();
});

test('chat page shows world and character selectors', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.locator('text=Select world')).toBeVisible();
  await expect(page.locator('text=Select character')).toBeVisible();
});

test('lore page shows entries or empty state', async ({ page }) => {
  await page.goto('/lore');
  await expect(page.locator('h1:has-text("Lore")')).toBeVisible();
  const noEntries = await page.locator('text=No lore entries').count();
  if (noEntries > 0) {
    await expect(page.locator('text=No lore entries')).toBeVisible();
  }
});
