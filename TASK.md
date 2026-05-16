# TASK.md

# Current Objective

Execute a Chat UX Emergency Stabilization Pass.

The app recently added:
- SSE streaming chat
- cognition inspector
- relationship/timeline/memory feedback
- visual asset fallbacks
- image generation plumbing

However, the chat experience is currently unstable and visually cramped.

This is a bugfix and UX stabilization task.

Do not add new product features.

Do not expand image generation systems.

Do not redesign the full app.

Focus on making chat reliable, usable, and visually sane.

---

# Critical Bugs To Fix

## 1. Streaming State Reversion

Current behavior:
- user sends message
- user message appears
- assistant response starts streaming
- when streaming finishes, chat reverts to stale history
- user message disappears

This must be fixed.

Likely issue:
- optimistic/streaming messages are being overwritten by stale refetch results
- done event/session refresh uses old state
- local message state and fetched history are competing

Required behavior:
- user message appears immediately
- assistant message streams in place
- final assistant message remains visible
- chat history does not revert
- refresh still loads persisted messages correctly

Solution guidance:
- establish a single authoritative message state for active chat
- merge fetched history carefully
- do not overwrite newer optimistic/streaming messages with older server history
- after stream done, either:
  - replace temporary message IDs with persisted IDs, or
  - refetch only after persistence is confirmed and merge deterministically

---

## 2. Chat Scroll Behavior

Current behavior:
- chat window has no useful scroll
- cognition blocks consume too much vertical space
- bottom metadata panels take over the chat area

Required behavior:
- message list has its own scroll region
- chat input remains reachable
- streaming response auto-scrolls only when user is near bottom
- user can scroll up without being yanked back down
- cognition/metadata panels do not consume half the conversation area

---

## 3. Cognition Blocks Must Move Out Of Main Chat Flow

Current issue:
These blocks appear inside or near the base of the chat window and consume too much space:

- Retrieved Lore
- Recalled Memory
- Relationship Drift
- Timeline

Required behavior:
- move these into the cognition inspector/sidebar
- or collapse them behind compact toggles
- do not render large metadata cards inside the primary message stream
- main chat should prioritize conversation readability

Preferred layout:
- main center column: messages only
- right side/collapsible panel: cognition context
- compact inline badges allowed, but not giant blocks

---

## 4. Image Generation Visibility Confusion

Current issue:
- user sees fancy placeholder messages
- no obvious proof of real image generation
- existing characters show fallback portraits
- unclear whether provider images work

Required behavior:
- clearly indicate image status:
  - fallback
  - generated
  - generating
  - failed
  - disabled
- add tooltip or subtle status label on portraits/banners
- if using fallback assets, do not imply live AI image generation happened
- README/MEMORY should clarify existing seeded data uses fallback unless regenerated/backfilled with provider enabled

Do not spend live provider credits unless explicitly configured.

---

# Required Fixes

## Chat State Fix

Implement deterministic streaming message handling.

Requirements:
- temporary user message should not disappear
- streaming assistant message should persist after completion
- persisted history should merge without wiping current state
- sessionId should remain stable
- done event should update local state safely

Add tests if practical for:
- stream event handling
- message merge behavior
- stale history protection

---

## Chat Layout Fix

Improve chat page layout:

- fixed/contained height for chat shell
- scrollable message area
- sticky or fixed input area
- inspector panel independently scrollable
- stable scrollbar gutters
- responsive behavior

Do not let inspector content overlap message content.

---

## Cognition Inspector Refactor

Move large cognition result blocks into:

- CognitionPanel
- collapsible inspector drawer
- compact side panel

Main chat may show compact indicators only:

Example:
```txt
3 lore chunks · 2 memories · Trust +1 · Timeline updated
```

Click/expand to inspect details.

---

## Visual Asset Status

For portraits/banners:

Show status subtly:

- Generated
- Fallback
- Disabled
- Failed

Do not make this ugly.

Keep visual direction intact.

---

# Constraints

Do not:
- add new major features
- redesign backend architecture
- add auth
- add billing
- add autonomous agents
- add background queues
- add giant frontend state libraries
- add new image providers
- rewrite the whole chat page from scratch unless unavoidable

Preserve:
- SSE route
- sync fallback route
- existing cognition inspector concept
- current visual design direction
- Docker-first runtime
- passing builds/tests

---

# Verification Requirements

Run and report:

```bash
npm run typecheck
npm run build
npm test --workspace=apps/api
docker compose up -d --build
```

Manual verification required:

1. Open character chat page.
2. Send first message.
3. Confirm user message remains visible.
4. Confirm assistant response streams.
5. Confirm final assistant response remains visible.
6. Send second message.
7. Confirm both exchanges remain visible.
8. Refresh page.
9. Confirm persisted chat history loads.
10. Confirm message list scrolls properly.
11. Confirm input remains usable.
12. Confirm cognition details are visible but not consuming main chat.
13. Confirm portrait/banner status clearly indicates fallback/generated state.

If Playwright host issues exist:
- use Dockerized Playwright path
- document result

---

# Success Criteria

- chat supports more than one message
- streamed messages do not disappear
- stale refetch does not overwrite active conversation
- chat scroll is usable
- input remains reachable
- cognition details no longer dominate main chat window
- inspector remains useful
- visual asset state is understandable
- builds/tests remain green
- app feels usable again

---

# Deliverables

Provide:

- root cause summary
- changed files
- streaming state fix summary
- chat layout fix summary
- cognition UI change summary
- image status clarification summary
- verification results
- remaining limitations