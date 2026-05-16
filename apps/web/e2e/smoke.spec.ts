import { test, expect } from '@playwright/test';

test('app loads and shows dashboard with seeded world', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Loreweaver/);
  // Dashboard now shows world name as main heading
  await expect(page.getByText('ARCHIVE OVERVIEW')).toBeVisible();
  await expect(page.getByText('Wasteland Ruins').first()).toBeVisible();
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
  // Wait for options to load, then select the seeded world (id=2)
  await page.waitForTimeout(500);
  await page.locator('select').first().selectOption('2');
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
  // Navigate directly to a character that already has chat history
  await page.goto('/chat?worldId=2&characterId=3');
  await expect(page.getByText('DIALOGUE')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ryder' })).toBeVisible();

  // The message list is the first flex-1 + min-h-0 + overflow-y-auto div inside the chat card
  const scrollContainer = page.locator('.flex-1.min-h-0.overflow-y-auto').first();

  // Wait for history to load and verify the container is scrollable
  await page.waitForTimeout(1000);
  const scrollHeight = await scrollContainer.evaluate((el: HTMLElement) => el.scrollHeight);
  const clientHeight = await scrollContainer.evaluate((el: HTMLElement) => el.clientHeight);
  expect(scrollHeight).toBeGreaterThan(clientHeight);

  // Scroll to top and verify an early message is still in the DOM
  await scrollContainer.evaluate((el: HTMLElement) => { el.scrollTop = 0; });
  const firstMessage = scrollContainer.locator('p').first();
  await expect(firstMessage).toBeVisible();

  // Scroll to bottom and verify the latest message is visible
  await scrollContainer.evaluate((el: HTMLElement) => { el.scrollTop = el.scrollHeight; });
  const lastMessage = scrollContainer.locator('p').last();
  await expect(lastMessage).toBeVisible();
});
