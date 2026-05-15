# ARCHITECTURE.md

# SystemOverview

AI-native application architecture optimized for:
- rapid iteration
- maintainability
- deterministic behavior
- stable deployment
- agent-assisted development

Architecture philosophy:
- modular monolith
- explicit boundaries
- predictable state flow
- Docker-first runtime
- retrieval-augmented AI systems
- operational simplicity

Primary design goal:
> maintain fast iteration speed without sacrificing system clarity.

---

# CoreArchitecture

## [TOPOLOGY]

```txt
Frontend (React)
        │
        ▼
Backend API (Fastify)
        │
 ┌──────┼─────────┐
 │      │         │
 ▼      ▼         ▼
Postgres Qdrant   LLM Provider
```

---

# RuntimeModel

## [MONOLITH]

System is designed as:
- single deployable application stack
- shared runtime environment
- modular internal boundaries

Avoid:
- premature microservices
- distributed orchestration
- event-driven fragmentation

Benefits:
- simpler deployment
- lower operational overhead
- easier debugging
- faster iteration
- reduced cognitive load

---

# FrontendArchitecture

## [FRONTEND]

Primary responsibilities:
- rendering UI
- state presentation
- interaction handling
- chat experience
- visualization
- API communication

Preferred stack:
- React
- Tailwind
- shadcn/ui
- React Router

---

## [FRONTEND_STRUCTURE]

```txt
apps/web/
├── components/
├── routes/
├── layouts/
├── lib/
├── hooks/
├── services/
├── styles/
└── state/
```

---

## [STATE]

Frontend state hierarchy:

```txt
UI State
    ↓
Page State
    ↓
API Data
    ↓
Persistent Backend State
```

Frontend should avoid:
- excessive global state
- duplicated backend state
- deeply nested context trees

Prefer:
- local state first
- server-state driven UI
- predictable data flow

---

# BackendArchitecture

## [BACKEND]

Primary responsibilities:
- API orchestration
- business logic
- AI coordination
- persistence management
- retrieval orchestration
- memory management

Preferred stack:
- Fastify
- Zod
- TypeScript
- structured logging

---

## [BACKEND_STRUCTURE]

```txt
apps/api/
├── routes/
├── services/
├── db/
├── ai/
├── retrieval/
├── memory/
├── middleware/
├── utils/
└── schemas/
```

---

## [ROUTES]

Routes should remain:
- thin
- deterministic
- validation-focused

Routes should:
1.validate input
2.call service layer
3.return structured response

Avoid:
- embedding business logic inside routes
- hidden mutations
- large controller files

---

## [SERVICES]

Service layer handles:
- orchestration
- business logic
- persistence coordination
- retrieval logic
- AI prompt construction

Services should remain:
- modular
- composable
- observable
- testable

---

# DatabaseArchitecture

## [POSTGRES]

Postgres is the canonical source of truth.

Stores:
- users
- worlds
- characters
- lore
- memories
- relationships
- timeline events
- sessions
- metadata

---

## [POSTGRES_PRINCIPLES]

Prefer:
- normalized schemas
- explicit relations
- migrations
- deterministic persistence

Avoid:
- implicit state
- hidden denormalization
- schema drift

---

# VectorArchitecture

## [QDRANT]

Qdrant is used only for:
- semantic retrieval
- embedding search
- contextual memory lookup

It is NOT the source of truth.

---

## [VECTOR_PIPELINE]

```txt
Lore/Input
    ↓
Chunking
    ↓
Embedding Generation
    ↓
Vector Storage
    ↓
Semantic Retrieval
    ↓
Prompt Context
```

---

## [VECTOR_PRINCIPLES]

Store:
- embeddings
- chunk metadata
- retrieval identifiers

Do not store:
- canonical relational state
- business logic state
- primary application records

---

# AIArchitecture

## [AI_RUNTIME]

AI subsystem responsibilities:
- prompt assembly
- retrieval orchestration
- memory integration
- response generation
- structured extraction
- state compression

---

## [AI_PIPELINE]

```txt
User Input
    ↓
Load Current State
    ↓
Retrieve Relevant Context
    ↓
Assemble Structured Prompt
    ↓
Generate Response
    ↓
Validate Output
    ↓
Persist Meaningful State
```

---

## [PROMPT_STRUCTURE]

Preferred prompt structure:

```txt
SYSTEM
CURRENT STATE
RELEVANT CONTEXT
MEMORY
CONSTRAINTS
TASK
EXPECTED OUTPUT
```

Avoid:
- giant conversational blobs
- uncontrolled context injection
- unstructured prompt chains

---

## [OUTPUT_DISCIPLINE]

Whenever possible:
- require structured outputs
- validate JSON
- enforce schemas
- reject malformed state

Especially for:
- memory extraction
- relationship scoring
- timeline generation
- metadata creation

---

# MemoryArchitecture

## [MEMORY_MODEL]

Memory hierarchy:

```txt
Recent Conversation
        ↓
Compressed Session Summary
        ↓
Persistent Semantic Memory
        ↓
Long-Term World State
```

---

## [MEMORY_TYPES]

Memory categories:
- conversational memory
- semantic memory
- relationship state
- event history
- lore knowledge
- behavioral state

---

## [MEMORY_COMPRESSION]

Long histories should become:
- summaries
- compressed state
- semantic memories
- distilled representations

Avoid:
- infinite transcript growth
- oversized prompt histories
- uncontrolled memory accumulation

---

# RelationshipArchitecture

## [RELATIONSHIP_MODEL]

Relationships are explicit persistent state.

Track:
- trust
- respect
- affection
- rivalry
- fear
- alignment

State changes should:
- persist
- influence retrieval
- affect generation behavior

---

# TimelineArchitecture

## [TIMELINE]

Timeline acts as:
- historical continuity layer
- event persistence layer
- narrative state tracker

Timeline events:
- conversations
- discoveries
- alliances
- conflicts
- betrayals
- quests
- memory updates

---

# DeploymentArchitecture

## [DEPLOYMENT]

Preferred deployment model:

```txt
VPS
 ├── Docker Compose
 ├── Reverse Proxy
 ├── Backend
 ├── Frontend
 ├── Postgres
 └── Qdrant
```

---

## [REVERSE_PROXY]

Preferred:
- Caddy
or
- Traefik

Responsibilities:
- HTTPS
- routing
- compression
- TLS management

---

## [DOCKER]

Docker is the primary runtime boundary.

System should launch with:

```bash
docker compose up -d
```

Avoid:
- machine-specific assumptions
- hidden runtime dependencies
- undocumented setup steps

---

# LoggingArchitecture

## [LOGGING]

All critical systems should produce:
- structured logs
- timestamps
- contextual metadata
- actionable errors

Logging categories:
- API requests
- AI generation
- retrieval events
- persistence events
- failures
- runtime state

---

# FailureHandling

## [FAILURE_PROTOCOL]

Failure handling hierarchy:

1.Reproduce🧪
2.Isolate📍
3.MinimizeBlastRadius🛡️
4.ApplyTargetedFix🔧
5.Retest🔁
6.VerifyRegression🔍

Avoid:
- panic rewrites
- uncontrolled refactors
- replacing stable systems impulsively

---

# SecurityModel

## [SECURITY]

Security priorities:
- explicit validation
- constrained AI outputs
- environment isolation
- Docker runtime boundaries
- sanitized persistence
- authenticated API access

Never:
- trust raw model outputs
- execute generated code blindly
- expose secrets
- hardcode credentials

---

# ScalabilityPhilosophy

## [SCALING]

Optimize first for:
- maintainability
- iteration speed
- observability
- deployment simplicity

Only optimize for:
- horizontal scale
- distributed execution
- advanced orchestration

when real bottlenecks exist.

Avoid speculative scalability work.

---

# AgentIntegration

## [AGENT_RUNTIME]

Repository is optimized for:
- coding agents
- retrieval systems
- structured prompting
- iterative execution
- deterministic workflows

Supporting docs:
- AGENTS.md
- soul.md
- MEMORY.md
- prompting.md

---

# DesignDoctrine

## [DOCTRINE]

Simple systems survive longer.
Readable systems scale farther.
Deterministic systems debug faster.
Operational clarity beats architectural cleverness.

The architecture should remain:
- understandable
- deployable
- observable
- extensible
- stable

---

# DefinitionOfSuccess

Success means:
- stable deployment
- fast iteration
- maintainable systems
- predictable behavior
- clean retrieval architecture
- reliable persistence
- understandable codebase

The objective is not maximum sophistication.

The objective is:
> a coherent, deployable, maintainable AI-native application architecture.
