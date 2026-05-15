<div align="center">

# Loreweaver

### *AI-Native Persistent Storytelling & Memory Platform*

**v0.1.0** | Portfolio-Ready MVP

</div>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Fastify-5.8-000000?logo=fastify&logoColor=white&style=flat-square" alt="Fastify">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Qdrant-Vector-FF0000?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMyAzaDF2MThIM3oiLz48cGF0aCBkPSJNOCA3aDF2MTRIOHoiLz48cGF0aCBkPSJNMTMgMTFoMXYxMEgxM3oiLz48cGF0aCBkPSJNMTggMTVoMXY2SDE4eiIvPjwvc3ZnPg==&style=flat-square" alt="Qdrant">
  <img src="https://img.shields.io/badge/Docker-First-2496ED?logo=docker&logoColor=white&style=flat-square" alt="Docker">
  <img src="https://img.shields.io/badge/tests-44%20passing-22c55e?style=flat-square" alt="44 tests passing">
  <img src="https://img.shields.io/badge/license-MIT-4d7c0f?style=flat-square" alt="MIT License">
</p>

---

## What is Loreweaver?

Loreweaver is a **full-stack AI application** that turns raw worldbuilding documents into **living, conversational memories**. Drop lore into the system, and characters will reference it naturally in conversation — with persistent memory, relationship tracking, and timeline continuity that survives across sessions.

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **RAG-Powered Chat** | Characters answer questions grounded in your lore via semantic retrieval |
| **Persistent Memory** | Every conversation is stored and recalled across sessions |
| **Relationship Tracking** | Characters remember how they feel about each other (trust, affection, rivalry, fear) |
| **Timeline Continuity** | Events are logged and retrievable as a narrative timeline |
| **Lore Ingestion** | Paragraph-aware chunking with overlap — no heavy NLP dependencies |
| **Semantic Search** | Find relevant lore by meaning, not just keywords |
| **Docker-First** | One command: `docker compose up -d` — entire stack online |

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│  React + Vite + Tailwind + shadcn/ui  (Port 5173)     │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  Fastify API  (Port 3001)                              │
│  ──────────────────────────────────────────────────────────────  │
│  • Zod-validated REST API                              │
│  • OpenAI LLM integration (gpt-4o-mini)                │
│  • Structured prompt engineering                        │
└──────────────────────────────────────────────────────────────────┘
               │              │
               ▼              ▼
┌────────────┐  ┌────────────┐
│ PostgreSQL    │  │  Qdrant      │
│ 16 (5432)     │  │ Vector DB   │
│               │  │ (6333)      │
│ Canonical     │  │ Retrieval   │
│ source of     │  │ only — no   │
│ truth         │  │ app state   │
└────────────┘  └────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** 20+ with npm
- **Docker** + Docker Compose
- **OpenAI API Key** ([get one here](https://platform.openai.com/api-keys))

### Installation & Launch

```bash
# 1. Clone the repository
git clone https://github.com/porkmagus/loreweaver.git
cd loreweaver

# 2. Configure environment
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY

# 3. Install dependencies
npm install

# 4. Start the entire stack
npm run dev
# → Equivalent to: docker compose up -d

# 5. Seed demo data (optional)
docker compose exec api npx tsx src/seed/index.ts
# or, locally: cd apps/api && npx tsx src/seed/index.ts

# 6. Open the application
open http://localhost:5173
```

### Development Mode (Hot Reload)

```bash
# Terminal 1 — API with hot reload
cd apps/api && npm run dev

# Terminal 2 — Web with hot reload
cd apps/web && npm run dev
```

### One-Command Verification

```bash
# Typecheck + run all tests
npm run verify

# Expected output:
# ✓ @loreweaver/api  typecheck
# ✓ @loreweaver/web  typecheck
# ✓ @loreweaver/shared typecheck
# ✓ 44 tests passing (~400ms)
```

---

## Test Suite

| Suite | Tests | Duration | Coverage |
|-------|-------|----------|----------|
| Unit + Integration | 44 | ~400ms | Lore chunking, relationship scoring, route validation, lore ingestion, semantic search, chat memory/timeline/relationship persistence |
| E2E Smoke | 2 (scaffold) | Playwright | Ready for CI runners |

```bash
# Run API unit/integration tests
npm run test

# Run type checking across all workspaces
npm run typecheck

# Run E2E smoke tests (requires dev servers)
npm run test:e2e

# Full verification pipeline
npm run verify
```

---

## Tech Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui | Fast, responsive UI with accessible components |
| **Routing** | React Router | SPA navigation with deep linking |
| **API** | Fastify 5 + TypeScript | High-performance, typed REST API |
| **Validation** | Zod | Runtime schema validation for all endpoints |
| **ORM** | Drizzle ORM | Type-safe SQL with migrations |
| **Database** | PostgreSQL 16 | Relational source of truth |
| **Vector DB** | Qdrant | Semantic search and embedding storage |
| **AI** | OpenAI API (gpt-4o-mini, text-embedding-3-small) | LLM inference and embedding generation |
| **Testing** | Vitest + Playwright | Unit, integration, and E2E testing |
| **Runtime** | Docker Compose | Single-command deployment |
| **Deployment** | Caddy + VPS | Production-ready reverse proxy |

---

## Project Structure

```
loreweaver/
├─── apps/
│   ├─── api/                    # Fastify backend (port 3001)
│   │   ├─── src/
│   │   │   ├─── routes/         # REST endpoints (worlds, characters, lore, chat, timeline, search)
│   │   │   ├─── services/       # Chat orchestration, Qdrant search, chunking, scoring
│   │   │   ├─── utils/          # chatScoring.ts, loreChunker.ts, extractSummary.ts
│   │   │   └─── __tests__/      # 44 passing tests
│   │   └─── Dockerfile
│   └─── web/                    # React frontend (port 5173)
│       ├─── src/
│       │   ├─── pages/          # Dashboard, Worlds, Characters, Chat, Lore, Timeline
│       │   └─── components/     # Reusable UI components
│       └─── Dockerfile
│
├─── packages/
│   └─── shared/                 # Shared types and schemas
│
├─── docker-compose.yml          # Postgres + Qdrant + API + Web
├─── .env.example               # Required environment variables
├─── .env.production.example    # Production deployment config
├─── README.md                  # You are here
└─── docs/
    ├─── deployment.md          # VPS deployment guide
    ├─── demo-script.md         # Demo walkthrough script
    ├─── release-check.md       # Pre-release checklist
    └─── screenshots.md         # Screenshot capture guide
```

---

## Environment Variables

Create a `.env` file at the repository root:

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional — defaults shown
DATABASE_URL=postgresql://loreweaver:loreweaver@localhost:5432/loreweaver
QDRANT_URL=http://localhost:6333
EMBEDDING_DIMENSION=1536
EMBEDDING_MODEL=text-embedding-3-small
CHAT_MODEL=gpt-4o-mini
```

For production deployment, see `.env.production.example` and `docs/deployment.md`.

---

## Key Architecture Decisions

| Decision | Rationale |
|------------|-----------|
| **Modular monolith** | Single deployable unit. No microservices overhead, no distributed orchestration |
| **Serial integer PKs** | Simplicity and join performance over UUID complexity |
| **Docker-first runtime** | `docker compose up -d` is the only command needed to run the full stack |
| **Postgres canonical, Qdrant retrieval only** | Never store application state in vector systems — deterministic, recoverable |
| **Paragraph-aware chunking** | Soft max + overlap; no heavy NLP dependency, fast and observable |
| **Keyword-based relationship scoring** | Fast, testable, no extra LLM call per message |
| **Synchronous chat (v0.1.0)** | Keeps endpoint simple and state predictable; streaming planned for v0.2.0 |

---

## Development Philosophy

```
Simple       > clever
Working      > idealized
Readable     > impressive
Stable velocity > sporadic brilliance
```

The repository is designed as a **structured synthetic cognition environment** — runtime markdown docs (AGENTS.md, MEMORY.md, TASK.md, ARCHITECTURE.md) enable agent-assisted development where an AI partner can read the runtime state and execute tasks autonomously.

---

## Screenshots

> See `docs/screenshots.md` for the full capture guide.

<p align="center">
  <img src="docs/screenshots/01-dashboard.png" width="80%" alt="Dashboard">
  <br><em>Dashboard — active worlds and character counts at a glance</em>
</p>

<p align="center">
  <img src="docs/screenshots/07-chat-lore-response.png" width="80%" alt="Chat with Lore">
  <br><em>Character chat with lore-grounded context and contextual sidebar</em>
</p>

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
