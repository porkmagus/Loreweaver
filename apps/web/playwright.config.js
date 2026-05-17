import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: process.env.WEB_URL ?? 'http://localhost:5173',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
});
//# sourceMappingURL=playwright.config.js.map