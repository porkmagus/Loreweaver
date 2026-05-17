import { test, expect } from '@playwright/test';

test('app loads and shows dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Loreweaver/);
  // Dashboard should show the archive overview label
  await expect(page.getByText('ARCHIVE OVERVIEW').first()).toBeVisible();
  // Either a world name is shown or the empty-state heading
  const worldHeading = page.locator('h1').first();
  await expect(worldHeading).toBeVisible();
});

test('onboarding page renders correctly', async ({ page }) => {
  await page.goto('/onboarding');
  await expect(page).toHaveTitle(/Loreweaver/);
  await expect(page.getByRole('heading', { name: 'Loreweaver' })).toBeVisible();
  await expect(page.getByText('Describe a world and', { exact: false })).toBeVisible();
  await expect(page.locator('textarea')).toBeVisible();
  await expect(page.getByRole('button', { name: /Generate World/i })).toBeVisible();
});

test('dashboard displays stat cards when world exists', async ({ page }) => {
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
  await expect(page.getByText('REALMS').first()).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Characters' }).click();
  await expect(page.getByText('PERSONAS').first()).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Lore' }).click();
  await expect(page.getByText('CODEX').first()).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Timeline' }).click();
  await expect(page.getByText('CHRONICLE').first()).toBeVisible();

  await sidebarNav.getByRole('link', { name: 'Chat' }).click();
  await expect(page.getByText('DIALOGUE').first()).toBeVisible();
});

test('chat page shows world and character selectors', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText('DIALOGUE').first()).toBeVisible();
  // World selector is always visible
  await expect(page.locator('select')).toHaveCount(1);

  // Wait for worlds to load, then select the first real option (skip placeholder)
  const worldSelect = page.locator('select').first();
  await worldSelect.waitFor({ state: 'visible' });
  await page.waitForTimeout(800);

  // Select the first non-empty option
  const firstWorldOption = await worldSelect.locator('option[value]:not([value=""])').first().getAttribute('value');
  if (!firstWorldOption) {
    test.skip(true, 'No worlds available in database');
    return;
  }
  await worldSelect.selectOption(firstWorldOption);

  // After selecting a world, wait for characters to load
  await page.waitForTimeout(800);
  const selects = page.locator('select');
  const count = await selects.count();
  // Should now have world + character selectors
  expect(count).toBeGreaterThanOrEqual(2);
});

test('lore page loads with codex header', async ({ page }) => {
  await page.goto('/lore');
  await expect(page.getByText('CODEX').first()).toBeVisible();
});

test('chat message list renders when character selected', async ({ page }) => {
  await page.goto('/chat');
  await expect(page.getByText('DIALOGUE').first()).toBeVisible();

  // Select first available world
  const worldSelect = page.locator('select').first();
  await worldSelect.waitFor({ state: 'visible' });
  await page.waitForTimeout(800);

  const firstWorldOption = await worldSelect.locator('option[value]:not([value=""])').first().getAttribute('value');
  if (!firstWorldOption) {
    test.skip(true, 'No worlds available');
    return;
  }
  await worldSelect.selectOption(firstWorldOption);

  // Wait for character selector to appear
  await page.waitForTimeout(800);
  const selects = page.locator('select');
  const count = await selects.count();
  if (count < 2) {
    test.skip(true, 'No characters available for selected world');
    return;
  }

  // Select first character
  const charSelect = selects.nth(1);
  const firstCharOption = await charSelect.locator('option[value]:not([value=""])').first().getAttribute('value');
  if (!firstCharOption) {
    test.skip(true, 'No characters available');
    return;
  }
  await charSelect.selectOption(firstCharOption);

  // Verify chat panel appears (textarea with character-specific placeholder)
  const textarea = page.locator('textarea');
  await expect(textarea).toBeVisible();
  const placeholder = await textarea.getAttribute('placeholder');
  expect(placeholder).toContain('Address');

  // Verify the message scroll container exists
  const scrollContainer = page.locator('.flex-1.min-h-0.overflow-y-auto').first();
  await expect(scrollContainer).toBeVisible();
});
