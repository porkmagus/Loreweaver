<div align="center">

<img src="docs/screenshots/01-dashboard.png" width="100%" alt="Loreweaver Dashboard" style="border-radius: 12px; max-width: 1000px;">

<h1>🜂 Loreweaver</h1>

<p><em>AI-Native Persistent Storytelling & Memory Platform</em></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white&style=flat-square" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white&style=flat-square" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black&style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Fastify-5.8-000000?logo=fastify&logoColor=white&style=flat-square" alt="Fastify">
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white&style=flat-square" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Qdrant-Vector-FF0000?style=flat-square" alt="Qdrant">
  <img src="https://img.shields.io/badge/Docker-First-2496ED?logo=docker&logoColor=white&style=flat-square" alt="Docker">
  <img src="https://img.shields.io/badge/tests-86%20passing-22c55e?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/license-MIT-4d7c0f?style=flat-square" alt="License">
</p>

</div>

---

## What It Does

Loreweaver turns raw worldbuilding documents into **living, conversational memories**.

Drop lore into the system. Characters reference it naturally in dialogue — with persistent memory, relationship tracking, and timeline continuity that survives across sessions. Every response is grounded in a deterministic, observable RAG pipeline that you can inspect in real time.

> *Built for worldbuilders, game masters, and narrative designers who want characters that actually remember.*

---

## ⚡ One Command to Production

```bash
git clone https://github.com/porkmagus/loreweaver.git
cd loreweaver
cp .env.example .env
docker compose up -d --build
```

The entire stack — React frontend, Fastify API, PostgreSQL, Qdrant vector store — boots in under 60 seconds. Demo data seeds automatically. Open **[http://localhost:5173](http://localhost:5173)** and start building worlds.

```mermaid
flowchart LR
    A["docker compose up -d"] --> B["🌐 React\nlocalhost:5173"]
    A --> C["⚡ Fastify API\nlocalhost:3001"]
    A --> D["🐘 PostgreSQL 16"]
    A --> E["🔍 Qdrant"]
    C --> D
    C --> E
```

---

## 🧠 The RAG Engine

Loreweaver's retrieval-augmented generation pipeline is the heart of the system. It is **fully observable**, **deterministic**, and **grounded in canonical relational state** — never trust vector DB with source of truth.

### Semantic Retrieval Pipeline

```mermaid
flowchart TB
    subgraph Ingestion
        L["📜 Raw Lore"] --> C["✂️ Chunker\nParagraph-aware + overlap"]
        C --> E["🔢 Embedding\ntext-embedding-3-small"]
        E --> V["📦 Qdrant Upsert"]
    end

    subgraph Retrieval
        Q["❓ User Query"] --> EQ["🔢 Query Embedding"]
        EQ --> S["🔍 Qdrant Search\nworldId-scoped Cosine"]
        S --> M["🔗 Metadata Join\nBatch-fetch Postgres"]
        M --> R["📋 Ranked Results"]
    end

    subgraph Generation
        R --> P["📝 Prompt Assembly\nSYSTEM + CONTEXT + TASK"]
        P --> LLM["🤖 LLM Generate\nSSE Streaming"]
        LLM --> CH["💬 Character Response"]
    end
```

### Chunking Strategy

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **Paragraph-aware** | Splits on sentence boundaries | Preserves semantic coherence |
| **Soft max ~800 chars** | Configurable chunk ceiling | Balances granularity vs. context |
| **Overlap window** | Shared sentences between chunks | No information loss at boundaries |
| **Deterministic IDs** | `loreEntryId × 10000 + chunkIndex` | Idempotent re-ingestion |
| **Zero NLP dependencies** | No spaCy, NLTK, or heavy libs | Fast, testable, portable |

---

## 🧩 Cognition Architecture

Every chat message triggers a transparent cognition pipeline. Open the inspector and see exactly what the AI is thinking.

```mermaid
flowchart LR
    U["👤 User Message"] --> A["🧠 Assemble Context"]
    A --> B1["📚 Retrieved Lore\n(Qdrant semantic search)"]
    A --> B2["🧠 Recalled Memories\n(Postgres importance-ranked)"]
    A --> B3["❤️ Relationships\n(trust, respect, fear, rivalry)"]
    A --> B4["📅 Timeline Events\n(character history)"]
    A --> B5["💬 Chat History\n(last 20 messages)"]
    B1 --> C["📝 Structured Prompt"]
    B2 --> C
    B3 --> C
    B4 --> C
    B5 --> C
    C --> D["🤖 LLM Response"]
    D --> E["📊 Effects\nmemory + timeline + relationship deltas"]
```

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph Frontend
        F1["⚛️ React 18 + Vite"]
        F2["🎨 Tailwind + shadcn/ui"]
    end

    subgraph API
        A1["⚡ Fastify + TypeScript"]
        A2["✅ Zod Validation"]
    end

    subgraph Persistence
        P1["🐘 PostgreSQL 16\nCanonical Source of Truth"]
        P2["🔍 Qdrant\nRetrieval Only"]
    end

    subgraph AI
        AI1["🔮 Embeddings"]
        AI2["💬 Chat LLM"]
        AI3["🎨 Images"]
    end

    F1 --> A1
    A1 --> P1
    A1 --> P2
    A1 --> AI1
    A1 --> AI2
    A1 --> AI3
```

### Database Schema

```mermaid
erDiagram
    WORLDS {
        int id PK
        string name
        string description
        string genre
        jsonb metadata
    }
    CHARACTERS {
        int id PK
        int worldId FK
        string name
        string personality
        string description
        string role
        boolean isPlayer
        jsonb metadata
    }
    LORE {
        int id PK
        int worldId FK
        string title
        string content
        string category
        string tags
    }
    MEMORIES {
        int id PK
        int characterId FK
        int worldId FK
        string content
        int importance
        boolean isActive
    }
    RELATIONSHIPS {
        int id PK
        int fromCharacterId FK
        int toCharacterId FK
        float trust
        float respect
        float affection
        float rivalry
        float fear
        float alignment
        string notes
    }
    TIMELINE {
        int id PK
        int characterId FK
        string title
        string description
        string eventType
        int significance
        timestamp happenedAt
    }
    SESSIONS {
        int id PK
        int characterId FK
        int worldId FK
        string title
        string summary
    }
    MESSAGES {
        int id PK
        int sessionId FK
        string role
        string content
        jsonb metadata
    }

    WORLDS ||--o{ CHARACTERS : "contains"
    WORLDS ||--o{ LORE : "contains"
    CHARACTERS ||--o{ MEMORIES : "remembers"
    CHARACTERS ||--o{ RELATIONSHIPS : "relates to"
    CHARACTERS ||--o{ TIMELINE : "experiences"
    CHARACTERS ||--o{ SESSIONS : "chats in"
    SESSIONS ||--o{ MESSAGES : "contains"
```

---

## 🧬 Memory & Persistence Model

```mermaid
flowchart TB
    L4["🏛️ Long-Term World State\nLore, geography, history"]
    L3["🧬 Semantic Memory\nCompressed narrative memories"]
    L2["📋 Session Summaries\nAuto-generated recaps"]
    L1["💬 Recent Conversation\nLast 20 messages in prompt"]

    U["👤 User Input"] --> L1
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> R["📝 Retrieved Context\nAssembled into prompt"]
    R --> LLM["🤖 LLM"]
```

### Relationship Scoring Engine

Characters don't just chat — they **evolve**.

| Dimension | Range | Tracked In |
|-----------|-------|------------|
| **Trust** | 0.0 – 1.0 | Conversation sentiment analysis |
| **Respect** | 0.0 – 1.0 | Deference signals in dialogue |
| **Affection** | 0.0 – 1.0 | Warmth markers |
| **Rivalry** | 0.0 – 1.0 | Conflict / competition |
| **Fear** | 0.0 – 1.0 | Threat perception |
| **Alignment** | 0.0 – 1.0 | Shared goals / worldview |

Updates are keyword-based (fast, testable, no extra LLM call per message) and persisted immediately.

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React 18 + Vite + Tailwind CSS + shadcn/ui | Fast, responsive, archival UI |
| **API** | Fastify 5 + TypeScript | High-performance REST |
| **Validation** | Zod | Runtime schema enforcement |
| **ORM** | Drizzle ORM | Type-safe SQL + migrations |
| **Database** | PostgreSQL 16 | Relational source of truth |
| **Vector DB** | Qdrant | Semantic search & embeddings |
| **AI** | OpenAI API (gpt-4o-mini, text-embedding-3-small) | LLM + embeddings |
| **Testing** | Vitest + Playwright | 86 tests (unit, integration, E2E) |
| **Runtime** | Docker Compose | Single-command deployment |

---

## 📸 Screenshots

<div align="center">

| Dashboard | Onboarding | Worlds |
|:---:|:---:|:---:|
| <img src="docs/screenshots/01-dashboard.png" width="260"> | <img src="docs/screenshots/02-onboarding.png" width="260"> | <img src="docs/screenshots/03-worlds.png" width="260"> |

| Characters | Lore | Chat |
|:---:|:---:|:---:|
| <img src="docs/screenshots/04-characters.png" width="260"> | <img src="docs/screenshots/05-lore.png" width="260"> | <img src="docs/screenshots/07-chat-response.png" width="260"> |

</div>

---

## 🌍 Deployment

### Docker Compose (Development / Production)

```yaml
services:
  web:
    build: ./apps/web
    ports: ["5173:80"]
  api:
    build: ./apps/api
    ports: ["3001:3001"]
  postgres:
    image: postgres:16
    volumes: ["pgdata:/var/lib/postgresql/data"]
  qdrant:
    image: qdrant/qdrant
    volumes: ["qdrant:/qdrant/storage"]
```

### Production Topology

```mermaid
flowchart TB
    U["👤 Browser"] --> C["🌐 Caddy\nReverse Proxy + TLS"]
    C --> W["⚛️ Web Container"]
    C --> A["⚡ API Container\nFastify"]
    A --> P["🐘 PostgreSQL"]
    A --> Q["🔍 Qdrant"]
```

---

## 📊 Testing

```bash
npm run typecheck    # Type-check all workspaces
npm run test         # 73 API unit + integration tests
npm run test:web     # 13 web unit tests
npm run test:e2e     # 14 Playwright smoke tests
npm run verify       # Full CI pipeline
```

---

## 🎓 Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Modular Monolith** | Single deployable unit — no microservices overhead |
| **Postgres Canonical, Qdrant Retrieval-Only** | Deterministic, recoverable. Never trust vectors with source of truth |
| **SSE for Chat Streaming** | Real-time UX without websocket infrastructure complexity |
| **Paragraph-Aware Chunking** | Soft max + overlap — no heavy NLP dependency |
| **Keyword-Based Relationship Scoring** | Fast, testable, no extra LLM call per message |
| **Serial Integer PKs** | Simplicity and join performance over UUID complexity |
| **Transparent Cognition Snapshot** | Full observability of retrieval and prompt assembly |
| **Visual Assets in Metadata** | Banners and portraits persist on canonical rows without asset infrastructure |

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

Without an `OPENAI_API_KEY`, the app uses deterministic simulated responses and deterministic visual fallbacks — fully usable for exploration and demos.

---

## License

MIT © 2024
