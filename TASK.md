# TASK.md

# Current Objective

Execute the Final Mega Pass for Loreweaver v0.1.0 Portfolio MVP.

This is the final cleanup, polish, onboarding, verification, release-readiness, and operational sanity pass.

The goal is to leave the repository in a state where:

```txt
Fresh clone → docker compose up -d --build → usable polished app
```

This is NOT a feature expansion phase.

Do not add major new systems.

Do not redesign the architecture.

Focus on:
- stability
- polish
- onboarding
- operational maturity
- portfolio presentation quality
- release confidence

---

# Primary Goals

The repository should now feel:

- polished
- understandable
- reliable
- deployable
- demo-ready
- recruiter-friendly
- engineer-friendly

The app should feel like:
- a real product MVP
- not an experimental prototype
- not an abandoned AI sandbox

---

# Scope

Perform a comprehensive cleanup and release verification pass covering:

- onboarding flow
- Docker runtime
- startup simplicity
- UI polish
- empty/loading/error states
- API sanity
- test reliability
- documentation quality
- deployment readiness
- repo cleanliness
- developer ergonomics
- final smoke verification

---

# DOCKER & STARTUP REQUIREMENTS

Perform a TRUE clean-room verification.

Required verification flow:

```bash
docker compose down -v
docker compose up -d --build
```

Confirm:
- frontend healthy
- backend healthy
- postgres healthy
- qdrant healthy
- migrations applied
- demo or generated data available
- onboarding functional
- generated worlds functional
- lore ingestion functional
- retrieval functional
- chat functional
- memory persistence functional
- relationship updates functional
- timeline events functional

---

# STARTUP UX REQUIREMENTS

The primary onboarding flow should remain:

```bash
git clone https://github.com/porkmagus/loreweaver.git
cd loreweaver
cp .env.example .env
docker compose up -d --build
```

Then:

```txt
Open:
http://localhost:5173
```

The README must clearly communicate this.

Avoid:
- excessive setup instructions
- unnecessary commands before first launch
- hidden onboarding requirements

---

# README FINAL PASS

Perform a final README polish pass.

Ensure README contains:

- concise project summary
- screenshots section
- feature overview
- architecture overview
- stack overview
- quickstart
- AI mode explanation
- onboarding explanation
- environment variables
- Docker usage
- testing commands
- deployment overview
- known limitations
- roadmap summary
- portfolio/resume bullet

README should feel:
- concise
- modern
- easy to skim
- technically credible

---

# SCREENSHOT REQUIREMENTS

Add or verify screenshot support.

Preferred:
- actual screenshots committed to repo

Minimum:
- screenshot placeholders
- screenshot instructions

Recommended screenshots:

- onboarding screen
- dashboard
- world overview
- lore search
- character chat
- relationship/timeline sidebar
- generated world flow

---

# UI POLISH REQUIREMENTS

Perform a final UI consistency pass.

Review:

- spacing
- empty states
- loading states
- error states
- status indicators
- button consistency
- icon consistency
- card consistency
- typography consistency

Do not redesign the app.

Apply targeted polish only.

---

# HEALTH & STATUS REQUIREMENTS

Verify or improve:

- /health endpoint
- /api/health endpoint
- frontend status indicators
- simulated/live AI mode indicators
- Qdrant connection indicator

Health responses should remain lightweight and deterministic.

---

# TESTING REQUIREMENTS

Perform final testing verification.

Required:
- unit tests
- integration tests
- E2E smoke tests if environment allows
- build verification
- typecheck verification

Run and report:

```bash
npm test
npm run build
npm run typecheck
npm run verify
```

Adjust commands to actual repo scripts.

If Playwright browser install issues exist on Ubuntu 26:
- document limitation clearly
- preserve test structure
- do not over-engineer workaround infrastructure

---

# ROOT SCRIPT REQUIREMENTS

Verify ergonomic root scripts exist.

Preferred examples:

```json
{
  "scripts": {
    "verify": "...",
    "logs": "...",
    "down": "...",
    "seed": "...",
    "reset": "..."
  }
}
```

Do not break existing workflows.

---

# CLEANUP REQUIREMENTS

Perform a final cleanup pass.

Review for:

- dead exports
- stale comments
- unused imports
- duplicated code
- mismatched types
- inconsistent naming
- broken links
- stale docs
- stale TODOs
- noisy console logs
- accidental debug output

Perform only safe targeted cleanup.

---

# DOCUMENTATION REQUIREMENTS

Verify or improve:

- docs/deployment.md
- docs/demo-script.md
- docs/roadmap.md
- MEMORY.md
- .env.example

Deployment docs should include:
- VPS deployment
- Docker Compose usage
- persistence notes
- backup notes
- troubleshooting notes

---

# KNOWN LIMITATIONS REQUIREMENTS

Document all remaining important MVP limitations clearly.

Examples:
- delayed sidebar refetch after chat
- simulated AI fallback behavior
- Playwright Ubuntu limitation if unresolved
- lack of auth/multi-user isolation
- lack of advanced memory pruning

Do not hide limitations.

Transparent engineering presentation is preferred.

---

# CONSTRAINTS

Do not implement:

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
- massive provider abstraction systems

Preserve:
- Docker-first runtime
- current architecture
- current retrieval pipeline
- current onboarding flow
- current chat flow
- passing tests
- type safety

---

# FINAL VERIFICATION REQUIREMENTS

Perform and report final verification for:

- clean-room Docker startup
- onboarding flow
- generated world flow
- lore ingestion
- retrieval search
- character chat
- relationship updates
- timeline updates
- memory persistence
- UI usability
- tests/build/typecheck

---

# SUCCESS CRITERIA

- fresh clone startup works
- onboarding feels polished
- generated worlds work
- retrieval works
- chat works
- persistence works
- README is portfolio-quality
- UI feels cohesive
- startup friction minimized
- repo feels operationally mature
- all tests/builds pass
- no obvious MVP usability gaps remain

---

# FINAL DELIVERABLES

Provide:

- final release summary
- changed files
- onboarding flow summary
- verification command results
- test/build results
- deployment readiness notes
- remaining known limitations
- recommended GitHub release notes summary
- recommended final git tag command

Recommended tag:

```bash
git tag v0.1.0-portfolio-mvp
```
