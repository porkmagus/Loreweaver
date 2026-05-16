# TASK.md

# Current Objective

Implement flexible LLM provider configuration for Loreweaver.

The app must support practical low-cost, local, and custom inference setups.

Primary provider targets:

- Custom OpenAI-compatible endpoint
- Ollama local
- Ollama remote/cloud
- OpenRouter

The user must be able to type:
- custom base URL
- custom model name
- optional API key
- optional embedding model

This is a high-priority usability phase.

---

# Primary Goal

Loreweaver should no longer feel locked to OpenAI.

Users should be able to use:
- local Ollama
- remote Ollama servers
- OpenRouter
- LM Studio
- LiteLLM
- vLLM OpenAI-compatible servers
- llama.cpp OpenAI-compatible servers
- any OpenAI-compatible gateway

---

# Required Settings UI

Create or improve a Settings page with:

## Provider Preset

Options:

```txt
Custom OpenAI-Compatible
Ollama Local
Ollama Remote / Cloud
OpenRouter
```

Optional existing providers may remain, but do not prioritize them.

---

## Required Fields

Allow editing:

```txt
Provider
Base URL
API Key
Chat Model
Embedding Model
Image Model
Temperature
Max Tokens
```

Embedding/Image fields may be optional if unsupported.

---

# Provider Defaults

## Custom OpenAI-Compatible

Default:

```txt
Base URL: http://localhost:1234/v1
Chat Model: user-defined
Embedding Model: user-defined
API Key: optional
```

Designed for:
- LM Studio
- LiteLLM
- vLLM
- llama.cpp server
- local gateways

---

## Ollama Local

Default:

```txt
Base URL: http://localhost:11434
Chat Model: user-defined
API Key: none
```

Should support:
- local Ollama chat
- custom model names

Embedding support optional if clean.

---

## Ollama Remote / Cloud

Allow:

```txt
Base URL: user-defined
API Key: optional
Chat Model: user-defined
```

This should work for:
- remote Ollama servers
- tunneled Ollama
- hosted Ollama-compatible endpoints

---

## OpenRouter

Default:

```txt
Base URL: https://openrouter.ai/api/v1
Chat Model: user-defined
API Key: required
```

Support custom OpenRouter model names such as:

```txt
qwen/qwen3-coder
deepseek/deepseek-chat
meta-llama/llama-3.1-70b-instruct
mistralai/mistral-large
```

Do not hardcode model list as authoritative.

Allow free text model names.

---

# Backend Provider Behavior

Implement a pragmatic provider adapter.

Do not build a giant provider framework.

Minimum required behavior:

- chat completion supports selected provider
- streaming chat supports selected provider where possible
- world generation uses selected provider
- fallback simulated mode still works if provider unavailable
- provider status endpoint reports current config/mode

---

# OpenAI-Compatible Behavior

For Custom OpenAI-Compatible and OpenRouter:

Use OpenAI-compatible chat completion format:

```txt
POST {baseUrl}/chat/completions
```

Streaming:

```txt
stream: true
```

Use:
- Authorization Bearer API key if provided
- no auth if API key empty and provider allows it

---

# Ollama Behavior

Support Ollama native API if easiest:

```txt
POST /api/chat
```

or OpenAI-compatible Ollama endpoint if configured:

```txt
/v1/chat/completions
```

Prefer the simplest reliable approach.

Must support:
- local base URL
- remote base URL
- custom model name
- streaming if practical

If Ollama streaming differs from OpenAI-compatible streaming, normalize events internally.

---

# Settings Persistence

MVP acceptable:

- store provider settings in localStorage
- send selected config with chat/world-generation requests

Better if simple:

- backend can also read env defaults

Do not add auth or user accounts.

---

# Environment Defaults

Update `.env.example`:

```env
AI_PROVIDER=custom-openai

AI_BASE_URL=http://localhost:1234/v1
AI_API_KEY=
AI_CHAT_MODEL=
AI_EMBEDDING_MODEL=
AI_IMAGE_MODEL=

OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=
```

Use actual naming consistent with the existing app.

---

# Test Connection

Add a Test Connection button.

Behavior:

- verifies base URL reachable
- verifies model works if practical
- reports provider mode
- reports streaming support if practical

For OpenAI-compatible providers:

- perform small chat completion request

For Ollama:

- call tags/list models endpoint if practical
- or perform small chat request

Do not make this fragile.

---

# UI Requirements

Settings page should clearly show:

- current provider
- current chat model
- current base URL
- whether API key is configured
- whether embeddings are available
- whether image generation is available
- live/simulated/fallback status

Use existing visual direction.

Do not make it look like a raw config file.

---

# Documentation Requirements

Update:

- README.md
- MEMORY.md
- .env.example

Document provider examples:

## LM Studio

```txt
Provider: Custom OpenAI-Compatible
Base URL: http://localhost:1234/v1
Model: your-loaded-model-name
API Key: empty
```

## Ollama Local

```txt
Provider: Ollama Local
Base URL: http://localhost:11434
Model: llama3.1
API Key: empty
```

## Ollama Remote

```txt
Provider: Ollama Remote / Cloud
Base URL: https://your-ollama-host.example.com
Model: qwen2.5
API Key: optional
```

## OpenRouter

```txt
Provider: OpenRouter
Base URL: https://openrouter.ai/api/v1
Model: openrouter-model-id
API Key: required
```

---

# Constraints

Do not:

- add auth
- add accounts
- add billing
- add a huge provider marketplace
- hardcode a giant model registry
- break OpenAI-compatible support
- break streaming chat
- break simulated fallback
- rewrite the whole AI layer

Preserve:

- Docker-first runtime
- existing chat persistence
- streaming UX
- cognition inspector
- world generation
- retrieval pipeline
- tests/builds

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

- select Custom OpenAI-Compatible provider
- enter custom base URL/model
- save settings
- verify selected model appears in status
- chat request uses selected provider config
- select Ollama Local
- verify model/base URL are accepted
- select OpenRouter
- verify API key/model fields work
- simulated fallback still works when provider unavailable
- streaming chat still works with default provider

---

# Success Criteria

- user can configure custom base URL
- user can type custom model name
- user can use custom OpenAI-compatible endpoints
- user can configure Ollama local
- user can configure Ollama remote/cloud
- user can configure OpenRouter
- provider status is visible
- settings persist locally
- streaming chat remains functional
- world generation remains functional
- fallback mode remains functional
- README documents provider setup
- builds/tests remain green