# TASK.md

# Current Objective

Execute a Provider Settings UI Fix and Full Runtime Verification Pass.

The app has provider configuration, image provider settings, and status indicators, but several UI/default-state issues remain.

This is a targeted bugfix + verification pass.

Do not add new features.
Do not redesign the app.
Do not rewrite provider architecture.

---

# Reported Issues

## 1. OpenAI Image Base URL Default Is Wrong

Current behavior:

- OpenAI image generation settings say:
  "leave empty to use official endpoint"
- but the Image Base URL field is prefilled with a localhost URL

This is confusing and incorrect.

Required behavior:

- For OpenAI Image provider, Image Base URL should default to empty.
- Empty value means use official OpenAI endpoint.
- Localhost/default custom endpoint values should only appear for Custom Image Endpoint mode.
- Switching provider presets should update defaults correctly.

Expected defaults:

```txt
OpenAI Image:
Image Base URL: empty
Image Model: gpt-image-2 or configured default
API Key: empty unless persisted/configured

Custom Image Endpoint:
Image Base URL: user-defined or sensible placeholder only
Image Model: user-defined

Disabled/Fallback:
Image Base URL: empty
Image Model: optional/disabled
```

Do not silently send localhost as the OpenAI image endpoint.

---

## 2. Side Navigation Provider Status Is Squished

Current behavior:

- side nav status section shows:
  - LIVE
  - database status
  - LLM provider
  - image provider
  - other provider status
- provider/status names are cut off or visually cramped

Required behavior:

- status section should be readable
- no text should overflow awkwardly
- provider/model labels should truncate gracefully
- full values should be available via title/tooltip
- layout should preserve visual polish

Acceptable fixes:

- widen sidebar slightly
- reduce provider/status font size
- split status into multiple rows
- use compact badges
- truncate with ellipsis
- add title attributes
- move detailed provider info into hover/title or settings page

Preferred:

```txt
LIVE / SIMULATED badge
DB status badge
Qdrant status badge
LLM: provider · model truncated
IMG: provider · model truncated
```

Do not cram long provider/model names into tiny cells.

---

# 3. Provider Settings Consistency Verification

Verify the previous provider/settings fixes remain correct.

Check:

- provider preset buttons match dropdown options
- Ollama Local appears consistently
- Ollama Cloud / Remote appears consistently
- Ollama Cloud / Remote defaults to:
  https://www.ollama.com/v1
- Custom OpenAI-Compatible allows custom base URL/model
- OpenRouter defaults to:
  https://openrouter.ai/api/v1
- provider settings save correctly
- provider settings persist correctly if DB-backed persistence has been implemented
- no `.env` rewriting occurs

---

# 4. Image Provider Test Verification

Verify Test Image Gen behavior.

Required behavior:

- Disabled/Fallback mode returns clear disabled/fallback status, not a scary failure
- OpenAI Image with missing API key returns clear actionable error
- OpenAI Image with empty base URL uses official endpoint behavior
- Custom Image Endpoint uses configured base URL
- Test button does not silently spend credits
- Test button does not silently fail

---

# 5. Full App Functionality Verification

After fixes, verify current app functionality still works.

Manual verification:

- app starts cleanly
- onboarding works
- world generation works
- provider settings page loads
- settings save/load correctly
- chat works
- streaming works
- chat history persists after navigation
- chat history persists after refresh
- chat scroll works with long responses
- cognition inspector works
- lore ingestion/search still works
- image fallback/generated status displays clearly
- dashboard/status indicators render cleanly

---

# Required Implementation Work

## Image Base URL Defaults

Fix image provider preset default behavior.

Rules:

- OpenAI Image official endpoint = empty base URL
- Custom image endpoint = user-entered base URL
- Disabled image mode = no base URL required

Ensure:
- UI placeholder may show official endpoint explanation
- actual value remains empty unless user enters one
- saved config does not store bogus localhost for OpenAI Image

---

## Sidebar Status Layout

Improve provider status display in Layout/sidebar.

Requirements:

- no clipping
- no overlapping
- no unreadable provider names
- responsive enough for long model names
- full provider/model info available via title

Avoid:
- increasing visual noise too much
- giant sidebar unless necessary
- raw debug-looking status blocks

---

## Verification Pass

Run and report:

```bash
npm run typecheck
npm run build
npm test --workspace=apps/api
docker compose up -d --build
```

If root scripts differ, use equivalent commands and document them.

Manual browser verification required for:

- Settings page defaults
- OpenAI Image empty base URL
- Ollama Cloud endpoint default
- sidebar provider display
- chat streaming
- chat persistence
- lore search
- world generation

---

# Constraints

Do not:

- add new providers
- redesign Settings from scratch
- redesign sidebar from scratch
- rewrite provider architecture
- add auth/accounts
- add billing
- rewrite image generation system
- break streaming chat
- break persistence
- silently modify `.env`

Preserve:

- custom OpenAI-compatible support
- Ollama local support
- Ollama cloud/remote support
- OpenRouter support
- image fallback mode
- Docker-first startup
- GUI-first provider setup
- current visual direction
- passing tests

---

# Success Criteria

- OpenAI Image base URL defaults to empty
- localhost is not shown/persisted for OpenAI Image official endpoint
- Custom Image Endpoint still supports custom base URL
- sidebar status area is readable
- long provider/model names truncate gracefully
- provider settings remain coherent
- image test behavior is predictable
- app functionality still works after fixes
- build/typecheck/tests pass
- Docker runtime starts successfully