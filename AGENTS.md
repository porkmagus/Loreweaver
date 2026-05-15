# AGENTS.md

# RepoPurpose

AI-native application repository optimized for:
- rapid iteration
- stable deployment
- maintainable architecture
- disciplined engineering execution
- agent-assisted development

Primary objective:
Ship a polished, production-style system with minimal unnecessary complexity.

---

# RuntimePrinciples

Simple>clever.
Working>idealized.
Stable velocity>sporadic brilliance.
Explicit>implicit.
Readable>impressive.
Operational reality>architectural fantasy.

Preserve momentum.
Preserve deployability.
Preserve maintainability.

---

# RepoArchitecture

## [ARCH]

Preferred architecture:
- modular monolith
- typed interfaces
- service-layer backend
- relational source-of-truth
- vector retrieval subsystem
- Docker-first runtime

Avoid:
- microservices
- distributed orchestration
- speculative abstractions
- event-chaos architecture
- unnecessary infrastructure

Complexity must be earned.

---

# StackRules

## [FRONTEND]

Preferred:
- React
- Tailwind
- shadcn/ui
- React Router

Frontend principles:
- responsive
- readable
- coherent
- lightweight
- minimal cognitive overhead

Avoid:
- excessive animation
- deeply nested state
- abstraction-heavy component systems
- unnecessary frontend complexity

---

## [BACKEND]

Preferred:
- Fastify
- Zod validation
- service-layer logic
- typed APIs
- structured logging

Backend principles:
- deterministic behavior
- modular routes
- observable state
- explicit validation
- debuggable flows

Avoid:
- hidden side effects
- implicit mutation
- magic framework behavior
- uncontrolled async chains

---

## [DATABASE]

Relational DB:
- canonical source of truth

Vector DB:
- semantic retrieval only

Never store canonical application state inside vector systems.

Preferred:
- normalized schemas
- explicit relations
- migrations
- deterministic persistence

---

## [AI]

AI systems must remain:
- grounded
- observable
- constrained
- testable

Preferred workflow:
1.ContextGather🧠
2.RetrieveRelevant📡
3.StructurePrompt📋
4.Generate⚡
5.Validate🛡️
6.Persist♻️

Avoid:
- autonomous recursive loops
- uncontrolled chain explosion
- context flooding
- unconstrained generation
- speculative “agent swarm” architecture

---

# PromptEngineering

## [PROMPTSTRUCT]

Preferred structure:

```txt
SYSTEM
CURRENT STATE
RELEVANT CONTEXT
CONSTRAINTS
TASK
EXPECTED OUTPUT
```

Avoid large conversational prompt blobs.

---

## [CTXDISC]

Prioritize:
1. active state
2. recent interactions
3. semantically relevant retrievals
4. operational constraints
5. current objective

Avoid:
- full-history injection
- repetitive context
- oversized prompts
- irrelevant retrievals

Tight context>large context.

---

## [OUTPUTDISC]

Prefer:
- JSON outputs
- typed schemas
- deterministic formatting
- explicit state transitions

Validate outputs before persistence.

Never trust raw generations blindly.

---

## [MEMCOMP]

Long histories→compress:
- summaries
- semantic memory
- distilled state
- compressed representations

Avoid infinite transcript accumulation.

---

# ExecutionFlow

## [ASSESS]

- 1a.ParseIntent🎯
- 1b.ScopeSystems🧭
- 1c.CheckConstraints📋
- 1d.LoadRelevantFiles📂
- 1e.EstBlastRadius⚠️

---

## [PLAN]

- 2a.Decompose🔧
- 2b.MinimizeComplexity📉
- 2c.DefineVerticalSlice📦
- 2d.MapDependencies🔗
- 2e.PreserveArchitecture🏗️

---

## [EXECUTE]

- 3a.ModifyTargetedFiles✏️
- 3b.PreserveWorkingState🛡️
- 3c.ValidateTypes🧠
- 3d.ValidateImports🔗
- 3e.ValidateRuntime⚙️
- 3f.ValidateDocker🐳

---

## [VERIFY]

- 4a.CheckBuild✅
- 4b.CheckBehavior🧪
- 4c.CheckRegression🔍
- 4d.CheckLogs📜
- 4e.CheckEdgeCases🧱

---

## [DELIVER]

- 5a.ConsolidateChanges📋
- 5b.UpdateDocs📝
- 5c.ReportState📡

---

# BuildDiscipline

## [BUILDSTATE]

Repository must remain:
- buildable
- deployable
- type-safe
- recoverable

Never leave:
- failing builds
- unresolved imports
- invalid Docker states
- broken environment configs
- abandoned scaffolding

Every checkpoint should work.

---

## [DOCKERFIRST]

Primary runtime:

```bash
docker compose up -d
```

Avoid machine-specific assumptions.

---

## [ENV]

Use:
- explicit environment variables
- `.env.example`
- deterministic configuration

Never hardcode secrets.

---

# RefactorPolicy

Refactor only when:
- maintainability degrades
- duplication becomes harmful
- debugging becomes difficult
- measurable bottlenecks exist

Avoid:
- aesthetic rewrites
- architecture churn
- speculative redesigns

Preserve stable systems whenever possible.

---

# DependencyPolicy

Before adding dependencies:
1.VerifyNecessity📋
2.VerifyMaintenance🔍
3.VerifyCompatibility🔗
4.VerifyMaturity🏗️

Prefer fewer dependencies.

Dependency count = operational liability.

---

# FileDiscipline

Files should remain:
- focused
- readable
- navigable
- logically scoped

Avoid:
- thousand-line files
- tangled responsibilities
- abstraction forests
- dead utilities

---

# LoggingStandards

Logs should be:
- structured
- timestamped
- actionable
- readable

Avoid:
- noisy spam
- swallowed exceptions
- meaningless traces

---

# FailureProtocol

When failures occur:

1.Reproduce🧪
2.Isolate📍
3.MinimizeBlastRadius🛡️
4.ApplyTargetedFix🔧
5.Retest🔁
6.VerifyRegression🔍

Never panic-refactor.

Never replace stable systems impulsively.

---

# GitDiscipline

Prefer:
- small commits
- stable checkpoints
- meaningful commit messages
- recoverable states

Every completed phase should represent:
- working functionality
- deployable state
- architectural stability

---

# UIPrinciples

Interfaces should feel:
- intentional
- coherent
- responsive
- calm
- readable

Prefer:
- strong spacing
- restrained motion
- predictable interaction
- visual hierarchy

Avoid:
- clutter
- excessive effects
- hidden workflows
- unnecessary interaction complexity

---

# CommStyle

Communicate:
- clearly
- directly
- technically
- concisely

Avoid:
- hype
- speculative certainty
- unnecessary verbosity
- architectural grandstanding

---

# DecisionHierarchy

Priority order:

1.PreserveWorkingSystems🛡️
2.MinimizeComplexity📉
3.MaintainClarity🔍
4.PreserveMaintainability♻️
5.ImproveIterationSpeed⚡
6.ImproveObservability📡
7.OptimizePerformance🚀
8.OptimizeElegance🎨

Reliability>cleverness.

---

# DefinitionOfSuccess

Success means:
- systems ship
- builds remain stable
- deployment remains simple
- architecture remains understandable
- iteration remains fast
- debugging remains manageable
- code remains maintainable

The objective is not maximum sophistication.

The objective is:
> stable, maintainable, deployable systems built with disciplined engineering execution.

---

# RuntimeMantra

Build simple systems.
Preserve momentum.
Reduce complexity.
Ship vertical slices.
Validate continuously.
Keep the repo healthy.

One coherent system at a time.
