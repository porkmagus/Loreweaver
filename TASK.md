# TASK.md

# Current Objective

Implement dedicated Image Provider Settings and Image Generation Hardening for Loreweaver.

Loreweaver now supports flexible LLM providers for text generation, but image generation is still too tightly coupled to OpenAI assumptions and fallback placeholders.

This phase adds a pragmatic image provider layer.

Primary goals:

- make image generation configurable
- make image status transparent
- support official OpenAI image generation cleanly
- prepare for future image providers without overbuilding
- preserve deterministic fallback behavior

This is not a major architecture rewrite.

---

# Provider Targets

Support at minimum:

```txt
openai-image
custom-image-endpoint
disabled/fallback
```

Optional future-ready provider labels may be documented but not fully implemented:

```txt
codex-oauth-image
replicate
fal
stability
comfyui
automatic1111
```

Do not implement unsupported OAuth flows unless there is already a stable working credential path in the repo.

---

# OpenAI Image Provider

Use official OpenAI API image generation.

Default model:

```txt
gpt-image-2
```

Allow user override:

```txt
gpt-image-2
gpt-image-1.5
gpt-image-1
gpt-image-1-mini
```

Do not hardcode this as a closed list. Free-text model names should be allowed.

Required settings:

```txt
IMAGE_PROVIDER=openai-image
IMAGE_MODEL=gpt-image-2
IMAGE_API_KEY=
IMAGE_BASE_URL=
IMAGE_SIZE=
IMAGE_QUALITY=
IMAGE_FORMAT=
IMAGE_GENERATION_ENABLED=true
```

Use actual env naming consistent with the repo if different.

---

# Custom Image Endpoint

Add a custom image provider mode.

Required fields:

```txt
Image Provider
Image Base URL
Image API Key
Image Model
Image Size
Image Quality
Image Format
```

This should support future OpenAI-compatible or proxy image providers where practical.

If implementation cannot safely call arbitrary custom providers yet:

- expose settings
- persist settings
- clearly mark provider as configured but unsupported
- preserve fallback behavior

Do not fake success.

---

# Settings UI Requirements

Extend the Settings page with an Image Generation section.

Fields:

- Image Provider
- Image Base URL
- Image API Key
- Image Model
- Image Size
- Image Quality
- Image Format
- Enable/Disable Image Generation
- Test Image Provider button

Provider presets:

```txt
OpenAI Image
Custom Image Endpoint
Disabled / Fallback Only
```

The UI must clearly show:

- image generation enabled/disabled
- configured provider
- configured model
- whether generated assets are real or fallback

---

# Image Test Button

Add a Test Image Provider button.

Behavior:

- does not spend large amounts
- generates a tiny/simple test image if safe
- or performs a non-generating validation if provider supports it
- returns clear status

If live test would incur cost:

- warn clearly
- require explicit click
- keep prompt tiny

Do not silently generate paid images.

---

# Image Generation Pipeline

When world generation runs:

- generate world banner if image provider is enabled
- generate character portraits if image provider is enabled
- if image generation fails, use deterministic fallback
- preserve world/character creation even if image generation fails

All image generation must be best-effort.

Image failures must not break:

- onboarding
- world generation
- character creation
- chat

---

# Storage Strategy

Current data URI storage is acceptable for MVP but should be documented.

Review current image storage behavior.

If easy and safe, improve local storage:

- save generated images to a local mounted volume
- store file path/URL in metadata

If not easy:

- keep data URI strategy
- document limitation clearly

Do not introduce S3/CDN/object storage in this phase.

---

# Status Semantics

Every visual asset should have clear status:

```txt
generated
fallback
failed
disabled
generating
```

UI should not imply fallback art is real AI-generated output.

---

# Codex/OAuth Note

Document but do not implement unless already safely supported:

Some agent runtimes may support OpenAI/ChatGPT/Codex OAuth-backed image generation through their own credential systems.

Loreweaver should not depend on unofficial or runtime-specific OAuth flows by default.

Future provider possibility:

```txt
codex-oauth-image
```

Only implement later if:
- credential source is explicit
- auth flow is stable
- user consent is clear
- ToS/compliance risk is understood

---

# Documentation Requirements

Update:

- README.md
- MEMORY.md
- .env.example

Document:

- OpenAI image setup
- custom image provider settings
- fallback behavior
- image status meanings
- known limitations
- cost warning for live image generation

---

# Constraints

Do not:

- break existing text provider settings
- break streaming chat
- break onboarding
- add auth/accounts
- add billing
- add S3/CDN systems
- add giant image provider marketplace
- implement unsupported OAuth token scraping
- spend live image credits during tests without explicit setting

Preserve:

- Docker-first runtime
- fallback image behavior
- current visual design
- world generation flow
- character generation flow
- passing tests

---

# Verification Requirements

Run and report:

```bash
npm run typecheck
npm run build
npm test --workspace=apps/api
docker compose up -d --build
```

Manual verification:

- Settings page shows image provider section
- Disabled/fallback mode works
- OpenAI image provider can be configured
- Custom provider fields persist
- world generation does not break if images fail
- fallback assets still render
- status labels correctly distinguish generated/fallback/failed/disabled

Do not require paid live image generation for normal verification.

---

# Success Criteria

- image generation is configurable
- OpenAI image provider is cleanly supported
- custom image provider settings exist
- fallback behavior remains reliable
- image status is transparent
- docs explain setup and limitations
- no unsupported OAuth hack is introduced
- builds/tests remain green