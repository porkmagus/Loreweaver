# TASK.md

# Current Objective

Implement a Transparent Cognition & Streaming UX pass for Loreweaver.

The application now has:
- world generation
- retrieval
- persistent memory
- relationships
- timelines
- onboarding
- polished UI
- Docker-first runtime
- testing infrastructure

The next priority is:

```txt
make the AI cognition pipeline visible and emotionally understandable
```

This phase focuses on:
- streaming responses
- transparent retrieval visibility
- visible memory recall
- visible relationship changes
- observable AI context assembly

The goal is to transform Loreweaver from:
```txt
AI black box
```

into:
```txt
observable narrative cognition system
```

This is a portfolio-impact phase.

Not a major architecture rewrite.

---

# Primary Goals

Users should be able to:
- see responses stream in real-time
- understand WHY the AI responded a certain way
- see retrieved memories/lore
- observe relationship changes
- observe timeline creation
- understand the system is persistent and retrieval-aware

The system should feel:
- alive
- intelligent
- inspectable
- grounded
- technically sophisticated

---

# Scope

Implement:

- streaming chat responses
- prompt context inspector
- retrieval visibility
- memory recall visibility
- relationship delta visibility
- timeline creation visibility
- lightweight cognition transparency UI

Do not redesign the backend architecture.

Do not introduce autonomous agents.

---

# 1. Streaming Chat Responses

Implement real-time streaming responses.

Preferred:
- Server-Sent Events (SSE)
- fetch streaming

Avoid:
- websocket overengineering unless already trivial

Requirements:
- assistant responses stream token-by-token or chunk-by-chunk
- loading states remain smooth
- scrolling remains stable
- partial responses render cleanly
- streaming failure gracefully falls back to standard response behavior

---

# 2. Prompt Context Inspector

Create a developer/advanced-user cognition panel.

This is one of the highest-value portfolio features.

The panel should expose:

- retrieved lore chunks
- retrieved memories
- relationship state
- recent timeline events
- prompt sections
- token/context estimates if easy
- AI mode (live/simulated)

The inspector should feel:
- elegant
- inspectable
- archival
- readable

Not:
```txt
raw debug log spam
```

Preferred placement:
- collapsible sidebar
- expandable panel
- developer toggle

---

# 3. Retrieved Lore Visibility

During chat:
- visibly show which lore entries influenced the response
- optionally highlight:
  - title
  - snippet
  - similarity score if available

Suggested label:
```txt
Retrieved Lore
```

Users should understand:
```txt
the AI searched the world archive
```

---

# 4. Memory Recall Visibility

When memories are injected or referenced:
- show memory recall cards/snippets
- optionally animate subtly

Suggested label:
```txt
Recalled Memory
```

Goal:
Users should emotionally understand:
```txt
the system remembers prior interactions
```

---

# 5. Relationship Delta Visibility

After meaningful interactions:
- visibly show relationship changes

Examples:
```txt
Trust +2
Respect -1
Affection +3
```

Keep visual treatment:
- subtle
- elegant
- non-gamified

Avoid:
- giant RPG stat explosions
- MMO UI styling

---

# 6. Timeline Event Visibility

When a timeline event is created:
- show subtle timeline creation feedback

Example:
```txt
Timeline Updated
"The Blackwood Pact was discussed."
```

Should feel:
- archival
- narrative
- persistent

---

# 7. Cognition Pipeline UX

The app should now communicate:

```txt
retrieve
↓
assemble context
↓
generate
↓
persist memory
↓
update relationships
↓
update timeline
```

Without overwhelming the user.

The system should feel:
- understandable
- layered
- intelligent

---

# 8. Visual Consistency

All new UI must follow:
- VISUAL_DIRECTION.md
- existing visual overhaul direction

Preserve:
- atmospheric design
- typography hierarchy
- restrained motion
- dark codex/archive aesthetic

Avoid:
- generic debug panels
- bright developer dashboards
- ugly JSON walls
- noisy telemetry aesthetics

---

# 9. Streaming State Polish

Improve:
- typing indicators
- partial message rendering
- loading transitions
- interruption handling if practical

Streaming should feel:
- smooth
- premium
- intentional

---

# 10. Documentation

Update:
- README.md
- MEMORY.md

Document:
- streaming architecture
- cognition inspector
- transparent retrieval features
- known limitations

---

# Constraints

Do not:
- redesign core backend architecture
- add autonomous agents
- add multi-agent orchestration
- add voice
- add multiplayer
- add Kubernetes
- add background job systems
- massively refactor persistence
- introduce massive frontend state complexity

Preserve:
- Docker-first runtime
- current onboarding
- current retrieval pipeline
- current persistence systems
- current visual direction
- passing tests
- type safety

---

# Verification Requirements

Run and report:

```bash
docker compose up -d --build
npm run build
npm run typecheck
npm test
```

Manual verification:
- onboarding still works
- world generation still works
- streaming responses work
- lore retrieval visibly appears
- memory recall visibly appears
- relationship changes visibly appear
- timeline creation visibly appears
- inspector panel works
- UI remains visually cohesive

---

# Success Criteria

- responses stream in real time
- cognition pipeline feels observable
- lore retrieval is visible
- memory recall is visible
- relationship changes are visible
- timeline creation is visible
- inspector panel feels polished
- app feels technically sophisticated
- app feels emotionally alive
- visual consistency preserved
- tests/builds remain green

---

# Final Deliverables

Provide:
- changed files
- streaming implementation summary
- cognition inspector summary
- retrieval/memory visibility summary
- verification results
- remaining UX limitations
- recommendations for future premium polish