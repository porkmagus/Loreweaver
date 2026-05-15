# TASK.md

# Current Objective

Complete the Final Release Pass for Loreweaver v0.1.0 Portfolio MVP.

This is a stabilization, polish, deployment-readiness, and testing phase.

It is NOT a feature expansion phase.

---

# Scope

Complete:

- README polish
- deployment documentation
- demo script
- screenshot checklist/placeholders
- production environment notes
- Docker Compose production readiness review
- Caddy/reverse proxy example
- UI polish pass
- empty/loading/error states
- final verification checklist
- release-quality test pyramid
- MEMORY.md final release update

---

# Documentation Requirements

Update or create:

- README.md
- docs/deployment.md
- docs/demo-script.md
- docs/roadmap.md
- MEMORY.md
- .env.example

README must include:

- project summary
- feature list
- architecture overview
- tech stack
- quickstart
- environment variables
- development commands
- test commands
- demo flow
- screenshots section
- deployment overview
- known limitations
- portfolio/resume bullet

---

# Deployment Requirements

Document deployment using:

- VPS
- Docker Compose
- Caddy or equivalent reverse proxy

Include:

- production env variables
- service ports
- persistent volumes
- Postgres persistence notes
- Qdrant persistence notes
- backup notes
- troubleshooting notes

Do not require Kubernetes.

---

# UI Polish Requirements

Review and improve:

- dashboard
- world view
- character profile
- chat page
- lore ingestion/search page
- timeline display
- memory display

Add or improve:

- loading states
- error states
- empty states
- status indicators
- visual consistency

Keep polish targeted.

Do not redesign the frontend.

---

# Testing Requirements

Implement a minimal release-quality test pyramid.

## Unit Tests

Add only for critical pure logic not already covered:

- chunking
- relationship scoring
- memory dedup
- timeline dedup
- prompt assembly helpers

---

## Integration Tests

Implement backend integration tests for:

- lore creation → ingestion → semantic retrieval
- chat → persistence → memory creation
- chat → relationship update
- chat → timeline event creation

---

## E2E Smoke Tests

Implement minimal Playwright smoke tests covering:

### Main Flow

- app loads
- dashboard/status visible
- open character chat
- send message
- message appears
- relationship/timeline/memory sidebar updates

### Optional Lore Flow

- add lore
- ingest lore
- search lore
- search result appears

---

# Testing Constraints

Do not:

- introduce large testing architecture
- add visual regression testing
- add broad coverage thresholds
- add Cypress if Playwright is used
- rewrite existing tests unnecessarily

Prefer:
- deterministic tests
- stable tests
- low runtime overhead

Simulated mode is acceptable for LLM behavior.

---

# Known MVP Limitation To Document

The frontend currently refetches relationship, timeline, and memory panels after chat with a short delay to allow backend writes to complete.

Document future improvement:

Return updated sidebar context payload directly from the chat response instead of delayed frontend refetch.

---

# Package Script Goals

Add or verify scripts for:

- build
- lint
- typecheck
- test
- test:unit
- test:integration
- test:e2e
- verify

Adjust scripts to current workspace/package manager setup.

---

# Constraints

Do not implement:

- auth
- billing
- multiplayer
- voice
- autonomous agents
- background jobs
- Kubernetes
- major architecture rewrites
- advanced provider abstraction
- advanced emotional simulation
- complex reranking

Preserve:

- existing Docker runtime
- existing API conventions
- existing database schema unless minor fixes required
- existing retrieval pipeline
- existing chat flow
- passing tests
- type safety

---

# Verification Requirements

Run and report:

- docker compose up -d
- npm run build
- npm run lint if configured
- npm run typecheck if configured
- npm test
- npm run test:e2e if added
- manual demo flow verification

---

# Success Criteria

- README is portfolio-ready
- deployment docs are usable
- demo script is complete
- screenshot checklist exists
- .env.example is complete
- MEMORY.md updated
- UI has loading/error/empty states
- integration tests cover core backend flows
- E2E smoke tests cover demo path
- docker compose runtime healthy
- all builds pass
- all tests pass
- repository ready for GitHub presentation
- repository ready for portfolio/demo usage

---

# Final Deliverables

Provide:

- release summary
- changed files
- deployment readiness notes
- known limitations
- verification command results
- recommended git tag command

Recommended tag target:

```bash
git tag v0.1.0-portfolio-mvp
```
