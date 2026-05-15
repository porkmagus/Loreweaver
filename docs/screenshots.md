# Screenshot Guide

A checklist for capturing portfolio-quality screenshots of Loreweaver.

---

# Prerequisites

1. Stack running with seed data: `docker compose up -d` + `cd apps/api && npx tsx src/seed/index.ts`
2. Browser at `http://localhost:5173`
3. DevTools console clear (no red errors)
4. Viewport: 1440x900 or 1920x1080 for crisp captures

---

# Screenshot Checklist

| # | Screen | Description | Notes |
|---|---|---|---|
| 1 | **Dashboard** | World cards with character counts | Show at least 2 worlds; ensure cards are well-spaced |
| 2 | **World Overview** | Selected world with character list and lore count | Include sidebar nav visible |
| 3 | **Character Profile** | Character card + bio + traits + role | Pick a character with rich data (e.g., Eldrin Moonwhisper) |
| 4 | **Lore List** | Table of lore entries with category and tags | Show "Indexed" status badges |
| 5 | **Lore Upload / Create** | New lore entry form | Fill with sample content; show validation |
| 6 | **Semantic Search** | Search input + ranked results | Query: `shattered crown`; show scores |
| 7 | **Chat - Grounded Response** | User question + character reply referencing lore | Highlight the lore reference in the reply |
| 8 | **Chat - Loading State** | Spinner or skeleton while generating | Capture mid-request |
| 9 | **Relationships Panel** | Character-to-character axes (trust, respect, etc.) | Show numerical values and change indicators |
| 10 | **Timeline Panel** | Chronological events with significance | Include at least 3 events |
| 11 | **Memory Panel** | Persisted memories with importance scores | Show active + inactive memories |
| 12 | **Mobile Responsive** | Dashboard on 375x812 viewport | Verify readable cards and nav |
| 13 | **API Health** | `curl` output or browser dev tools showing 200 on `/api/health` | Optional technical screenshot |

---

# Capture Tips

- Use browser devtools device toolbar for consistent viewport sizing
- Hide scrollbars if possible (macOS: overlay scrollbars; Linux: custom CSS or screenshot tool crop)
- Capture PNG for crisp text; JPG is acceptable for large composites
- Store screenshots in `docs/screenshots/` or repository wiki
- Name files descriptively: `01-dashboard.png`, `07-chat-lore-response.png`

---

# Placeholder References

If screenshots are not yet captured, insert these placeholders in README or portfolio:

```markdown
![Dashboard](docs/screenshots/01-dashboard.png)
*Dashboard showing active worlds and character counts.*

![Character Profile](docs/screenshots/03-character-profile.png)
*Character profile with relationships, timeline, and memories.*

![Chat with Lore](docs/screenshots/07-chat-lore-response.png)
*Character responding with lore-grounded context.*
```

---

# README Integration

Add a `Screenshots` section to `README.md` after `Quick Start`:

```markdown
# Screenshots

> Screenshots are captured at 1440x900. See `docs/screenshots.md` for the full capture guide.

![Dashboard](docs/screenshots/01-dashboard.png)

![Character Profile](docs/screenshots/03-character-profile.png)

![Chat](docs/screenshots/07-chat-lore-response.png)
```
