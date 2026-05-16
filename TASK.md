# TASK.md

# Current Objective

Execute a Chat Session Persistence Forensics and Repair Pass.

Critical observed evidence:

- After chatting in a newly generated world, the world stats still show `0 chat sessions`.
- Chat appears during active streaming.
- After leaving and returning to the character, chat history is gone.

This strongly suggests the streaming chat path is not creating or linking canonical `chat_sessions`, or the stats/history queries are not reading the same session/message model.

Do not add features.
Do not do visual polish.
Do not work on image generation.
Do not start narrative drift.

Focus only on fixing canonical chat persistence.

---

# Primary Bug

Expected behavior:

1. User sends message to character.
2. A `chat_sessions` row exists for that character/world.
3. User message is persisted.
4. Assistant message is persisted.
5. World stats show chat session count > 0.
6. Leaving and returning loads the persisted conversation.
7. Browser refresh loads the persisted conversation.

Current behavior:

- Active streaming appears to work.
- World stats still show `0 chat sessions`.
- Returning to character shows no chat history.

---

# Investigation Requirements

Before fixing, inspect and document:

## Backend Persistence

- Does `POST /api/chat/character/:characterId/stream` create a `chat_sessions` row?
- Does the non-streaming chat route create a `chat_sessions` row?
- Are user and assistant messages linked to `chat_session_id`?
- Are sessions linked to `character_id`?
- Are sessions linked to `world_id` directly or indirectly?
- Does the world stats query count from `chat_sessions`?
- Does the history endpoint read from `chat_sessions` + `chat_messages`?
- Is the streaming route using a different persistence path than the sync route?

## Frontend Session Handling

- Does the stream `done` event include a valid persisted `sessionId`?
- Does Chat.tsx store/use that `sessionId`?
- On mount, does Chat.tsx request latest session/history for the character?
- Is the history route scoped by character or session?

---

# Required Persistence Model

Use one canonical model.

Preferred:

## Chat Sessions

A chat session must be created or reused whenever a user sends a message.

Session fields should include or be derivable from:

- id
- characterId
- worldId if schema supports it
- createdAt
- updatedAt

## Chat Messages

Every message must be linked to:

- chatSessionId
- role
- content
- createdAt

Roles:

- user
- assistant

---

# Required Backend Behavior

For both sync and streaming chat paths:

1. Resolve character.
2. Resolve world.
3. Create or reuse latest active chat session for character.
4. Persist user message.
5. Generate or stream assistant response.
6. Persist final assistant message.
7. Emit/return sessionId.
8. Ensure history endpoint can retrieve those messages.
9. Ensure world stats count the session.

The streaming route and sync route must not diverge in persistence behavior.

---

# Required Endpoints

Add or verify:

```txt
GET /api/chat/character/:characterId/history
GET /api/chat/character/:characterId/sessions
GET /api/chat/session/:sessionId/messages
POST /api/chat/character/:characterId
POST /api/chat/character/:characterId/stream

If current routes differ, document actual routes clearly.

Required Done Event

The SSE done event must include:

{
  "sessionId": 123,
  "userMessageId": 456,
  "assistantMessageId": 789,
  "messageCount": 2
}

Include relationship/memory/timeline effects if already available.

Frontend Requirements

On Chat page mount:

fetch latest persisted history for character
if history exists, render it
if no history exists, show empty state

During streaming:

optimistically render user message
stream assistant message
on done, store sessionId
safely merge persisted IDs
do not overwrite active state with stale history

After navigation/remount:

load persisted history from backend
do not depend on in-memory buffer
Stats Requirement

World stats must reflect chat session creation.

After one completed chat exchange:

chatSessions >= 1

If the stats query intentionally counts something else, fix or rename it.

Tests Required

Add/update backend tests proving:

streaming chat creates chat_session
streaming chat persists user message
streaming chat persists assistant message
history endpoint returns streamed messages
world stats session count increments after chat
sync and streaming routes use the same persistence behavior where practical

Frontend/E2E if practical:

send message
navigate away
return
history remains visible
Manual Verification Required

Perform and report:

Create or open newly generated world.
Confirm world stats show 0 chat sessions.
Open a character.
Send a chat message.
Wait for streamed assistant response to finish.
Confirm SSE done includes valid sessionId.
Confirm database/API reports at least one chat session.
Navigate away.
Return to same character.
Confirm messages remain visible.
Refresh browser.
Confirm messages remain visible.
Confirm world stats show chat session count > 0.
Constraints

Do not:

add new product features
redesign chat UI
add global state library
add auth
add background jobs
rewrite the whole app

Preserve:

SSE streaming
sync fallback
cognition inspector
compact cognition badges
visual design
Docker-first runtime
passing tests
Success Criteria
chat sessions are actually created
world stats reflect chat sessions
streamed user messages persist
streamed assistant messages persist
history survives navigation
history survives refresh
character histories remain scoped correctly
tests prove persistence behavior
build/typecheck/tests pass