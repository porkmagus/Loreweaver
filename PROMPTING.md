# prompting.md

# PromptingDoctrine

Prompting priorities:
1.context relevance
2.output determinism
3.token efficiency
4.semantic clarity
5.retrieval quality

Avoid:
- oversized prompts
- conversational prompt drift
- unconstrained generations
- redundant context injection

Structured prompts outperform prompt chaos.

---

# PromptStructure

## [STANDARD]

Preferred template:

```txt
SYSTEM
CURRENT STATE
RELEVANT CONTEXT
MEMORY
CONSTRAINTS
TASK
EXPECTED OUTPUT
```

Goals:
- improve controllability
- improve retrieval relevance
- reduce hallucinations
- improve output consistency

---

# RetrievalRules

## [CTXDISC]

Prioritize retrieval in this order:

1.active session state
2.recent semantic memories
3.relevant lore/context
4.relationship state
5.timeline relevance
6.historical compressed summaries

Avoid:
- full-history injection
- repetitive retrievals
- oversized semantic payloads

Tight context>large context.

---

# TokenDiscipline

## [TOKENEFF]

Use:
- compressed summaries
- semantic memories
- short retrieval chunks
- explicit constraints

Avoid:
- verbose system prompts
- repeated instructions
- giant transcript dumps
- unnecessary context padding

Token efficiency improves:
- clarity
- determinism
- retrieval relevance
- generation quality

---

# StructuredOutputs

## [JSONDISC]

Whenever possible:
- require JSON outputs
- define explicit schemas
- validate before persistence

Preferred format:

```json
{
  "state_change": {},
  "memory_summary": "",
  "events": [],
  "metadata": {}
}
```

Never blindly trust model outputs.

---

# PromptPatterns

## [CHAT]

```txt
SYSTEM
Identity and behavioral constraints.

CURRENT STATE
Active runtime state.

MEMORY
Relevant semantic memories.

RETRIEVED CONTEXT
Relevant retrieved lore/data.

RELATIONSHIP STATE
Current persistent relationship values.

TASK
Generate response.

EXPECTED OUTPUT
Natural response text.
```

---

## [MEMORY_EXTRACTION]

```txt
Analyze interaction.

Extract:
- important events
- persistent changes
- emotional shifts
- relationship updates
- semantic memories

Return JSON only.
```

---

## [RELATIONSHIP_UPDATE]

```txt
Analyze conversation.

Determine:
- trust_delta
- respect_delta
- fear_delta
- affection_delta
- rivalry_delta

Return structured JSON.
```

---

## [SUMMARY_COMPRESSION]

```txt
Compress conversation into:
- semantic memory
- important events
- state transitions
- future relevance

Avoid unnecessary detail.
```

---

# MemoryCompression

## [MEMCOMP]

Long-term memory should become:
- summaries
- distilled state
- semantic embeddings
- compressed context

Avoid:
- raw transcript persistence
- infinite memory growth
- redundant memory duplication

---

# PromptBehavior

## [GENRULES]

Prompts should:
- be explicit
- minimize ambiguity
- reduce hidden assumptions
- constrain behavior clearly
- isolate tasks precisely

Avoid:
- vague objectives
- overloaded prompts
- mixed-task prompts
- contradictory instructions

---

# ValidationPipeline

## [VALIDATE]

Generation pipeline:

```txt
Retrieve
    ↓
Assemble Prompt
    ↓
Generate
    ↓
Validate
    ↓
Persist
```

Validation should check:
- schema compliance
- formatting correctness
- hallucinated structure
- invalid state transitions

---

# RetrievalOptimization

## [SEMSEARCH]

Semantic retrieval should prioritize:
- relevance
- recency
- relationship weighting
- contextual continuity

Avoid:
- quantity-first retrieval
- low-relevance chunk flooding
- unrelated historical injections

---

# PromptingPrinciples

Simple prompts scale better than prompt spaghetti.

Retrieval quality matters more than retrieval volume.

Structured outputs improve reliability.

Smaller prompts improve clarity.

Context discipline improves reasoning quality.

Deterministic prompts reduce debugging complexity.

---

# RuntimeMantra

Retrieve intentionally.
Prompt clearly.
Constrain aggressively.
Validate everything.
Compress intelligently.
Preserve clarity.
