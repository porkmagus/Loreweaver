# MEMORY.md

## RuntimeState

Current system architecture:
- modular monolith
- Docker-first runtime
- React frontend
- Fastify backend
- PostgreSQL source-of-truth
- Qdrant semantic retrieval layer

Primary runtime goal:
- fast iteration
- stable deployment
- maintainable architecture
- deterministic behavior

---

## ActiveConstraints

Current constraints:
- prioritize shipping velocity
- preserve working builds
- minimize dependency count
- avoid speculative abstractions
- avoid premature scaling work
- optimize for maintainability first

Avoid:
- microservices
- orchestration sprawl
- event-chaos architecture
- unnecessary framework replacement

---

## AIState

AI systems currently optimized for:
- retrieval-augmented generation
- persistent memory
- semantic retrieval
- structured prompting
- deterministic output handling

AI behavior priorities:
1.context relevance
2.token efficiency
3.output validation
4.memory compression
5.operational predictability

Avoid:
- uncontrolled recursion
- autonomous self-modification
- unconstrained generations
- oversized prompts

---

## RetrievalState

Qdrant responsibilities:
- semantic lookup
- lore retrieval
- memory retrieval
- contextual augmentation

Postgres responsibilities:
- canonical persistence
- relationships
- timeline state
- world state
- metadata
- user state

Never use vector DB as source-of-truth.

---

## MemoryRules

Long-term memory should contain:
- distilled state
- important decisions
- architecture conventions
- operational lessons
- recurring implementation patterns

Do not store:
- raw transcripts
- redundant summaries
- trivial implementation details
- noisy logs

Compress aggressively.

---

## PromptingState

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

Preferred outputs:
- JSON
- typed structures
- deterministic formatting

Validate generations before persistence.

---

## OperationalLessons

Stable systems outperform clever systems.

Readable systems debug faster.

Small commits reduce recovery cost.

Vertical slices preserve momentum.

Context discipline improves generation quality.

Large prompts reduce clarity.

Retrieval quality matters more than retrieval quantity.

---

## RuntimePreferences

Preferred workflow:

```bash
docker compose up -d
```

Preferred development style:
- targeted edits
- incremental refactors
- stable checkpoints
- deterministic behavior

Avoid:
- giant rewrites
- architecture churn
- dependency sprawl

---

## BuildDiscipline

Repository should always remain:
- buildable
- deployable
- type-safe
- recoverable

Never leave:
- broken imports
- unresolved merges
- invalid environment configs
- abandoned scaffolding

---

## KnownOptimizationTargets

Future optimization areas:
- retrieval ranking
- memory compression quality
- prompt token efficiency
- relationship weighting
- semantic memory clustering
- structured generation reliability

Optimize only after stability.

---

## BootstrapHistory

Phase 0 bootstrap completed:
- monorepo structure established (apps/api, apps/web, packages/shared)
- Docker Compose stack operational (postgres, qdrant, api, web)
- all container healthchecks passing
- API health endpoint verified at /api/health
- web frontend serving on port 5173
- .env template created and activated
- npm overrides added for fast-uri and esbuild to reduce audit surface
- repository docs reorganized per BOOTSTRAP.md (docs/, skills/)

Remaining audit items:
- fastify 4.27.0: 1 high (requires fastify@5.8.5, breaking change)
- vite 5.x: 1 moderate (requires vite@8.0.13, breaking change)
Decision: accept until upstream workspace packages update major versions.

---

## RuntimeMantra

Preserve momentum.
Reduce complexity.
Ship stable systems.
Compress context intelligently.
Prefer operational clarity over architectural cleverness.
