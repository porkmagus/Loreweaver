<div align="center">

<img src="https://raw.githubusercontent.com/porkmagus/loreweaver/main/docs/screenshots/01-dashboard.png" width="100%" alt="Loreweaver Dashboard" style="border-radius: 12px; max-width: 900px;">

<h1>Loreweaver</h1>

<p><em>AI-Native Persistent Storytelling & Memory Platform</em></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Fastify-5.8-000000?logo=fastify&logoColor=white&style=flat-square" alt="Fastify">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Qdrant-Vector-FF0000?style=flat-square" alt="Qdrant">
  <img src="https://img.shields.io/badge/Docker-First-2496ED?logo=docker&logoColor=white&style=flat-square" alt="Docker">
  <img src="https://img.shields.io/badge/tests-44%20passing-22c55e?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/license-MIT-4d7c0f?style=flat-square" alt="License">
</p>

</div>

---

## What It Does

Loreweaver turns raw worldbuilding documents into **living, conversational memories**.

Drop lore into the system. Characters will reference it naturally in conversation — with persistent memory, relationship tracking, and timeline continuity that survives across sessions.

**Built for:** worldbuilders, game masters, narrative designers, and anyone who wants characters that *remember*.

---

## Features

| Feature | Description |
|---------|-------------|
| **RAG-Powered Chat** | Characters answer questions grounded in your lore via semantic retrieval |
| **Persistent Memory** | Every conversation stored and recalled across sessions |
| **Relationship Tracking** | Characters remember how they feel about each other (trust, respect, affection, rivalry, fear) |
| **Timeline Continuity** | Events logged and retrievable as a narrative timeline |
| **Lore Ingestion** | Paragraph-aware chunking with overlap — no heavy NLP dependencies |
| **Semantic Search** | Find relevant lore by meaning, not just keywords |
| **World Generation** | Describe a concept — the system builds a complete starter world |
| **Docker-First** | One command: `docker compose up -d` — entire stack online |

---

## Quick Start

```bash
git clone https://github.com/porkmagus/loreweaver.git
cd loreweaver
cp .env.example .env
# Optional: add OPENAI_API_KEY to .env for live AI generation
docker compose up -d --build
```

Open **[http://localhost:5173](http://localhost:5173)**

The first boot automatically seeds demo data (the **Aethelgard** medieval fantasy world) so you can explore immediately.

---

## Screenshots

<div align="center">

| Dashboard | Onboarding | Worlds |
|:---:|:---:|:---:|
| <img src="docs/screenshots/01-dashboard.png" width="260"> | <img src="docs/screenshots/02-onboarding.png" width="260"> | <img src="docs/screenshots/03-worlds.png" width="260"> |

| Characters | Lore | Chat |
|:---:|:---:|:---:|
| <img src="docs/screenshots/04-characters.png" width="260"> | <img src="docs/screenshots/05-lore.png" width="260"> | <img src="docs/screenshots/07-chat-response.png" width="260"> |

</div>

---

## Architecture

```
React + Vite + Tailwind          Fastify API
      ↓                              ↓
  localhost:5173               localhost:3001
                                    ↓
                          ┌─────────┴─────────┐
                          ↓                   ↓
                     PostgreSQL 16          Qdrant
                     (canonical)         (retrieval)
                     port 5432            port 6333
```

**Design principle:** Postgres is the source of truth. Qdrant is retrieval-only. Never store canonical state in vector systems.

---

## Tech Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui | Fast, responsive UI |
| **Routing** | React Router | SPA navigation |
| **API** | Fastify 5 + TypeScript | High-performance REST |
| **Validation** | Zod | Runtime schema validation |
| **ORM** | Drizzle ORM | Type-safe SQL with migrations |
| **Database** | PostgreSQL 16 | Relational source of truth |
| **Vector DB** | Qdrant | Semantic search & embeddings |
| **AI** | OpenAI API (gpt-4o-mini, text-embedding-3-small) | LLM + embeddings |
| **Testing** | Vitest + Playwright | Unit, integration, E2E |
| **Runtime** | Docker Compose | Single-command deployment |
| **Deployment** | Caddy + VPS | Production reverse proxy |

---

## Project Structure

```
loreweaver/
├── apps/
│   ├── api/              # Fastify backend (port 3001)
│   │   ├── src/
│   │   │   ├── routes/   # REST endpoints
│   │   │   ├── services/ # Chat, Qdrant, chunking, scoring
│   │   │   └── __tests__/ # 44 passing tests
│   │   └── Dockerfile
│   └── web/              # React frontend (port 5173)
│       ├── src/
│       │   ├── pages/    # Dashboard, Worlds, Chat, Lore, Timeline
│       │   └── components/
│       ├── e2e/          # Playwright smoke tests
│       └── Dockerfile
├── packages/
│   └── shared/            # Shared types and schemas
├── docker-compose.yml
├── .env.example
└── docs/
    ├── deployment.md
    ├── demo-script.md
    ├── screenshots.md
    └── roadmap.md
```

---

## Environment Variables

Create a `.env` file at the repository root:

```bash
# Required for live AI generation
OPENAI_API_KEY=sk-...

# Optional — defaults shown
DATABASE_URL=postgresql://loreweaver:loreweaver@postgres:5432/loreweaver
QDRANT_URL=http://qdrant:6333
EMBEDDING_DIMENSION=1536
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
```

Without an `OPENAI_API_KEY`, the app uses deterministic simulated responses — fully usable for exploration and demos.

---

## Testing

```bash
# Typecheck all workspaces
npm run typecheck

# Run API unit + integration tests (44 tests)
npm run test

# Run E2E smoke tests (requires dev servers running)
npm run test:e2e

# Full verification pipeline
npm run verify
```

---

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular monolith** | Single deployable unit. No microservices overhead |
| **Serial integer PKs** | Simplicity and join performance over UUID complexity |
| **Docker-first** | `docker compose up -d` runs the entire stack |
| **Postgres canonical, Qdrant retrieval only** | Deterministic, recoverable. Never trust vector DB with source of truth |
| **Paragraph-aware chunking** | Soft max + overlap. No heavy NLP dependency |
| **Keyword-based relationship scoring** | Fast, testable, no extra LLM call per message |
| **Synchronous chat (v0.1.0)** | Simple endpoint, predictable state. Streaming planned for v0.2.0 |

---

## Development Philosophy

```
Simple       > clever
Working      > idealized
Readable     > impressive
Stable velocity > sporadic brilliance
```

---

## Known Limitations

- **Playwright E2E on Ubuntu 26.04**: Host OS not officially supported by Playwright 1.60.0. Tests run successfully inside `mcr.microsoft.com/playwright:v1.60.0-jammy` Docker container.
- **Simulated AI fallback**: Without an `OPENAI_API_KEY`, chat uses deterministic template responses.
- **No auth / multi-user isolation**: All data is shared.
- **Relationship sidebar refetch**: Short delay after chat before panels update.
- **Vite moderate vulnerability**: `vite <=6.4.1` path traversal advisory. Upgrading to Vite 8 is a breaking change; deferred to v0.2.0.

---

## Roadmap

### Completed (v0.1.0)
- [x] Bootstrap + runtime architecture
- [x] Docker + monorepo scaffolding
- [x] Database schema + base API routes
- [x] Lore ingestion + semantic retrieval pipeline
- [x] Character chat + persistent memory
- [x] Memory + Timeline + Relationship integration
- [x] Final release pass — stabilization, polish, testing, deployment docs

### Upcoming (v0.2.0)
- [ ] Streaming chat responses
- [ ] PDF/EPUB ingestion
- [ ] Memory compression and summarization
- [ ] Character-to-character relationship visualization
- [ ] Voice synthesis integration

---

## License

MIT © 2024
