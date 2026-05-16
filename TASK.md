# TASK.md

# Current Objective

Execute a Settings Architecture Rework and Provider Pipeline Coherence Pass.

The current settings page has accumulated conceptual inconsistencies and provider/UI leakage from rapid feature iteration.

The issue is no longer isolated bugs.

The issue is:
- unclear provider responsibility boundaries
- duplicated controls
- contradictory defaults
- irrelevant fields shown for providers that do not use them
- settings sections that do not reflect actual runtime architecture

This pass is focused on:
- conceptual coherence
- provider pipeline clarity
- removing misleading controls
- restructuring settings around real runtime responsibilities

This is a UX architecture and settings coherence pass.

Not a full application redesign.

---

# Core Architectural Principle

Loreweaver should have three explicit AI pipelines:

```txt
Text Generation Provider
Image Generation Provider
Embedding Provider
```

These are separate systems.

They should not be mixed together in confusing ways.

Each pipeline should:
- have its own provider preset buttons
- have its own relevant fields
- have its own defaults
- have its own validation/test logic
- expose only settings that actually matter

---

# Primary Goal

The settings page should feel:

```txt
intentional
coherent
understandable
trustworthy
```

NOT:

```txt
generic AI config soup
```

A user should immediately understand:
- what each provider section controls
- why a field exists
- which settings apply to which provider
- which fields are optional
- which defaults are actually meaningful

---

# Reported Issues

## 1. Provider Type Dropdowns Should Not Exist

Current behavior:

- provider preset buttons exist
- provider dropdown selectors ALSO exist
- these duplicate responsibility and create confusion

Required behavior:

- remove provider type dropdown selectors entirely
- provider preset buttons are the source of truth
- clicking a preset configures the section

Example:

```txt
[ OpenAI-Compatible ]
[ Ollama Local ]
[ Ollama Cloud ]
[ OpenRouter ]
```

No additional provider dropdown below.

---

# 2. Ollama Local API Key Field Is Wrong

Current behavior:

- Ollama Local says:
  "leave empty for local or unauthenticated endpoints"
- but a full API key is prefilled

This is conceptually incorrect.

Required behavior:

For Ollama Local:
- API key field should default empty
- API key field should likely be hidden entirely unless advanced mode is enabled
- no fake/default API key values
- local Ollama should visually feel local

---

# 3. Embedding Model Fields Are Conceptually Unclear

Current behavior:

- embedding model fields exist
- values do not change when providers change
- unclear where embeddings are coming from
- unclear which provider owns embeddings

Required behavior:

Embedding provider must become its own explicit section.

Example:

```txt
Embeddings Provider
```

Possible presets:

```txt
OpenAI-Compatible
Ollama
Disabled
```

Embedding settings should ONLY exist there.

Text provider settings should not contain embedding settings.

---

# 4. Image Model Field Duplication

Current behavior:

- Image Model exists in:
  - text provider section
  - image generation section

This is architecturally wrong.

Required behavior:

Image model fields belong ONLY in:

```txt
Image Generation Provider
```

Remove image-model-related fields from text provider settings.

---

# 5. OpenAI/OpenAI-Compatible Base URL Defaults Are Wrong

Current behavior:

- localhost defaults/placeholders appear for OpenAI/OpenAI-compatible fields
- this implies local inference defaults for providers that are cloud-first

Required behavior:

Defaults/placeholders must match provider intent.

Examples:

## OpenAI-Compatible

Placeholder:

```txt
https://api.openai.com/v1
```

or:
```txt
Enter custom OpenAI-compatible endpoint
```

NOT localhost by default.

## OpenRouter

```txt
https://openrouter.ai/api/v1
```

## Ollama Local

```txt
http://localhost:11434
```

## Ollama Cloud

```txt
https://www.ollama.com/v1
```

Provider defaults must reflect actual expected deployment patterns.

---

# 6. Provider Sections Need Strong Separation

Required structure:

# Text Generation Provider

Controls:
- chat/world generation
- text model
- temperature
- max tokens
- base URL
- API key

---

# Image Generation Provider

Controls:
- portrait/banner generation
- image model
- image quality
- image size
- image format
- image provider endpoint

---

# Embedding Provider

Controls:
- vector embedding generation
- embedding model
- embedding endpoint
- embedding enable/disable

---

# 7. Contextual Fields

Fields should appear only when relevant.

Examples:

## Ollama Local

Hide:
- API key field unless advanced mode enabled

## Disabled Provider

Hide:
- irrelevant endpoint/model fields

## OpenRouter

Show:
- API key
- model
- endpoint

The settings page should not look like:
```txt
every possible field for every provider at all times
```

---

# 8. Settings UX Philosophy

The settings page should prioritize:

```txt
clarity
mental model consistency
relevance
trustworthiness
```

NOT:
```txt
maximum configurability visible simultaneously
```

Advanced settings may be collapsible.

---

# 9. Verification Pass

After rework, verify:

- no duplicate provider selectors remain
- no duplicated model fields remain
- provider defaults make sense
- Ollama Local visually feels local
- OpenAI/OpenRouter visually feel remote/cloud
- embedding provider responsibilities are explicit
- image provider responsibilities are explicit
- text provider responsibilities are explicit
- settings persistence still works
- onboarding still works
- provider tests still work
- chat still works
- world generation still works
- image generation fallback still works
- embedding pipeline still works

---

# Required Runtime Verification

Run and report:

```bash
npm run typecheck
npm run build
npm test --workspace=apps/api
docker compose up -d --build
```

Manual verification required.

---

# Constraints

Do not:

- redesign the entire app
- rewrite provider adapters
- add new providers
- add auth/accounts
- add giant enterprise settings systems
- add plugin systems
- break streaming chat
- break persistence
- break onboarding

Preserve:

- GUI-first onboarding
- provider flexibility
- custom OpenAI-compatible support
- Ollama support
- OpenRouter support
- image provider support
- fallback/simulated mode
- current visual design direction

---

# Success Criteria

- settings page has a coherent mental model
- provider responsibilities are clearly separated
- irrelevant fields are hidden
- duplicate controls are removed
- defaults match provider intent
- localhost defaults only appear where appropriate
- no contradictory settings remain
- onboarding/settings feel trustworthy
- builds/tests/runtime verification pass