# Loreweaver

AI-native persistent storytelling and memory platform.

Built as an experimental long-memory narrative system combining:
- semantic retrieval
- persistent memory
- relationship state
- lore ingestion
- timeline continuity
- retrieval-augmented generation (RAG)

---

# Goals

Loreweaver is designed to explore:
- AI-native application architecture
- persistent contextual memory
- semantic retrieval systems
- long-horizon conversational continuity
- structured prompt engineering
- agent-oriented repository design

The project prioritizes:
- maintainability
- operational clarity
- deterministic workflows
- Docker-first deployment
- stable iteration speed

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind
- shadcn/ui
- React Router

---

## Backend

- Fastify
- TypeScript
- Zod

---

## Persistence

- PostgreSQL
- Qdrant

---

## AI Systems

- Retrieval-Augmented Generation (RAG)
- Structured prompting
- Semantic memory retrieval
- Relationship state tracking
- Timeline persistence

---

# Repository Structure

```txt
loreweaver/
├── AGENTS.md
├── soul.md
├── MEMORY.md
├── prompting.md
├── ARCHITECTURE.md
├── BOOTSTRAP.md
├── README.md
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   └── shared/
├── infra/
│   ├── docker/
│   ├── caddy/
│   └── scripts/
└── docs/
```

---

# Runtime Docs

This repository uses runtime markdown architecture.

Key runtime files:

| File | Purpose |
|---|---|
| AGENTS.md | Operational engineering doctrine |
| soul.md | Cognitive/behavioral steering |
| MEMORY.md | Persistent operational state |
| prompting.md | Prompt engineering infrastructure |
| ARCHITECTURE.md | System topology |
| TASK.md | Current execution objective |

---

# Development Philosophy

Loreweaver follows several core principles:

```txt
Simple > clever
Working > idealized
Readable > impressive
Stable velocity > sporadic brilliance
```

The system is intentionally designed as:
- modular monolith
- Docker-first runtime
- retrieval-oriented architecture
- agent-assisted development environment

---

# Planned Features

## Core Systems

- persistent character memory
- semantic lore retrieval
- timeline continuity
- relationship tracking
- world state persistence
- AI-assisted storytelling

---

## AI Systems

- retrieval pipelines
- memory compression
- semantic summarization
- structured generation
- constrained outputs

---

## Infrastructure

- Docker Compose runtime
- VPS deployment
- reverse proxy support
- reproducible development environments

---

# Development Workflow

The repository is optimized for agent-assisted development.

Typical workflow:

```txt
1. Update TASK.md
2. Prompt agent:
   "Read runtime docs and execute TASK.md."
3. Validate output
4. Update MEMORY.md
5. Commit stable checkpoint
```

---

# Runtime Philosophy

This repository treats:
- prompting
- retrieval
- memory
- execution doctrine
- architecture

as separate cognitive layers.

The repo itself acts as:
> a structured synthetic cognition environment.

Which is a deeply strange sentence to write in a software project README, yet increasingly accurate.

---

# Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# 2. Start the stack
docker compose up -d

# 3. Seed data (optional)
cd apps/api && npx tsx src/seed/index.ts

# 4. Open the app
open http://localhost:5173
```

---

# Status

Completed:
- Phase 1: Bootstrap + runtime architecture
- Phase 2: Docker + monorepo scaffolding
- Phase 3: Database schema + base API routes
- Phase 4: Lore ingestion + semantic retrieval pipeline
- Phase 5: Character chat + persistent memory
- Phase 6: Memory + Timeline + Relationship integration (stabilized and verified)

Current phase:
- Phase 7: UI polish, deployment preparation, documentation enrichment

Planned next steps:
- PDF ingestion
- Streaming chat responses
- Memory compression and summarization
- Character-to-character relationship visualization

---

# Screenshots

> Screenshots are captured at 1440x900. See `docs/screenshots.md` for the full capture guide.

![Dashboard](docs/screenshots/01-dashboard.png)
*Dashboard showing active worlds and character counts.*

![Chat with Lore](docs/screenshots/07-chat-lore-response.png)
*Character responding with lore-grounded context and contextual sidebar.*

---

# Architecture Decisions

- **Modular monolith** -- single deployable unit, no microservices overhead
- **Serial integer PKs** -- simplicity and join performance over UUIDs
- **Docker-first runtime** -- `docker compose up -d` is the primary deployment path
- **Postgres canonical source, Qdrant retrieval only** -- never store application state in vector systems
- **Deterministic chunking** -- paragraph-aware split with soft max and overlap; no heavy NLP dependency
- **Keyword-based relationship scoring** -- fast, observable, no extra LLM call per message
- **No streaming (yet)** -- synchronous responses keep the chat endpoint simple and state predictable

---

# Environment Variables

Required for local development and Docker runtime:

```bash
DATABASE_URL=postgresql://loreweaver:loreweaver@localhost:5432/loreweaver
QDRANT_URL=http://localhost:6333
OPENAI_API_KEY=<your-key>
EMBEDDING_DIMENSION=1536      # optional; defaults to 1536
EMBEDDING_MODEL=text-embedding-3-small  # optional
CHAT_MODEL=gpt-4o-mini        # optional; defaults to gpt-4o-mini
```

Place variables in a `.env` file at the repository root. The API container reads the same file at runtime.

For production, see `.env.production.example` and `docs/deployment.md`.

---

# License

MIT
