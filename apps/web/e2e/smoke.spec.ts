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

test('chat message list is independently scrollable', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText('DIALOGUE')).toBeVisible();

  // Select world and character
  await page.locator('select').first().selectOption('1');
  await expect(page.locator('select')).toHaveCount(2);
  await page.locator('select').nth(1).selectOption('1');

  // Wait for chat history to load or empty state
  await page.waitForTimeout(500);

  // Send enough messages to overflow the container
  const textarea = page.locator('textarea');
  for (let i = 0; i < 6; i++) {
    await textarea.fill(`Scroll test message ${i}`);
    await textarea.press('Enter');
    await page.waitForTimeout(800);
  }

  // Find the scrollable message container
  const scrollContainer = page.locator('div.overflow-y-auto').first();

  // Verify the container is scrollable (scrollHeight > clientHeight)
  const scrollHeight = await scrollContainer.evaluate((el: HTMLElement) => el.scrollHeight);
  const clientHeight = await scrollContainer.evaluate((el: HTMLElement) => el.clientHeight);
  expect(scrollHeight).toBeGreaterThan(clientHeight);

  // Scroll to top and verify an early message is still in the DOM
  await scrollContainer.evaluate((el: HTMLElement) => { el.scrollTop = 0; });
  await expect(page.getByText('Scroll test message 0')).toBeVisible();

  // Scroll to bottom and verify the latest message is visible
  await scrollContainer.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
  await expect(page.getByText('Scroll test message 5')).toBeVisible();
});
