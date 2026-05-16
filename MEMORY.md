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

## Phase5TransparentCognitionStreaming

Transparent cognition and streaming UX pass completed:
- Chat now supports Server-Sent Events at `POST /api/chat/character/:characterId/stream`.
- Streaming emits three visible phases: retrieval/cognition snapshot, token chunks, and done/effects.
- Web chat uses fetch streaming and falls back to the existing synchronous chat endpoint if SSE fails.
- Cognition inspector exposes AI mode, context estimate, retrieved lore, recalled memories, relationship state, timeline context, recent history, and assembled prompt.
- Chat surface now shows subtle pipeline state, retrieved lore snippets, recalled memory, relationship drift, and timeline/memory persistence feedback.
- Backend keeps Postgres canonical and Qdrant retrieval-only; no autonomous agents or new infrastructure were introduced.

Known limitations:
- Token estimates are word/character based, not provider tokenizer counts.
- Relationship deltas are keyword-score based and apply to existing character relationships.
- Live OpenAI and Qdrant behavior still depends on configured `OPENAI_API_KEY` and ingested lore.
- Local API typecheck may require `NODE_OPTIONS=--jitless` on the current host because plain `tsc --noEmit` triggers a Node/V8 fatal crash before diagnostics.

---

## Phase6VisualIdentityGeneration

Dynamic visual identity pass completed:
- Worlds now support a persisted visual banner in `worlds.metadata.visual.banner`.
- Characters now support a persisted portrait in `characters.metadata.visual.portrait`.
- Image generation uses the existing OpenAI SDK and `OPENAI_API_KEY` with `IMAGE_MODEL`, `IMAGE_QUALITY`, and `IMAGE_GENERATION_TIMEOUT_MS`.
- If image generation is disabled, unavailable, times out, or fails, deterministic SVG data-URI fallbacks are stored instead.
- World generation starts banner and portrait generation while canonical world/character/lore/timeline/relationship records remain in Postgres.
- UI surfaces now render banners and portraits on onboarding, dashboard, worlds, character profile/list, and chat header.
- No asset CDN, object storage, provider abstraction layer, background queue, or backend redesign was introduced.

Known limitations:
- Generated image data URLs live in row metadata; use object storage before serious production scale.
- Existing seeded worlds without visual metadata render frontend atmospheric fallback frames until regenerated or backfilled.
- Image generation is synchronous from the user perspective, bounded by timeout and fallback behavior.

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
- vite 5.x: 1 moderate (path traversal in `.map` handling; requires vite@8.0.13, breaking change)
- fastify: resolved — upgraded to 5.8.5
Decision: accept vite moderate until v0.2.0 to avoid breaking build pipeline.

---

## Phase1Persistence

Drizzle ORM persistence layer completed for 9 tables.

### Architecture decisions
- Serial integer PKs chosen over UUIDs for simplicity and join performance.
- Schema isolated in `apps/api/src/db/schema.ts` with snake_case DB columns.
- DB client + pool isolated in `apps/api/src/db/client.ts` using `pg` + `drizzle-orm`.
- Migration output directed to `apps/api/drizzle/` via `drizzle.config.ts`.
- Seed script kept as a standalone executable: `npx tsx src/seed/index.ts`.
- JSONB used for flexible metadata (memories, timeline_events, chat_messages).
- Indexes created on all FK columns for predictable join performance.
- ON DELETE cascade on character/world relationships; set null on `chat_sessions.user_id`.
- `text` for long descriptions, `varchar` for short names/roles/titles.
- Tags stored as plain `text` (comma-separated) rather than arrays for portability.

### Implementation conventions
- All tables include `created_at`/`updated_at` with `default now()`.
- Relationships table stores multi-dimensional emotional weights (`trust`, `respect`, `affection`, `rivalry`, `fear`, `alignment`) as `real`.
- Memories use `importance real` + `is_active boolean` for runtime filtering.
- Timeline events use `significance integer` + `happened_at` for chronological ordering.
- Chat sessions link `world_id`, `character_id`, and optional `user_id`.
- Seed script cleans tables in reverse dependency order before inserting to avoid FK violations.
- Insert order: users → worlds → characters → lore_entries → memories → relationships → timeline_events → chat_sessions → chat_messages.

### Lessons learned
- Containers must use `postgres` hostname for DB; host-side scripts must use `localhost`.
- `tsc` build is required after editing `.ts` files before restarting the container.
- `docker compose restart` does NOT rebuild the image; use `docker compose up -d --build` after Dockerfile changes.
- `drizzle-kit generate` creates SQL; `drizzle-kit migrate` (or `push`) applies it.
- `npx tsx` is the simplest way to run TypeScript seed scripts without separate ts-node config.
- Drizzle serial PKs return as plain `number` in TypeScript; type inference works cleanly.

### Pitfalls encountered
- Dockerfile CMD was previously misaligned with `docker-compose.yml` volume mounts, causing container to look for `/app/dist/index.js` at the wrong path. Resolved by ensuring `apps/api/dist/index.js` is copied correctly and CMD matches the production stage layout.
- Seed script initially failed because `DATABASE_URL` pointed to `postgres` hostname outside containers.
- Rebuilding `apps/api` package was skipped after seed edits, leaving stale `dist/seed/index.js` in the container.
- Confusion between `generate` and `migrate` in drizzle-kit caused a temporary state where schema existed but migration SQL had not been produced.

### Verification commands
```bash
# Table counts
docker exec loreweaver_postgres psql -U loreweaver -d loreweaver -c "SELECT 'users', COUNT(*) FROM users UNION ALL SELECT 'worlds', COUNT(*) FROM worlds UNION ALL SELECT 'characters', COUNT(*) FROM characters;"

# API endpoints
curl -s http://localhost:3001/api/worlds
curl -s http://localhost:3001/api/characters/3/memories
```

---

## Phase4Retrieval

Lore ingestion + semantic retrieval pipeline completed and verified end-to-end.

### Architecture decisions
- **Chunking**: paragraph-aware deterministic chunker in `apps/api/src/services/chunker.ts`. Splits on `\n\n` with a 1500-character soft max and 50-character overlap. No sentence-boundary or semantic splitting.
- **Embeddings**: OpenAI `text-embedding-3-small` via `openai` SDK in `apps/api/src/services/embedding.ts`. Configurable via `EMBEDDING_MODEL` and `EMBEDDING_DIMENSION` env vars (default 1536). Single provider; no abstraction layer.
- **Vector store**: Qdrant collection `lore_chunks` created on first upsert with `Cosine` distance. Payload indexes on `worldId` and `loreEntryId` for filtered search.
- **Deterministic IDs**: `loreEntryId * 10000 + chunkIndex` to guarantee idempotent re-ingestion without duplicate points.
- **Postgres canonical source**: Qdrant stores only vectors + payload metadata. Lore titles, content, and relationships remain in Postgres.

### Env vars added
```bash
OPENAI_API_KEY=<required>
EMBEDDING_MODEL=text-embedding-3-small  # optional
EMBEDDING_DIMENSION=1536                  # optional
```

### Endpoints implemented
- `POST /api/lore` — create lore entry (title, content, worldId, category, tags)
- `GET /api/lore/world/:worldId` — list lore by world
- `POST /api/lore/:id/ingest` — chunk, embed, and upsert to Qdrant
- `POST /api/search/lore` — semantic search with worldId filter; returns chunks enriched with `entryExists` from Postgres

### Verification performed (2026-05-15)
1. Docker stack rebuilt and restarted (`docker compose up -d --build api web`)
2. API health: `GET /api/health` → 200 `{status: "ok"}`
3. Qdrant health: `GET /collections` → empty collections list, then populated after ingest
4. Created lore entry for world 2 (id=4)
5. Ingested lore entry (1 chunk produced)
6. Verified point `40000` exists in `lore_chunks` with correct payload and 1536-dim vector
7. Semantic search for `"shattered crown gems Wraithwood"` returned the chunk with score ~0.012 and `entryExists: true`
8. `npm audit` in `apps/api`: 0 vulnerabilities
9. `npm test` in `apps/api`: 28 tests passing (chunker + routes)

### Known limitations
- **No hybrid search**: pure vector similarity only; no BM25 or keyword boost
- **No reranking**: results returned in raw cosine order
- **Synchronous ingestion**: no background queue; large lore entries may block the request
- **Single chunk for short text**: the test lore entry fit in one chunk; multi-chunk behavior is implemented but not yet exercised at scale
- **No embedding fallback**: if OpenAI is unavailable, ingestion/search fails hard
- **Scope limited to lore**: characters, timelines, relationships are not yet searchable

### Files touched in Phase 4
- `apps/api/src/services/chunker.ts` (deterministic chunking)
- `apps/api/src/services/embedding.ts` (OpenAI embedding with env config)
- `apps/api/src/services/qdrant.ts` (collection management, upsert, search)
- `apps/api/src/services/ingestService.ts` (orchestration: chunk → embed → upsert)
- `apps/api/src/routes/lore.ts` (lore CRUD + ingest endpoint)
- `apps/api/src/routes/search.ts` (semantic search endpoint)
- `packages/shared/src/index.ts` (removed broken `types.js` export)
- `README.md` (status, env vars, retrieval limits, verification steps)
- `MEMORY.md` (this section)

---

## Phase5CharacterChat

Character chat + persistent memory completed and verified end-to-end.

### Architecture decisions
- **Chat sessions**: stored in `chat_sessions` table linking `character_id`, `world_id`, and optional `user_id`. `getOrCreateSession()` returns the most recently updated matching session to preserve continuity.
- **Messages**: stored in `chat_messages` with `role` (user/assistant/system) and `content`. `JSONB` metadata column reserved for future token counts, model info, or source citations.
- **Prompt assembly**: `buildChatContext()` performs parallel retrieval from Postgres (memories, relationships, timeline, history) and Qdrant (vector lore search). Falls back to DB lore if vector search fails (e.g., no API key).
- **Structured prompt sections**: SYSTEM / RELEVANT LORE / MEMORIES / RELATIONSHIPS / TIMELINE EVENTS / CONVERSATION HISTORY / TASK / USER. History truncated to last 6 messages to control token usage.
- **LLM integration**: OpenAI SDK with configurable `CHAT_MODEL` (default `gpt-4o-mini`). Graceful fallback to a simulated in-character response when `OPENAI_API_KEY` is absent, preserving testability and local development.
- **No streaming**: responses delivered synchronously to keep the endpoint simple and frontend state predictable.

### Endpoints implemented
- `POST /api/chat/character/:id` — send message; returns `{reply, sessionId}`
- `GET /api/chat/character/:id/history?sessionId=<n>` — fetch persisted messages for a session

### Frontend
- `Chat.tsx` page: world selector, character selector, message list, textarea input, loading indicator, error banner
- `useApi` hook powers data fetching; `apiPost` handles chat submission
- Messages optimistically appended to local state before API confirmation; refetch history in background for durability

### Verification performed (2026-05-15)
1. Docker stack rebuilt and restarted (`docker compose up -d --build api web`)
2. API health: `GET /api/health` -> 200 `{status: "ok"}`
3. Created world (id=1), character (id=1), lore entry (id=1)
4. Ingested lore entry (1 chunk produced in Qdrant)
5. Sent chat message: `POST /api/chat/character/1` -> 200 with `reply` and `sessionId`
6. Verified chat history: `GET /api/chat/character/1/history?sessionId=1` -> array of messages
7. `npm test` in `apps/api`: 34 tests passing (all suites green)
8. `npm run build` in `apps/web`: 1773 modules transformed, no errors

### Known limitations
- **Relationship updates**: keyword-based heuristic scoring per message; not semantic or LLM-driven
- **Timeline mutation**: deduplicated by title within 5-minute window; may miss genuinely new similar events
- **Memory dedup**: deduplicated by exact content within 24-hour window; paraphrased memories may still duplicate
- **Scoring bounded**: per-axis raw delta capped at ±5 per message with dampening after first keyword hit
- **No user authentication**: `userId` is optional in sessions; multi-user separation is manual
- **History truncation hardcoded**: last 6 messages only; no dynamic context window management
- **Simulated fallback is basic**: when OpenAI key is absent, the response is a template string, not a local LLM
- **No streaming**: large responses may feel slow; adding SSE or chunked delivery is a future optimization
- **No retry logic**: transient OpenAI failures return 500; client must retry

### Files touched in Phase 5
- `apps/api/src/services/chatService.ts` (session, messages, context building, prompt assembly, LLM call)
- `apps/api/src/routes/chat.ts` (chat POST + history GET endpoints)
- `apps/api/src/db/schema.ts` (chat_sessions, chat_messages tables)
- `apps/web/src/pages/Chat.tsx` (full chat UI)
- `apps/web/src/components/ui/Spinner.tsx` (loading spinner)
- `apps/api/src/__tests__/routes.test.ts` (chat endpoint tests, listCharacters mock fix)
- `README.md` (Phase 5 status, verification steps, chat config notes)
- `MEMORY.md` (this section)

---

## Phase7Polish

UI polish + deployment preparation + documentation enrichment completed and verified.

### Scope
- README polish (Quick Start, tech stack, architecture decisions, env vars, screenshots placeholders)
- Deployment docs (`docs/deployment.md`): VPS prerequisites, Docker Compose runtime, Caddy setup, troubleshooting table, production checklist
- Demo script (`docs/demo-script.md`): 15-step walkthrough with curl commands and known limitations
- Screenshot checklist (`docs/screenshots.md`): 13-item capture guide with prerequisites and README integration
- Production environment template (`.env.production.example`): all production variables with safe defaults
- Docker Compose production readiness: resource limits (512M api/pg/qdrant, 256M web), log rotation (json-file, 10m/3), restart `unless-stopped`
- Caddy reverse proxy (`infra/caddy/Caddyfile`): automatic TLS, gzip/zstd, JSON logging, www redirect
- UI polish pass: auto-scroll in chat, context-refresh spinners, loading/empty/error states verified across all pages
- Roadmap and memory updates

### Chat UX improvements
- `useRef` + `scrollIntoView` for auto-scroll on new messages and sending state
- `contextRefreshing` state triggers mini spinners on Relationships/Timeline/Memories panel headers
- `Spinner` component accepts `className` for size override

### Files touched in Phase 7
- `README.md` (screenshots section, status update)
- `docker-compose.yml` (resource limits, log rotation)
- `docs/deployment.md` (full rewrite)
- `docs/demo-script.md` (full rewrite)
- `docs/screenshots.md` (new)
- `docs/roadmap.md` (Phase 7 detail)
- `.env.production.example` (new)
- `infra/caddy/Caddyfile` (new)
- `apps/web/src/pages/Chat.tsx` (auto-scroll, context spinners)
- `apps/web/src/components/ui/Spinner.tsx` (className override)
- `MEMORY.md` (this section)
- `TASK.md` (status update)

---

## Phase8VisualIdentity

Complete visual identity overhaul — transformed generic Tailwind UI into living archival aesthetic.

### Scope
- VISUAL_DIRECTION.md design doctrine (permanent reference)
- Custom Tailwind palette: void/depth/surface/ridge base layers + gold/sage/ember/silver accents
- Typography: Inter (body), Cormorant Garamond (headings/display), JetBrains Mono (data)
- Redesigned all UI primitives: Button, Card, Input, Textarea, Spinner
- Sidebar redesign: gold left-border active states, depth layering, elegant nav hierarchy
- Dashboard: world-centric hero, chronicle tiles, character cards
- Chat: immersive dialogue surface, text-centric messages, marginalia context panels
- Onboarding: codex atmosphere with refined hero
- Lore/Worlds/Characters/Timeline: archival card styling, improved hierarchy
- Context cards: relationship score bars (trust/fear), timeline event badges, memory italic quotes
- index.html: inline SVG favicon, Open Graph meta tags, noscript message
- Error boundary: archival-styled crash recovery page
- 404 page: "This page has been lost to the archives"

### Design decisions
- Dark mode is canonical; light mode exists as subdued alternative
- No heavy shadows — subtle 1px borders and depth layers
- Gold accent `#C9A96E` replaces generic indigo
- Serif headings at lighter weights (300-500) for elegance
- Body minimum 15px with 1.65 line-height
- Uppercase labels with tracking-widest for hierarchy

### Files touched
- `VISUAL_DIRECTION.md` (new)
- `apps/web/tailwind.config.js`
- `apps/web/src/index.css`
- `apps/web/src/components/ui/*` (Button, Card, Input, Textarea, Spinner)
- `apps/web/src/components/Layout.tsx`
- `apps/web/src/components/ErrorBoundary.tsx` (new)
- `apps/web/src/components/GenerateWorldModal.tsx`
- `apps/web/src/components/RelationshipCard.tsx`
- `apps/web/src/components/TimelineCard.tsx`
- `apps/web/src/components/MemoryCard.tsx`
- `apps/web/src/pages/Dashboard.tsx`
- `apps/web/src/pages/Chat.tsx`
- `apps/web/src/pages/Onboarding.tsx`
- `apps/web/src/pages/Lore.tsx`
- `apps/web/src/pages/Worlds.tsx`
- `apps/web/src/pages/Characters.tsx`
- `apps/web/src/pages/Timeline.tsx`
- `apps/web/src/pages/NotFound.tsx` (new)
- `apps/web/src/App.tsx`
- `apps/web/index.html`
- `apps/web/e2e/smoke.spec.ts`
- `docs/screenshots/*.png` (regenerated)

### Verification
- Typecheck: pass (all workspaces)
- Build: pass
- API tests: 44 passing
- E2E tests: 18/18 passing (chromium, firefox, webkit)
- Docker rebuild: pass

---

## RuntimeMantra

Preserve momentum.
Reduce complexity.
Ship stable systems.
Compress context intelligently.
Prefer operational clarity over architectural cleverness.
