# Implementation Plan

[Overview]
Fix UI overflow, correct environment fallback behavior for image provider API keys, and conduct a full audit of the Settings page for consistency, validation, and UX conventions.

The Settings page (`apps/web/src/pages/Settings.tsx`) and its backing API (`apps/api/src/routes/settings.ts`, `apps/api/src/services/imageProvider.ts`, `apps/api/src/services/provider.ts`) have several interconnected bugs and UX issues:

1. **Text Provider "Current Configuration" overflow**: The read-only summary panel uses `grid grid-cols-2` with no text truncation or wrapping. When a long OpenAI API key (e.g., `sk-proj-...`) is displayed, it overflows the card boundary and runs off-screen.

2. **Image Provider API key fallback broken**: The UI placeholder states "falls back to OPENAI_API_KEY if empty", but the backend `resolveImageProviderConfig()` uses the nullish coalescing operator (`??`) to merge override values. Because the frontend sends an empty string `''` for `apiKey` when the field is left blank, `'' ?? base.apiKey` evaluates to `''` rather than `base.apiKey`, so the env fallback never activates. The same pattern exists in `resolveProviderConfig()` for `baseUrl` and `apiKey`.

3. **Environment inconsistency**: The root `.env` file sets `IMAGE_GENERATION_ENABLED=true` but omits `IMAGE_PROVIDER`, causing the backend to resolve `provider: 'disabled'` with `enabled: true` — a contradictory state.

4. **Image save button validation bug**: The disabled logic `!!imageForm.provider && imageForm.provider !== 'disabled' && !imageForm.model` evaluates to `false` when `provider` is `undefined` (initial state), enabling the Save button even though no model is configured.

5. **Image preset resets apiKey to empty string**: `applyImagePreset` explicitly sets `apiKey: ''`, which permanently clobbers any previously entered or env-resolved key and again breaks the fallback chain.

6. **Custom-openai baseUrl empty string handling**: The frontend allows empty baseUrl for "custom-openai" (intended to mean "use official OpenAI endpoint"), but `resolveProviderConfig` treats `''` as an explicit override, so the "Current Configuration" summary shows an empty baseUrl instead of "official" or the actual resolved endpoint.

[Types]
No new types are required; existing types in `packages/shared/src/types.ts` are sufficient. We only need to ensure the frontend form state distinguishes between "unset" (`undefined`) and "explicitly empty" (`''`) for optional string fields.

- `ProviderConfig.apiKey?: string`
- `ProviderConfig.baseUrl: string` (already required in schema, but frontend sends `''`)
- `ImageProviderConfig.apiKey?: string`
- `ImageProviderConfig.baseUrl?: string`

The critical change is that the backend resolution functions must treat empty strings as "not overridden" so that environment defaults survive.

[Files]
Five files will be modified to fix the reported bugs and audit findings.

- **`apps/web/src/pages/Settings.tsx`** (modify)
  - Add `break-all` or masked display to both "Current Configuration" summary panels so long API keys wrap instead of overflowing.
  - Fix `applyImagePreset` so it does not explicitly set `apiKey: ''`; instead leave `apiKey` as `prev.apiKey` (or `undefined`) so env fallback can work.
  - Fix the image Save button disabled logic to properly guard against missing model when provider is truthy/non-disabled.
  - Ensure `handleImageTest` and `handleImageSave` send `undefined` for `apiKey` when the field is blank, rather than `''`.
  - Ensure `handleSave` and `handleTest` send `undefined` for `apiKey` and `baseUrl` when the fields are blank for custom-openai, rather than `''`.
  - Add consistent `truncate` or `break-all` styling to the Image Configuration summary.

- **`apps/api/src/services/imageProvider.ts`** (modify)
  - Change `resolveImageProviderConfig` to treat empty strings in `override` as "not overridden" for `apiKey`, `baseUrl`, `model`, `size`, `quality`, and `format`.
  - Introduce a small helper `pickNonEmpty(overrideValue, baseValue)` that returns `baseValue` when `overrideValue` is `undefined`, `null`, or `''`.

- **`apps/api/src/services/provider.ts`** (modify)
  - Apply the same `pickNonEmpty` logic to `resolveProviderConfig` for `apiKey`, `baseUrl`, `embeddingModel`, and `imageModel` so that empty strings from the frontend do not clobber environment defaults.

- **`.env`** (modify)
  - Add `IMAGE_PROVIDER=openai-image` to align with `IMAGE_GENERATION_ENABLED=true` and the existing `OPENAI_API_KEY`, removing the contradictory `disabled` provider / `enabled: true` state.
  - Ensure `IMAGE_MODEL` matches the example file default (`gpt-image-2`) or leave it as user prefers, but document the choice.

- **`.env.example`** (modify — optional, for documentation parity)
  - Ensure comments accurately describe fallback behavior now that empty-string handling is corrected.

[Functions]

- **New helper function: `pickNonEmpty<T>(override: T | null | undefined | '', base: T | undefined): T | undefined`**
  - File: `apps/api/src/services/imageProvider.ts` (or a shared util)
  - Purpose: Return `base` when `override` is empty string, `null`, or `undefined`; otherwise return `override`. This makes the resolution functions treat empty strings as "not overridden".

- **Modified function: `resolveImageProviderConfig`**
  - File: `apps/api/src/services/imageProvider.ts`
  - Changes: Replace `override.apiKey ?? base.apiKey` with `pickNonEmpty(override.apiKey, base.apiKey)` (and same for other optional string fields). This fixes the env fallback bug.

- **Modified function: `resolveProviderConfig`**
  - File: `apps/api/src/services/provider.ts`
  - Changes: Apply `pickNonEmpty` to `apiKey`, `baseUrl`, `embeddingModel`, and `imageModel`.

- **Modified function: `applyImagePreset`**
  - File: `apps/web/src/pages/Settings.tsx`
  - Changes: Remove `apiKey: ''` from the preset payload. Instead preserve the previous `apiKey` value or set it to `undefined` so the backend can fall back to `OPENAI_API_KEY`.

- **Modified function: `handleImageSave`** and **`handleImageTest`**
  - File: `apps/web/src/pages/Settings.tsx`
  - Changes: When constructing the payload, convert empty string `''` to `undefined` for `apiKey`, `baseUrl`, `model`, etc., before sending to the API.

- **Modified function: `handleSave`** and **`handleTest`**
  - File: `apps/web/src/pages/Settings.tsx`
  - Changes: Same empty-string-to-undefined conversion for `apiKey` and `baseUrl` (when provider is `custom-openai` and user left it blank).

- **Modified component markup: both "Current Configuration" summary blocks**
  - File: `apps/web/src/pages/Settings.tsx`
  - Changes: Add `break-all` or `truncate` Tailwind classes to the `<span>` elements that display `apiKey` values so they wrap within the card instead of overflowing.

[Classes]
No new classes are needed. We are only modifying functional resolution logic and UI markup within existing files.

[Dependencies]
No new dependencies.

[Testing]

- **Manual verification checklist:**
  1. Open Settings page with a long `OPENAI_API_KEY` in `.env`.
  2. Confirm the Text Provider "Current Configuration" panel does not overflow; the API key wraps within the card.
  3. Select "OpenAI Image" preset, leave Image API Key blank, click **Test Image Provider**.
  4. Confirm the test succeeds (or at least fails with an auth error, not a 404 / missing-key error) because the backend correctly falls back to `OPENAI_API_KEY`.
  5. Confirm the Image Configuration summary also does not overflow when the key is displayed.
  6. Verify that saving with a blank Image API Key does not store `apiKey: ''` in the database/runtime config.
  7. Verify that switching image presets no longer wipes a manually entered API key.

- **Unit test update (if time permits):**
  - Add a test in `apps/api/src/__tests__/` (or create a small inline test) asserting that `resolveImageProviderConfig({ apiKey: '' })` returns the env fallback rather than `''`.

[Implementation Order]

1. **Backend resolution fix** — Modify `apps/api/src/services/imageProvider.ts` and `apps/api/src/services/provider.ts` to treat empty strings as "not overridden". This is the root cause of the fallback bug.
2. **Environment alignment** — Update `.env` to include `IMAGE_PROVIDER=openai-image` so the backend default state is consistent.
3. **Frontend UI overflow fix** — Update `Settings.tsx` summary panels with `break-all` / masking and add password visibility toggles for API key inputs.
4. **Frontend form logic fix** — Update `applyImagePreset`, `handleImageSave`, `handleImageTest`, `handleSave`, and `handleTest` to send `undefined` instead of `''` for optional fields.
5. **Save button validation fix** — Correct the image Save button disabled expression.
6. **Manual verification** — Run the dev stack (`docker compose up -d` or `npm run dev`), open Settings, and step through the verification checklist.
