# TASK.md

# Current Objective

Complete Phase 7: Polish + Deployment Preparation.

## Scope

Prepare the project for public GitHub presentation, local demo reliability, and simple VPS deployment.

This phase is about polish, documentation, demo readiness, and deployment preparation.

It is not a feature-expansion phase.

## Required Work

Complete:

- README polish
- deployment documentation
- demo script
- screenshot guide or screenshot placeholders
- production environment notes
- Docker Compose production readiness review
- Caddy/reverse proxy example
- UI polish pass
- empty/loading/error states
- final verification checklist
- MEMORY.md final phase update

## Documentation Requirements

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
- demo flow
- screenshots section
- deployment overview
- known limitations
- portfolio/resume bullet

## Deployment Requirements

Document simple deployment using:

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
- basic troubleshooting

Do not require Kubernetes.

## UI Polish Requirements

Review and improve:

- dashboard
- world view
- character profile
- chat page
- lore ingestion/search page
- timeline/memory display

Add or improve:

- loading states
- error states
- empty states
- status indicators
- visual consistency

Keep polish targeted.

Do not redesign the entire frontend.

## Screenshot/Demo Requirements

Create a documented screenshot checklist:

- dashboard/status screen
- world overview
- character profile
- lore upload/search
- chat with lore-grounded response
- relationship panel
- timeline panel
- memory panel

Create a demo script showing:

1. start app
2. open dashboard
3. open character
4. add lore
5. ingest lore
6. ask character about lore
7. show relationship update
8. show timeline event
9. show memory persistence
10. refresh and show persisted chat

## Constraints

Do not implement:

- new major features
- auth
- billing
- multiplayer
- voice
- autonomous agents
- background jobs
- Kubernetes
- major architecture rewrites
- advanced emotional simulation
- complex reranking

Preserve:

- existing Docker runtime
- existing API conventions
- existing database schema unless minor fixes are required
- existing retrieval pipeline
- existing chat flow
- working builds
- passing tests

## Known Limitation To Document

The frontend currently refetches relationship, timeline, and memory panels after chat with a short delay to allow backend writes to complete.

Document this as a known MVP limitation and future improvement:

- future improvement: return updated context panel payload directly from chat response.

## Success Criteria

- [x] README is portfolio-ready
- [x] deployment docs are usable
- [x] demo script is complete
- [x] screenshot checklist exists
- [x] .env.example is complete
- [x] MEMORY.md updated
- [x] UI has reasonable empty/loading/error states
- [x] docker compose up -d works
- [x] docker compose config validates
- [x] project is ready for GitHub presentation

### Verification

- `docker compose config` passes (no syntax errors)
- All docs cross-linked and consistent
- No application code builds broken (only UI polish edits: Chat.tsx, Spinner.tsx)
- Resource limits and log rotation added to docker-compose.yml
- Caddyfile ready for production reverse proxy
- Screenshot placeholders added to README
