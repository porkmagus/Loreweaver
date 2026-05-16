import { test, expect } from '@playwright/test';

test('app loads and shows dashboard with seeded world', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  // Verify stat cards rendered (seeded data has worlds + characters)
  await expect(page.getByText('Worlds').first()).toBeVisible();
  await expect(page.getByText('Characters').first()).toBeVisible();
});

test('onboarding page renders correctly', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.getByRole('heading', { name: 'Welcome to Loreweaver' })).toBeVisible();
  await expect(page.getByText('Describe a world and', { exact: false })).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.getByRole('button', { name: /Generate World/i })).toBeVisible();
});

test('dashboard displays stat cards', async ({ page }) => {
  await page.goto('/');
  // Stat labels are duplicated across stat cards and quick links; verify via heading context
  await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  // Verify the 4 stat card labels exist by checking within the stat grid
  const statGrid = page.locator('.grid').first();
  await expect(statGrid.getByText('Worlds').first()).toBeVisible();
  await expect(statGrid.getByText('Characters').first()).toBeVisible();
  await expect(statGrid.getByText('Lore Entries').first()).toBeVisible();
  await expect(statGrid.getByText('Timeline Events').first()).toBeVisible();
});

test('navigation works across main pages', async ({ page }) => {
  await page.goto('/');

  // Navigate via sidebar <nav> only (avoids matching quick-link cards)
  const sidebarNav = page.getByRole('navigation');

  await sidebarNav.getByRole('link', { name: 'Worlds' }).click();
  await expect(page.getByRole('heading', { name: 'Worlds' })).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Characters' }).click();
  await expect(page.getByRole('heading', { name: 'Characters' })).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Lore' }).click();
  await expect(page.getByRole('heading', { name: 'Lore' })).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Timeline' }).click();
  await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Chat' }).click();
  await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible();
});

test('chat page shows world and character selectors', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByRole('heading', { name: 'Chat' })).toBeVisible();
  // World selector is always visible; character selector appears after world selection
  await expect(page.locator('select')).toHaveCount(1);
  // Select the seeded world
  await page.locator('select').first().selectOption('1');
  await expect(page.locator('select')).toHaveCount(2);
});

test('lore page shows entries or empty state', async ({ page }) => {
  await page.goto('/lore');
  await expect(page.getByRole('heading', { name: 'Lore' })).toBeVisible();
  const noEntries = await page.getByText('No lore entries').count();
  if (noEntries > 0) {
    await expect(page.getByText('No lore entries')).toBeVisible();
  }
});
