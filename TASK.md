# TASK.md

# Current Objective

Implement Dynamic Character Portraits and World Banner Generation for Loreweaver.

The app now has:
- world generation
- retrieval
- streaming cognition
- memory systems
- relationships
- timelines
- polished visual identity

The next priority is:
```txt
make generated worlds visually alive
```

This phase focuses on:
- generated character portraits
- generated world banners
- immersive visual identity
- persistent visual world assets

The goal is:
```txt
generated worlds should feel visually real immediately
```

This is a high-impact portfolio and demo phase.

Not a major backend rewrite.

---

# Primary Goals

Generated worlds should now include:
- visual identity
- atmospheric imagery
- memorable characters

Users should feel:
```txt
I just created a living world
```

not:
```txt
I generated some database rows
```

---

# Scope

Implement:

- generated character portraits
- generated world banners
- persistent image storage references
- image generation pipeline
- graceful fallback behavior
- polished visual presentation

Do not:
- redesign retrieval architecture
- redesign persistence systems
- add auth
- add multiplayer
- add advanced asset management systems

---

# 1. World Banner Generation

When a world is generated:
- generate a world banner image

Banner should visually reflect:
- world tone
- genre
- atmosphere
- factions/themes

Examples:
- gothic kingdoms
- sci-fi ruins
- haunted forests
- cosmic archives

Banner should:
- persist
- display on dashboard/world page
- become part of world identity

---

# 2. Character Portrait Generation

When characters are generated:
- generate stylized portraits

Portraits should reflect:
- character role
- personality
- world aesthetic
- faction alignment

Portrait style direction:
- painterly
- cinematic
- dark fantasy/sci-fi
- restrained
- atmospheric

Avoid:
- anime overload
- meme aesthetics
- hypersexualized designs
- generic AI headshots

---

# 3. Generation Provider Architecture

Use the simplest viable image generation path.

Preferred:
- OpenAI image API
- Fal
- Replicate
- equivalent existing provider

Do not:
- build giant provider abstraction systems
- add unnecessary orchestration layers

Keep implementation pragmatic.

---

# 4. Fallback Behavior

If image generation is unavailable:
- use deterministic fallback placeholders
- preserve layout quality
- clearly indicate image generation unavailable

Do not break onboarding or world generation.

---

# 5. Persistence Requirements

Persist:
- image URLs
- asset metadata
- generation status if useful

Do not:
- build full asset CDN systems
- add object storage infrastructure unless already trivial

Simple persistent URLs are acceptable.

---

# 6. UI Integration

Integrate imagery into:

- onboarding flow
- dashboard
- world overview
- character profile
- chat header/sidebar if appropriate

Imagery should feel:
- atmospheric
- premium
- cohesive with VISUAL_DIRECTION.md

Avoid:
- giant cluttered image walls
- noisy gallery layouts

---

# 7. Loading & Generation States

Image generation may take time.

Add:
- elegant loading states
- generation placeholders
- retry behavior if practical

Avoid:
- ugly spinners
- layout jumps
- broken empty boxes

---

# 8. Visual Consistency

All imagery must match:
- existing visual overhaul
- dark codex/archive aesthetic
- restrained atmosphere

Avoid:
- bright startup aesthetics
- neon cyberpunk overload
- inconsistent styles

---

# 9. Documentation

Update:
- README.md
- MEMORY.md

Document:
- image generation behavior
- provider configuration
- fallback behavior
- known limitations

---

# Constraints

Do not:
- redesign backend architecture
- add auth
- add billing
- add multiplayer
- add complex asset pipelines
- add autonomous agents
- add background queues unless absolutely required

Preserve:
- onboarding flow
- retrieval pipeline
- streaming cognition systems
- Docker runtime
- current tests/builds

---

# Verification Requirements

Run and report:

```bash
docker compose up -d --build
npm run build
npm run typecheck
npm test
```

Manual verification:
- onboarding still works
- world generation still works
- banner generates
- portraits generate
- fallback behavior works without provider
- generated imagery persists
- layouts remain visually cohesive

---

# Success Criteria

- worlds gain strong visual identity
- characters feel memorable
- onboarding becomes emotionally impactful
- screenshots become dramatically stronger
- visual atmosphere improves substantially
- fallback behavior remains stable
- builds/tests remain green

---

# Final Deliverables

Provide:
- changed files
- image generation architecture summary
- provider configuration summary
- fallback behavior summary
- screenshots/checklist
- verification results
- remaining limitations