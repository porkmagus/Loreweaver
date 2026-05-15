# Demo Script

A complete walkthrough for demonstrating Loreweaver end-to-end.

---

# Prerequisites

1. Stack running: `docker compose up -d`
2. Seed data loaded (optional): `cd apps/api && npx tsx src/seed/index.ts`
3. OpenAI API key configured in `.env`

---

# Step-by-Step

## 1. Start the app

```bash
docker compose up -d
cd apps/api && npx tsx src/seed/index.ts
```

Verify:
```bash
curl -s http://localhost:3001/api/health
# Expected: {"status":"ok"}
```

## 2. Open the dashboard

Navigate to `http://localhost:5173`.

Observe:
- World cards displayed
- Character count per world
- Status indicators for services

## 3. Open a world

Click a world card (e.g., "Wraithwood").

Observe:
- World overview panel
- Character list with avatars
- Lore entry count

## 4. Open a character

Click a character (e.g., "Eldrin Moonwhisper").

Observe:
- Character profile with bio, traits, role
- Relationship panel (if other characters exist)
- Timeline panel with past events
- Memory panel with persisted memories

## 5. Add lore

Navigate to `Lore` tab. Click `New Lore Entry`.

Fill:
- Title: `The Fall of the Obsidian Tower`
- Content: `A towering obsidian fortress once stood on the edge of Wraithwood. It fell in a single night when the Shattered Crown was cast down.`
- Category: `History`
- Tags: `tower, obsidian, shattered crown`

Submit. Observe the entry appears in the lore list.

## 6. Ingest lore

Click `Ingest` on the new lore entry.

Observe:
- Ingest button shows loading state
- On success, status updates to `Indexed`

Verify via API:
```bash
curl -s http://localhost:3001/api/search/lore -X POST -H "Content-Type: application/json" -d '{"query":"obsidian tower","worldId":2}'
# Expected: array of chunks with scores and entryExists: true
```

## 7. Ask character about lore

Navigate to `Chat` tab. Ensure the same world and character are selected.

Send: `Do you know about the Obsidian Tower?`

Observe:
- Character responds referencing the lore
- Reply contains specific detail: "It fell in a single night"
- Loading state shown while generating

## 8. Show relationship update

After chat response, look at the `Relationships` panel (or send another message that might trigger a relationship change).

Observe:
- Relationship axis values may shift slightly (trust, respect, affection)
- Values are bounded between -100 and 100
- Changes are keyword-driven heuristics

## 9. Show timeline event

After chat, check the `Timeline` panel.

Observe:
- A new event may appear (e.g., `Discussed: obsidian tower`)
- Events have significance rating and timestamp

## 10. Show memory persistence

Check the `Memories` panel.

Observe:
- A new memory may appear summarizing the conversation
- Memory has importance score and `is_active` flag

## 11. Refresh the page

Press `F5` or navigate away and back.

Observe:
- Chat history persists
- Character state unchanged
- Relationships, timeline, memories still present

## 12. Start a new session and verify continuity

Open a new browser tab. Select the same world and character.

Send: `What did we talk about before?`

Observe:
- Character may reference previous conversation topics
- Continuity is maintained via session + memory retrieval

## 13. Search lore semantically

Navigate to `Lore` tab. Use the search input.

Query: `shattered crown`

Observe:
- Search results include the Obsidian Tower entry
- Results ranked by semantic similarity
- Score displayed per result

## 14. Verify API endpoints directly

```bash
# List worlds
curl -s http://localhost:3001/api/worlds

# List characters in world 2
curl -s http://localhost:3001/api/worlds/2/characters

# Get character memories
curl -s http://localhost:3001/api/characters/1/memories

# Get character timeline
curl -s http://localhost:3001/api/characters/1/timeline

# Get relationships
curl -s http://localhost:3001/api/characters/1/relationships
```

All should return valid JSON arrays.

## 15. Shut down cleanly

```bash
cd ../..
docker compose down
```

Observe:
- All containers stop
- Data persists in Docker volumes (available on next `up`)

---

# Known Limitations (MVP)

- Relationship/timeline/memory panels refetch after chat with a short delay to allow backend writes to complete. Future improvement: return updated context panel payload directly from chat response.
- Relationship scoring is keyword-based heuristic, not semantic or LLM-driven.
- Timeline deduplication uses a 5-minute window by title; may miss genuinely new similar events.
- No user authentication; multi-user separation is manual.
- No streaming chat; responses are synchronous.
