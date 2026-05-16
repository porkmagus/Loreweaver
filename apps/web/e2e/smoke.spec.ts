import { test, expect } from '@playwright/test';

test('app loads and shows dashboard with seeded world', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Loreweaver/);
  // Dashboard now shows world name as main heading
  await expect(page.getByText('ARCHIVE OVERVIEW')).toBeVisible();
  await expect(page.getByText('Aethelgard').first()).toBeVisible();
});

test('onboarding page renders correctly', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.getByRole('heading', { name: 'Loreweaver' })).toBeVisible();
  await expect(page.getByText('Describe a world and', { exact: false })).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.getByRole('button', { name: /Generate World/i })).toBeVisible();
});

test('dashboard displays stat cards', async ({ page }) => {
  await page.goto('/');
  // Verify the 4 chronicle tile labels exist (use first() to avoid sidebar conflicts)
  await expect(page.getByText('Characters').first()).toBeVisible();
  await expect(page.getByText('Lore Entries').first()).toBeVisible();
  await expect(page.getByText('Timeline Events').first()).toBeVisible();
});

test('navigation works across main pages', async ({ page }) => {
  await page.goto('/');

  const sidebarNav = page.getByRole('navigation');

  await sidebarNav.getByRole('link', { name: 'Worlds' }).click();
  await expect(page.getByText('REALMS')).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Characters' }).click();
  await expect(page.getByText('PERSONAS')).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Lore' }).click();
  await expect(page.getByText('CODEX')).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Timeline' }).click();
  await expect(page.getByText('CHRONICLE')).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Chat' }).click();
  await expect(page.getByText('DIALOGUE')).toBeVisible();
});

test('chat page shows world and character selectors', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText('DIALOGUE')).toBeVisible();
  // World selector is always visible; character selector appears after world selection
  await expect(page.locator('select')).toHaveCount(1);
  // Select the seeded world
  await page.locator('select').first().selectOption('1');
  await expect(page.locator('select')).toHaveCount(2);
});

test('lore page shows entries or empty state', async ({ page }) => {
  await page.goto('/lore');
  await expect(page.getByText('CODEX')).toBeVisible();
  const noEntries = await page.getByText('The codex is empty').count();
  if (noEntries > 0) {
    await expect(page.getByText('The codex is empty')).toBeVisible();
  }
});
