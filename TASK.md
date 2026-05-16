---

# 6. Runtime Settings Persistence (Replace env-first behavior)

Current behavior:

- provider settings are primarily env-driven
- GUI settings may only exist in localStorage/runtime memory
- backend container restart may lose settings
- `.env` editing is still implied as part of setup

This should be improved.

---

# Required Architecture Change

Provider and image settings should persist in application storage/database.

Do NOT automatically rewrite `.env` from the GUI.

`.env` should remain:

```txt
deployment defaults
server bootstrap defaults
advanced configuration
fallback values
```

NOT:

```txt
primary runtime state
```

---

# Required Persistence Model

Preferred hierarchy:

```txt
database/app settings
↓
env defaults
↓
simulated fallback
```

Meaning:

1. If persisted app settings exist, use them.
2. Otherwise use env defaults.
3. Otherwise use simulated/fallback mode.

Frontend localStorage alone is insufficient.

---

# Required Backend Storage

Add a lightweight persistent settings model.

Preferred:

```txt
app_settings
```

Simple structure acceptable:

```txt
id
key
value
updatedAt
```

or equivalent JSON/settings structure.

Keep implementation minimal and pragmatic.

Do not build:
- user accounts
- RBAC
- enterprise secret vaults
- complex configuration systems

---

# Settings To Persist

Persist at minimum:

```txt
ai.provider
ai.baseUrl
ai.apiKey
ai.chatModel
ai.embeddingModel
ai.temperature
ai.maxTokens

image.provider
image.baseUrl
image.apiKey
image.model
image.size
image.quality
image.format
image.enabled
```

Actual schema can vary if simpler.

---

# Runtime Behavior

On backend startup:

1. Load persisted settings if present.
2. Fall back to env defaults if settings absent.
3. Fall back to simulated mode if neither configured.

On GUI save:

1. Persist settings to backend storage/database.
2. Update runtime provider state immediately.
3. Do NOT require container restart.
4. Do NOT rewrite `.env`.

---

# Frontend Behavior

Settings page and onboarding should:

- load persisted backend settings
- allow editing/saving
- survive page refresh
- survive container restart
- survive browser restart

localStorage may still cache draft UI state, but canonical runtime settings should come from backend persistence.

---

# Important Constraint

Avoid introducing:
- multiple conflicting sources of truth
- env rewrite logic
- runtime/env synchronization hacks
- restart-required configuration flows

The backend runtime config should derive from:
```txt
persisted settings first
env defaults second
```

---

# Documentation Requirements

Update README.md and MEMORY.md:

- `.env` values are optional defaults
- provider setup can happen fully through GUI
- GUI settings persist in app storage/database
- container restart should preserve GUI settings
- `.env` rewriting is intentionally not used

---

# Verification Requirements

Manual verification:

1. Start app with empty AI-related `.env`.
2. Configure provider through onboarding/settings GUI.
3. Save settings.
4. Generate/chat successfully.
5. Restart backend container.
6. Reload app.
7. Confirm provider settings persist.
8. Confirm `.env` file was NOT modified.
9. Confirm runtime still uses persisted settings.

---

# Success Criteria

- GUI provider settings persist across container restarts
- `.env` editing is optional
- `.env` is not rewritten by the app
- backend runtime uses persisted settings
- onboarding works without manual env editing
- no conflicting runtime/env behavior appears