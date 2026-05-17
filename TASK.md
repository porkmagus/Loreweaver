# TASK.md

# Current Objective

Execute a Provider Settings Form Correctness, Fallback Visuals, and Smart Navigation Fix Pass.

The settings page still has incorrect default values and broken clearing behavior. Some fallback character art has visual glitches. Dashboard action links route to generic selection pages instead of the active/generated world context.

This is a targeted correctness and usability bugfix pass.

Do not add new providers.
Do not redesign the entire app.
Do not rewrite provider architecture.
Do not add new major features.

---

# Critical Reported Issues

## 1. Custom OpenAI Text Provider Still Opens With Localhost Base URL

Current behavior:

- Text Provider → Custom OpenAI-compatible opens with a localhost base URL.
- Removing/clearing the field does not make requests use the official OpenAI endpoint.
- This contradicts expected OpenAI-compatible behavior.

Required behavior:

For Custom OpenAI-compatible text provider:

- Base URL field should default to empty unless user explicitly saved a custom value.
- Empty base URL means official OpenAI-compatible default endpoint.
- Do not prefill localhost for Custom OpenAI-compatible.
- Localhost should only appear for local-provider presets such as Ollama Local or LM Studio if explicitly supported.

Expected:

```txt
Custom OpenAI-Compatible:
Base URL value: ""
Placeholder: https://api.openai.com/v1 or "Leave empty for official OpenAI endpoint"
Effective runtime URL if empty: official endpoint
```

Do not store placeholder text as actual field value.

---

## 2. Clearing Provider Fields Does Not Work Correctly

Current behavior:

- Deleting text from provider fields does not seem to clear the saved value.
- Test functions may still use stale stored values.
- This likely affects base URL, API key, model fields, and image/embedding provider fields.

Required behavior:

When a user clears a field and saves:

- empty string must be persisted as intentional empty value OR treated as unset consistently
- old value must not reappear
- test functions must use the current visible form state
- backend runtime config must update immediately
- localStorage/DB/runtime memory must not silently restore old value

This must be fixed for:

- text provider base URL
- text provider API key
- text model
- embedding provider base URL
- embedding API key
- embedding model
- image provider base URL
- image API key
- image model

---

# 3. Effective Value vs Display Value Must Be Explicit

Implement clear distinction:

## Display Value

What appears in the input.

## Placeholder

Hint text only.

## Effective Runtime Value

What backend uses after applying defaults.

Rules:

- placeholder text must never become saved config
- clearing input must actually clear saved config
- official endpoint defaults should be applied at runtime, not inserted into user field
- provider presets may set values only when user selects the preset
- saved user values must not be overwritten by accidental default hydration

Add helper utilities if needed.

---

# 4. Provider Test Functions Must Use Current Form State

Current issue:

- Test buttons may use stale backend/localStorage values instead of the visible form values.

Required behavior:

When user edits fields and clicks Test:

- test must use currently visible form values
- no Save should be required just to test edited values
- clearing a field before Test should test with that cleared field
- test result should explain effective endpoint/model used

Apply this to:

- Text Provider test
- Embedding Provider test if present
- Image Provider test

---

# 5. Official OpenAI Endpoint Behavior

For OpenAI/OpenAI-compatible cloud behavior:

- empty base URL should use official endpoint
- official endpoint should not be saved into field unless user types it
- localhost must not be used for OpenAI/OpenAI-compatible by default

If the code needs a concrete runtime URL, resolve it internally.

Example:

```ts
const effectiveBaseUrl = config.baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL;
```

But the UI field remains empty.

---

# 6. Fallback Character Art Glitch

Current behavior:

- static placeholder/fallback character image has graphical glitch
- shading covers only half of it
- looks like a random window/object

Required behavior:

Fix fallback portrait SVG/rendering.

Fallback portraits should be:

- clean
- symmetrical or intentionally composed
- visually consistent
- no accidental half-shading glitch
- no confusing window/object artifact
- aligned with dark archive/codex aesthetic

Do not require live image generation.

This fallback must look acceptable in:

- character cards
- chat header
- character detail pages

---

# 7. Dashboard Smart Navigation

Current behavior:

- App opens/defaults to a specific world.
- Dashboard actions like EXPLORE WORLD and CONVERSE route to generic selection pages.
- User must re-select the world/character repeatedly.

Required behavior:

Dashboard should route intelligently based on current/active/latest world.

Examples:

## Explore World

If an active/latest world exists:

```txt
/worlds/:worldId
```

Otherwise:

```txt
/worlds
```

## Converse

If active/latest world exists and it has characters:

```txt
/characters/:characterId/chat
```

Prefer:
- most recently active character
- first character in active world
- otherwise characters list

If no world/character exists:

```txt
/characters
```

Goal:

- reduce redundant selection
- keep user in current generated world context
- make dashboard CTAs feel smart

---

# 8. Active World/Character State

If no explicit active state exists, implement minimal pragmatic logic:

- use latest generated/created world
- use first character in that world
- store last active world/character in localStorage if simple

Do not add complex user profiles or account systems.

---

# Required Investigation

Before fixing, inspect:

- Settings.tsx field hydration logic
- provider config persistence
- provider defaults
- localStorage behavior
- backend settings routes
- provider test routes
- provider runtime config merge behavior
- fallback SVG generation code
- Dashboard CTA routes
- world/character active state behavior

---

# Required Tests

Add/update tests where practical:

## Provider Settings

- clearing baseUrl removes previous value
- Custom OpenAI-compatible empty baseUrl resolves to official endpoint internally
- Ollama Local still defaults to localhost
- OpenRouter still defaults correctly
- test function uses submitted form config, not stale stored config

## Visual Fallback

- fallback portrait generation returns valid SVG/data URI
- fallback status remains fallback/deterministic

## Navigation

- dashboard Explore World points to latest/active world when available
- dashboard Converse points to character chat when character exists

Frontend/E2E tests if practical are preferred for navigation/settings behavior.

---

# Manual Verification Required

Perform and report:

1. Open Settings.
2. Select Custom OpenAI-compatible text provider.
3. Confirm Base URL input is empty.
4. Confirm placeholder explains official endpoint.
5. Type localhost into base URL, save, reload settings, confirm it persists.
6. Clear base URL, save, reload settings, confirm it remains empty.
7. Click Test after clearing base URL, confirm effective endpoint is official, not stale localhost.
8. Select Ollama Local, confirm localhost appears only there.
9. Select Ollama Cloud, confirm `https://www.ollama.com/v1`.
10. Test image generation in disabled/fallback mode.
11. Clear image base URL, save/reload, confirm stale value does not return.
12. Inspect fallback character art visually.
13. Confirm dashboard Explore World routes directly to active/latest world.
14. Confirm dashboard Converse routes directly to an active/latest character chat when available.
15. Confirm chat still works.
16. Confirm world generation still works.

---

# Verification Commands

Run and report:

```bash
npm run typecheck
npm run build
npm test --workspace=apps/api
docker compose up -d --build
```

If frontend tests exist and can be run:

```bash
npm run test:e2e
```

or Dockerized equivalent.

---

# Constraints

Do not:

- add new providers
- add auth/accounts
- rewrite provider architecture
- redesign Settings from scratch
- redesign Dashboard from scratch
- break streaming chat
- break provider persistence
- break world generation
- silently modify `.env`

Preserve:

- GUI-first provider setup
- custom OpenAI-compatible support
- Ollama support
- OpenRouter support
- image provider support
- embedding provider support
- fallback/simulated mode
- current visual direction
- Docker-first runtime

---

# Success Criteria

- Custom OpenAI-compatible base URL defaults to empty
- clearing fields truly clears stored/runtime values
- provider tests use current form state
- official endpoint fallback works internally without polluting input fields
- Ollama Local is the only place localhost appears by default
- fallback character art looks clean
- Dashboard CTAs route intelligently to active/latest world/character
- app functionality remains intact
- build/typecheck/tests pass

---

# Phase 4.5 — Cohesion & Resilience Fixes (Completed)

## Principles
- No new user-facing features.
- No breaking API or DB schema changes.
- No dependency additions.
- Preserve all existing behavior; only fix inefficiencies, duplication, and papercuts.
- Every file change passes the existing test suite.

## Phase A: API Backend (Cohesion + Performance)

### A1. Cache OpenAI client after first instantiation
- **Files**: `apps/api/src/services/embedding.ts`, `apps/api/src/services/provider.ts`
- Added module-level `cachedOpenAIClient` and `cachedEmbeddingClient` with key-based invalidation (`apiKey + baseURL`).

### A2. Centralize `hasLiveProvider()`
- **Files**: `apps/api/src/services/provider.ts` (add), `apps/api/src/services/chatService.ts`, `apps/api/src/services/worldGenerationService.ts`, `apps/api/src/services/runtimeConfig.ts`, `apps/api/src/routes/health.ts`
- Exported `hasLiveProvider(cfg?)` from `provider.ts`. Replaced all 4 inline `Boolean(cfg.chatModel)` copies.

### A3. Batch Postgres lookup in semantic search
- **Files**: `apps/api/src/routes/search.ts`, `apps/api/src/services/loreService.ts`
- Added `getLoreByIds(ids)` using `inArray(loreEntries.id, ids)`. Search route now does a single batch query instead of N round-trips.

### A4. Move `ensureCollection()` from per-request to startup-time
- **Files**: `apps/api/src/services/qdrant.ts`, `apps/api/src/startup.ts`
- Added `collectionChecked` flag in `qdrant.ts`. Called `ensureCollection()` once during `startup()` sequence.

### A5. Deduplicate provider defaulting logic
- **Files**: `apps/api/src/services/provider.ts`
- Removed redundant inline `if (!baseUrl)` defaulting in `resolveProviderConfig`. `applyProviderDefaults` now runs once on the final merged config.

### A6. Align empty-string semantics in image provider
- **Files**: `apps/api/src/services/imageProvider.ts`
- `getEnvImageProviderConfig()` now preserves empty strings (same as `provider.ts`) instead of converting to `undefined`. Makes clearing behavior consistent.

### A7. Add timeout to custom image endpoint fetch
- **Files**: `apps/api/src/services/imageProvider.ts`
- Added `AbortSignal.timeout(CUSTOM_ENDPOINT_TIMEOUT_MS)` to the custom image proxy `fetch` call.

## Phase B: Web Frontend (UX + Resilience)

### B1. Clear Settings draft from localStorage after successful save
- **Files**: `apps/web/src/pages/Settings.tsx`
- `localStorage.removeItem(STORAGE_KEY)` and `localStorage.removeItem(IMAGE_STORAGE_KEY)` after successful save.

### B2. Add request timeout to `apiPost` / `apiPatch` / `apiDelete`
- **Files**: `apps/web/src/hooks/useApi.ts`
- Added `fetchWithTimeout()` helper (15s default via `AbortController`).

### B3. Fix Dashboard localStorage write thrashing
- **Files**: `apps/web/src/pages/Dashboard.tsx`
- Split single `useEffect` into two gated effects that only write when the derived selection differs from stored state.

### B4. Scope Dashboard loading spinner to banner only
- **Files**: `apps/web/src/pages/Dashboard.tsx`
- Changed hero spinner condition from `anyLoading && !world` to `wLoading && !world`.

## Phase C: Regression & Commit

- API tests: 8 files, 73 tests ✅
- Web tests: 5 files, 13 tests ✅
- Web build: ✅
- Docker stack rebuild: ✅
- End-to-end lore pipeline (create → ingest → search): ✅
- Commit: `refactor: cohesion and resilience fixes across api and web`

## Explicitly Excluded

- **Chat history pagination** (`HISTORY_LIMIT = 20`): User-facing feature change deferred.
- **useApi request deduplication**: Module-level promise cache deferred due to edge-case risk.
- **Any new dependencies**: None required.
