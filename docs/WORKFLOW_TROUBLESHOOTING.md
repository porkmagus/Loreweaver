# GitHub Workflow Troubleshooting Guide

## Issue Analysis (2026-05-17)

### Test Failures Identified
- **30 failing E2E tests** across chromium, firefox, and webkit
- **All failures**: Locator timeout errors for dashboard text elements
  - `ARCHIVE OVERVIEW` — not found on dashboard
  - `Lore Entries` — stat card not rendering
  - `CODEX` — lore page heading not found
  - `DIALOGUE` — chat page heading not found

### Root Causes

#### 1. **Playwright Configuration Mismatch**
**Problem**: `playwright.config.ts` only declared `chromium` project, but test output shows all three browsers (chromium, firefox, webkit).
- This suggests the config was misaligned with actual test expectations

**Fix**:
- Added all three browser projects: `chromium`, `firefox`, `webkit`
- Properly declare the browsers being tested

#### 2. **reuseExistingServer in CI Environment**
**Problem**: `reuseExistingServer: true` can cause Playwright to attempt reusing stale servers in GitHub Actions, especially during retries.
- Server from previous run or another workflow might be used
- Fresh server might not be properly initialized

**Fix**:
- Disabled webServer in CI (`process.env.CI ? undefined`)
- Ensures services are started by docker compose, not by Playwright
- Prevents server reuse conflicts

#### 3. **Missing Environment Variables in Workflow**
**Problem**: Workflow created empty `.env` file with `touch .env`, but services need:
- Database configuration (POSTGRES_* vars)
- API configuration (API_PORT, API_HOST)
- Frontend-to-API connection (VITE_API_URL)

**Fix**:
- Workflow now generates complete `.env` file with all required variables
- API_URL explicitly set to `http://localhost:3001`
- Database URL properly formatted for connection

#### 4. **Docker Compose Wait Strategy**
**Problem**: Original workflow only waited for API health check, but didn't ensure all services were fully ready before starting tests.

**Fix**:
- Changed `docker compose up -d` to `docker compose up -d --wait`
- Ensures all healthchecks pass before proceeding
- Database migrations and seeding complete before tests start

#### 5. **Playwright CI Configuration**
**Problem**: Original config had `fullyParallel: true` even in CI, which can overwhelm resources and cause timeouts on GitHub Actions runners.

**Fix**:
- `fullyParallel` now disables in CI (`!process.env.CI`)
- Workers set to 1 in CI (as before)
- Consistent retry logic (2 retries in CI)

### Files Modified

#### `.github/workflows/playwright.yml`
```yaml
# Key changes:
1. Environment generation:
   - Create .env with postgres, API, and web URL config
   - VITE_API_URL set to http://localhost:3001

2. Docker startup:
   - Use docker compose up -d --wait
   - Ensures services ready before health checks

3. Test execution:
   - Pass VITE_API_URL and WEB_URL as env vars
   - Explicit CI=true flag
```

#### `apps/web/playwright.config.ts`
```ts
// Key changes:
1. Browser projects:
   - Added firefox and webkit (were missing)

2. Web server handling:
   - Disabled in CI (services managed by docker compose)
   - Prevents server reuse conflicts

3. Parallelization:
   - fullyParallel disabled in CI
   - Matches resource constraints of GitHub Actions
```

## Testing Recommendations

### Local Verification
```bash
# 1. Start services
docker compose up -d --wait

# 2. Verify API health
curl http://localhost:3001/api/health

# 3. Run E2E tests locally
npm run test:e2e

# 4. View results
npx playwright show-report
```

### GitHub Actions Debugging
If tests still fail after these fixes:

1. **Check API logs**: `docker compose logs api`
2. **Verify database**: `docker compose logs postgres`
3. **Check Playwright trace**: Download artifact from Actions run
4. **Verify seeding**: Check if test worlds/characters exist in database

## Expected Behavior After Fixes

✅ **Workflow should now**:
- Generate complete `.env` file before services start
- Start docker services with full health checks
- Ensure all three browser projects run in CI
- Test elements are found and visible within 5s timeout
- Generate HTML reports for failed tests (stored as artifacts)

✅ **Tests should now**:
- Find dashboard overview text
- Load stat cards (Characters, Lore Entries, Timeline Events)
- Navigate between pages (Worlds, Characters, Lore, Timeline, Chat)
- Display chat and lore page headers

## Prevention Tips

1. **Always test locally** before pushing: `npm run verify`
2. **Review env variables** when adding new features
3. **Update playwright config** when adding new browser projects
4. **Use docker compose --wait** to ensure service readiness
5. **Monitor CI logs** for new failures and document root causes
