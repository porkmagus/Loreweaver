# TASK.md

# Current Objective

Execute a Chat Session Persistence Forensics and Repair Pass — COMPLETED.
Execute a Chat Scroll Containment and Long-Response Readability Pass — COMPLETED.

Next: None. Both critical chat passes are done.

Chat persistence appears fixed, but the chat message history still cannot be reliably scrolled. Long responses may extend out of frame vertically, making previous content unreadable.

This is a critical chat usability bug.

Do not add new features.
Do not redesign the whole app.
Do not touch backend persistence unless absolutely necessary.

Focus only on making the chat layout scroll correctly and remain readable.

---

# Primary Bug

Current observed behavior:

- chat messages persist
- user can return to character and see history exists
- but the chat message area does not scroll correctly
- long assistant responses can overflow out of frame
- user cannot scroll up to read history

Expected behavior:

- chat page fits inside viewport
- message history has a dedicated scroll container
- long responses remain inside the scrollable area
- user can scroll up and down through full history
- input remains visible and usable
- cognition inspector scrolls independently
- page itself does not rely on whole-window scrolling for chat history

---

# Investigation Requirements

Inspect:

- Chat.tsx layout hierarchy
- parent container heights
- flex/min-height behavior
- overflow settings
- message list container
- chat card/container sizing
- inspector panel overflow
- app layout wrapper constraints

Common likely causes:

- parent flex container missing `min-h-0`
- message list missing `min-h-0`
- outer page using `overflow-hidden` incorrectly
- chat shell height not applied to correct parent
- sticky input consuming layout without shrinking message list
- child container using `h-full` without parent height
- scroll container nested inside non-constrained parent
- `scrollIntoView` still targeting wrong element

---

# Required Fix

Implement a robust chat shell layout.

Preferred structure:

```txt
ChatPage
└── viewport-height shell
    ├── chat column
    │   ├── chat header
    │   ├── scrollable message list
    │   └── sticky/fixed input area
    └── cognition inspector
        └── independent scroll region
```

Required CSS behavior:

- outer chat page: constrained to viewport height
- chat shell: `min-h-0`
- chat column: `min-h-0`
- message list: `flex-1 min-h-0 overflow-y-auto`
- inspector: `min-h-0 overflow-y-auto`
- input: does not shrink or disappear
- long messages wrap correctly
- long assistant responses do not escape container

---

# Auto-Scroll Requirements

Smart auto-scroll should work like this:

- if user is near bottom, new streaming tokens keep view pinned to bottom
- if user scrolls up, auto-scroll pauses
- when user manually returns near bottom, auto-scroll resumes
- no unconditional `scrollIntoView` on every render
- no fighting the user

---

# Long Response Requirements

Long assistant responses must:

- wrap normally
- remain readable
- not overflow horizontally
- not force page-level vertical overflow
- not cover input
- not hide prior messages

Add CSS if needed:

```txt
break-words
whitespace-pre-wrap
overflow-wrap:anywhere where appropriate
```

Use carefully so normal prose remains readable.

---

# Manual Verification Required

Perform and report:

1. Open a character chat page.
2. Send a short message.
3. Send or simulate a long assistant response.
4. Confirm response remains inside message scroll area.
5. Confirm user can scroll up to earlier messages.
6. Confirm user can scroll down to latest message.
7. Confirm input remains visible.
8. Confirm cognition inspector scrolls independently.
9. Confirm window/page does not need awkward full-page scroll to read chat.
10. Confirm smart auto-scroll does not fight manual scroll.

---

# Tests

Add or update Playwright/E2E smoke test if practical:

- load chat page
- create enough messages to overflow
- verify message list container scrollHeight > clientHeight
- set scrollTop to 0
- verify earlier message visible
- set scrollTop to bottom
- verify latest message visible

If Playwright host browsers are unavailable:
- use Dockerized Playwright path
- document limitation

---

# Constraints

Do not:

- add new product features
- redesign whole frontend
- change backend chat persistence
- remove cognition inspector
- introduce new UI libraries
- add global state libraries

Preserve:

- streaming behavior
- persisted history
- compact cognition badges
- right-side inspector
- visual design direction
- Docker-first runtime
- passing tests

---

# Success Criteria

- chat history is scrollable
- long responses remain readable
- input remains visible
- inspector scrolls independently
- smart auto-scroll works correctly
- user can read old and new messages
- no stale reversion returns
- build/typecheck/tests pass

---

# Deliverables

Provide:

- root cause summary
- changed files
- layout fix summary
- scroll behavior summary
- manual verification results
- any tests added/updated
- remaining limitations