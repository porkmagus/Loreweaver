# TASK.md

# Current Objective

Execute a Visual Identity Overhaul for Loreweaver.

The infrastructure, onboarding, retrieval pipeline, persistence systems, and MVP functionality are now established.

The app no longer needs major backend systems.

It now needs:
- visual identity
- atmosphere
- hierarchy
- immersion
- cohesion
- polish

The current UI is functional but visually generic.

This phase focuses on transforming Loreweaver from:
```txt
generic AI dashboard
```

into:
```txt
living narrative archive
```

This is NOT a complete product rewrite.

This is a focused visual design and frontend polish phase.

---

# Core Visual Direction

Target aesthetic:

```txt
Dark scholarly sci-fi fantasy
+
living codex
+
occult archive
+
high-end developer tool
```

Inspirations:
- Obsidian
- Disco Elysium UI
- illuminated manuscripts
- SCP archive aesthetics
- premium terminal/devtool interfaces
- dark archival systems

Avoid:
- generic SaaS dashboards
- Tailwind starter aesthetics
- bright startup gradients
- excessive glassmorphism
- gamer MMO UI
- neon cyberpunk overload
- over-animated interfaces

Atmosphere should feel:
- intelligent
- immersive
- mysterious
- restrained
- readable
- premium

---

# Required Work

## 1. Create VISUAL_DIRECTION.md

Create:

```txt
VISUAL_DIRECTION.md
```

Document:
- design philosophy
- typography rules
- spacing rules
- color palette
- component philosophy
- animation philosophy
- layout philosophy
- visual hierarchy rules
- icon usage rules
- inspirations
- anti-inspirations

This becomes the permanent visual doctrine file.

---

# 2. Typography Overhaul

Improve typography hierarchy across the app.

Goals:
- larger headings
- stronger visual hierarchy
- more breathing room
- less tiny text
- better readability
- stronger section separation

Preferred font direction:
- Inter
- Geist
- IBM Plex Sans

Optional display/accent font:
- Cormorant Garamond
- similar restrained serif

Do not use novelty fantasy fonts.

---

# 3. Color System Overhaul

Replace generic Tailwind-looking colors with a cohesive palette.

Preferred palette direction:

Base:
- deep charcoal
- warm slate
- near-black archival tones

Accents:
- muted gold
- dim cyan
- faded ember/crimson
- subtle silver

Avoid:
- oversaturated colors
- bright Tailwind defaults
- rainbow accents
- excessive gradients

Document palette in VISUAL_DIRECTION.md.

---

# 4. Layout & Spacing Overhaul

Reduce:
- card spam
- cramped layouts
- repetitive panels

Improve:
- spacing rhythm
- hierarchy
- asymmetry where appropriate
- visual flow
- readability

Pages should feel:
- intentional
- atmospheric
- calm
- navigable

Not:
```txt
analytics dashboard soup
```

---

# 5. Dashboard Redesign

Rework dashboard to feel:
- world-centric
- narrative-centric
- atmospheric

Reduce:
- generic stat tile energy

Increase:
- world identity
- visual hierarchy
- meaningful focal points

Dashboard should emphasize:
- worlds
- characters
- memories
- lore
- timeline activity

---

# 6. Sidebar & Navigation Polish

Improve:
- navigation hierarchy
- icon consistency
- spacing
- hover states
- active states

Navigation should feel:
- elegant
- restrained
- premium

Avoid:
- loud hover effects
- giant colored pills
- generic admin panel styling

---

# 7. Chat Interface Overhaul

The chat UI is one of the most important visual surfaces.

Improve:
- message readability
- spacing
- typography
- character identity
- contextual sidebar styling
- memory/timeline panel cohesion

Desired feeling:
```txt
conversation inside a living archive
```

Not:
```txt
Discord clone
```

---

# 8. World & Lore Pages

These should become:
- immersive
- archival
- codex-like

Improve:
- lore readability
- section hierarchy
- content density
- search presentation
- timeline readability

---

# 9. Motion & Atmosphere

Add restrained atmospheric polish.

Allowed:
- subtle fades
- subtle hover transitions
- soft glows
- restrained motion
- elegant loading states

Avoid:
- excessive animation
- motion sickness
- glowing neon effects
- large parallax systems
- over-engineered animation frameworks

Subtlety > spectacle.

---

# 10. Empty State & Status Polish

All empty states should feel intentional.

Improve:
- copywriting
- spacing
- icon treatment
- atmospheric consistency

Health/status indicators should feel integrated into the visual language.

---

# 11. Accessibility & Readability

Preserve:
- readable contrast
- accessible font sizing
- usable spacing
- keyboard usability

Do not sacrifice usability for atmosphere.

---

# 12. Screenshot Worthiness

Every major page should now look:
- screenshot-worthy
- portfolio-worthy
- memorable

Priority pages:
- onboarding
- dashboard
- world overview
- lore search
- character chat
- relationship/timeline sidebar

---

# Constraints

Do not:
- rewrite backend architecture
- add major new systems
- add auth
- add billing
- add multiplayer
- add voice
- add heavy animation libraries
- redesign routing/data flow
- replace core frontend stack

Preserve:
- current functionality
- onboarding flow
- retrieval pipeline
- chat flow
- passing tests
- Docker-first runtime

---

# Verification Requirements

Run and report:
- npm run build
- npm run typecheck
- npm test

Verify:
- onboarding still works
- world generation still works
- lore ingestion still works
- chat still works
- sidebar updates still work
- layout responsive behavior still works

---

# Success Criteria

- app has clear visual identity
- UI no longer feels generic
- typography feels premium
- layouts feel intentional
- dashboard feels narrative-centric
- chat feels immersive
- lore pages feel archival
- screenshots feel portfolio-worthy
- atmosphere improved without sacrificing usability
- functionality preserved
- tests/builds remain green

---

# Final Deliverables

Provide:
- VISUAL_DIRECTION.md
- changed files summary
- before/after design summary
- screenshots or screenshot checklist
- remaining visual weaknesses
- recommendations for future polish phases