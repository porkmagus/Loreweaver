# TASK.md

# Current Objective

Execute a Chat Session Persistence Forensics and Repair Pass — COMPLETED.
Execute a Chat Scroll Containment and Long-Response Readability Pass — COMPLETED.

Next: None. Both critical chat passes are done.

---

# Phase A — Chat Persistence Forensics & Repair (Completed)

## Root Cause
- Streaming and sync chat routes WERE persisting to `chat_sessions` + `chat_messages` correctly.
- The frontend never stored `sessionId` in URL state, so on navigation/remount it lost the session context.
- The history endpoint required an explicit `sessionId` query parameter, which the frontend didn't have on remount.
- The Dashboard hardcoded `0` for chat sessions instead of querying real counts.

## Persistence Model After Fix
- `saveMessage` now bumps `chat_sessions.updated_at` so `getOrCreateSession` returns the most recently active session.
- `GET /chat/character/:id/history` auto-resolves the latest session when `sessionId` is omitted.
- `GET /chat/character/:id/sessions` returns all sessions for a character.
- `GET /worlds/:id/stats` returns real aggregated counts (characters, lore, timeline, chat sessions).
- Frontend stores `worldId`, `characterId`, and `sessionId` in URL query params via `useSearchParams`.

## Changed Files
- `apps/api/src/services/chatService.ts` — added `getLatestSessionForCharacter`, `listCharacterChatSessions`, `updated_at` bump in `saveMessage`
- `apps/api/src/routes/chat.ts` — added `/chat/character/:id/sessions`, made history endpoint auto-resolve latest session
- `apps/api/src/services/worldService.ts` — added `getWorldStats`
- `apps/api/src/routes/worlds.ts` — added `GET /worlds/:id/stats`
- `apps/web/src/pages/Dashboard.tsx` — fetches real stats, renders dynamic chat session count
- `apps/web/src/pages/Chat.tsx` — URL sync for session persistence, auto-restore on mount

## Tests
- `apps/api/src/__tests__/routes.test.ts` — added history + sessions endpoint tests
- `apps/api/src/__tests__/integration.test.ts` — added world stats integration test
- `apps/api/src/__tests__/chatService.test.ts` — new file covering session/message helpers
- `apps/api/src/__tests__/worldService.test.ts` — new file covering stats aggregation
- API tests: 60/60 passing

## Manual Verification
- Sent messages via streaming and sync endpoints → both persisted to Postgres
- `GET /worlds/2/stats` returned `chatSessions: 2` after chats
- History endpoint returned all messages without explicit `sessionId`
- Docker build and API tests pass

---

# Phase B — Chat Scroll Containment & Readability (Completed)

## Root Cause
- Broken height chain: `Layout` content wrapper (`max-w-5xl`) had no `h-full`, so `h-full` on `Chat` failed silently.
- `Chat` used `h-[calc(100vh-8rem)]`, a brittle viewport-unit guess that didn't account for nested padding.
- Competing scroll layers: `Layout` content div had `overflow-auto`, creating a second scrollable layer that stole scroll events from the message list.
- Missing `min-h-0`: Flex items default to `min-height: auto` and refused to shrink, causing the message list to expand outward instead of scrolling internally.
- `scrollIntoView` targeted the window/ancestor instead of the message list container, fighting the user.
- Inspector panel had `overflow-y-auto` but no `h-full`, so it couldn't scroll independently.

## Layout Fix Summary
Implemented the required robust chat shell:

```txt
Layout (h-screen flex)
└── main (flex-1 overflow-auto)
    └── content wrapper (h-full)
        └── Chat (h-full flex-col overflow-hidden)
            ├── header (natural height)
            └── main row (flex-1 gap-section overflow-hidden min-h-0)
                ├── Chat Card (flex-1 flex-col overflow-hidden min-h-0)
                │   ├── CardContent (flex-1 flex-col min-h-0)
                │   │   ├── Message List (flex-1 min-h-0 overflow-y-auto) ← sole scroll container
                │   │   └── Input (natural height, sticky at bottom)
                │   └── ...
                └── Inspector (h-full flex-col min-h-0 overflow-y-auto) ← independent scroll
```

Every flex junction now has `min-h-0`, ensuring flex children shrink and let the inner `overflow-y-auto` take over scrolling.

## Scroll Behavior Summary
- `useSmartScroll` tracks `isNearBottomRef` (80px threshold).
- When near bottom, new tokens/messages scroll the message list container directly via `el.scrollTo({ top: el.scrollHeight })`.
- When user scrolls up, auto-scroll pauses. When they return near bottom, it resumes.
- `scrollIntoView` was replaced with explicit container scrolling — no more fighting the window or ancestors.

## Long-Response Readability
- Added `break-words` to message text alongside `whitespace-pre-wrap` to prevent horizontal overflow from long unbroken strings.

## Changed Files
- `apps/web/src/components/Layout.tsx` — added `h-full` to content wrapper
- `apps/web/src/pages/Chat.tsx` — `h-[calc(100vh-8rem)]` → `h-full overflow-hidden`; added `min-h-0` at every flex boundary; added `h-full min-h-0` to inspector; added `break-words` to message text; replaced `scrollIntoView` with `el.scrollTo`
- `apps/web/e2e/smoke.spec.ts` — added `chat message list is independently scrollable` test; fixed seed data references (`Aethelgard` → `Wasteland Ruins`, id=1 → id=2)

## Test Results
- API tests: 60/60 passing
- E2E tests: 21/21 passing (chromium, firefox, webkit)
  - Includes the new scroll verification test that navigates to existing chat history and confirms `scrollHeight > clientHeight`, top/bottom scroll, and message visibility.

## Manual Verification
- Docker build: successful
- API health: 200 live mode
- Backend: sent message to character 3, received 3630-char assistant response
- History: 14 messages returned, all inside scrollable container
- E2E scroll test passes across all 3 browsers

## Remaining Limitations
- None for scroll/layout. Chat is now readable and demo-safe.
- Pre-existing frontend state-management nuance: optimistic messages + history refetch can briefly show duplicates until the `useMergeableHistory` hook reconciles. This was not introduced by the scroll fix and is out of scope for this pass.

---

# Deliverables Checklist

- [x] chat history is scrollable
- [x] long responses remain readable
- [x] input remains visible
- [x] inspector scrolls independently
- [x] smart auto-scroll works correctly
- [x] user can read old and new messages
- [x] no stale reversion returns
- [x] build/typecheck/tests pass
- [x] chat sessions are actually created
- [x] world stats reflect chat sessions
- [x] streamed user messages persist
- [x] streamed assistant messages persist
- [x] history survives navigation
- [x] history survives refresh
- [x] character histories remain scoped correctly
- [x] tests prove persistence behavior
- [x] API tests pass (60/60)
- [x] E2E tests pass (21/21)
- [x] Docker-first runtime verified
