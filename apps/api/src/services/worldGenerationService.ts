import { createWorld, updateWorld } from './worldService.js';
import { createCharacter, updateCharacter } from './characterService.js';
import { createLore } from './loreService.js';
import { createTimelineEvent } from './timelineService.js';
import { createRelationship } from './relationshipService.js';
import { ingestLore } from './ingestService.js';
import { generateCharacterPortrait, generateWorldBanner, type VisualMetadata } from './imageGenerationService.js';
import {
  chatCompletion,
  resolveProviderConfig,
  hasLiveProvider,
  getEnvProviderConfig,
} from './provider.js';

interface GeneratedWorld {
  name: string;
  description: string;
  genre: string;
  characters: Array<{
    name: string;
    description: string;
    personality: string;
    role: string;
    isPlayer: boolean;
  }>;
  lore: Array<{
    title: string;
    content: string;
    category: string;
    tags: string;
  }>;
  timeline: Array<{
    title: string;
    description: string;
    eventType: string;
    significance: number;
    happenedAt: string; // ISO date
  }>;
  relationships: Array<{
    fromIndex: number;
    toIndex: number;
    trust: number;
    respect: number;
    affection: number;
    rivalry: number;
    fear: number;
    alignment: number;
    notes: string;
  }>;
}

function sanitizeDate(d: string | undefined): string {
  if (!d) return new Date().toISOString();
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const SYSTEM_PROMPT = `SYSTEM
You are a worldbuilding assistant for a narrative RPG system called Loreweaver.

CURRENT STATE
The user has provided a short text prompt describing a world they want to create.

CONSTRAINTS
- Output MUST be valid JSON with no markdown formatting, no code fences, no extra commentary.
- The JSON must match the exact structure below.
- Provide 2–4 characters, 2–4 lore entries, and 2–4 timeline events.
- Dates can be fictional but must be valid ISO-8601 strings (e.g., "1024-06-15T00:00:00Z").
- Relationship fromIndex/toIndex reference the zero-based index in the characters array.
- Trust/respect/affection/rivalry/fear/alignment must be numbers between 0.0 and 1.0.
- Significance must be an integer between 1 and 5.
- Keep descriptions concise (1–3 sentences). Keep lore content to 2–4 sentences.

EXPECTED OUTPUT STRUCTURE
{
  "name": "string",
  "description": "string",
  "genre": "string",
  "characters": [
    {
      "name": "string",
      "description": "string",
      "personality": "string",
      "role": "string",
      "isPlayer": false
    }
  ],
  "lore": [
    {
      "title": "string",
      "content": "string",
      "category": "string",
      "tags": "string"
    }
  ],
  "timeline": [
    {
      "title": "string",
      "description": "string",
      "eventType": "string",
      "significance": 1,
      "happenedAt": "1024-06-15T00:00:00Z"
    }
  ],
  "relationships": [
    {
      "fromIndex": 0,
      "toIndex": 1,
      "trust": 0.5,
      "respect": 0.5,
      "affection": 0.0,
      "rivalry": 0.0,
      "fear": 0.0,
      "alignment": 0.5,
      "notes": "string"
    }
  ]
}`;

function buildUserPrompt(userPrompt: string): string {
  return `TASK
Generate a complete world from this prompt. Return only the JSON object described in the system instructions.

USER PROMPT
${userPrompt}`;
}

function extractJson(text: string): string {
  // Try markdown code fences first
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find first { and last } to extract a JSON object
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.slice(start, end + 1);
  }

  return text.trim();
}

function deterministicWorld(prompt: string): GeneratedWorld {
  // Deterministic fallback: hash the prompt to pick from a small palette
  const hash = Array.from(prompt).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palettes = [
    {
      name: 'Aethelgard',
      genre: 'fantasy',
      description: 'A medieval fantasy kingdom of court intrigue, ancient ruins, and simmering rebellion.',
      characters: [
        { name: 'Lady Seraphina Blackwood', description: 'The youngest daughter of a disgraced noble house, trained as a spymaster by the Wraithwood elders.', personality: 'Calculating, fiercely loyal, dry sense of humor.', role: 'spymaster', isPlayer: false },
        { name: 'Sergeant Aldric Vane', description: 'A grizzled veteran of the Shattered Coast campaigns, now assigned as palace guard captain.', personality: 'Direct, honorable to a fault, prone to drinking when memories surface.', role: 'guard captain', isPlayer: false },
      ],
      lore: [
        { title: 'The Wraithwood', content: 'An ancient forest to the north of Aethelgard where the old orders still practice their arts. Few who enter alone return unchanged.', category: 'geography', tags: 'forest,magic,north' },
        { title: 'The Salt March', content: 'In 2016, commoners marched on the capital to protest salt taxes. The official record calls it a riot; survivors call it a massacre.', category: 'history', tags: 'history,politics,atrocity' },
      ],
      timeline: [
        { title: 'Salt March Cover-Up', description: 'The royal council ordered the guard to disperse protesters. The truth was buried.', eventType: 'trauma', significance: 5, happenedAt: '2016-09-22T00:00:00Z' },
        { title: 'Recruited by the Wraithwood Circle', description: 'Seraphina was taken into the Wraithwood by the shadow-walker Maren after her father\'s execution.', eventType: 'training', significance: 4, happenedAt: '2008-03-15T00:00:00Z' },
      ],
      relationships: [
        { fromIndex: 0, toIndex: 1, trust: 0.72, respect: 0.65, affection: 0.31, rivalry: 0.15, fear: 0.08, alignment: 0.58, notes: 'They share a mutual understanding born of witnessing the same atrocities during the Salt March cover-up.' },
      ],
    },
    {
      name: 'Nexus-7 Station',
      genre: 'sci-fi',
      description: 'A derelict orbital research station drifting at the edge of a quarantined star system.',
      characters: [
        { name: 'Dr. Elara Voss', description: 'A xenobiologist who stayed behind when the evacuation order came. She believes the organism in Lab 4 is sentient.', personality: 'Obsessive, brilliant, morally flexible when science is at stake.', role: 'scientist', isPlayer: false },
        { name: 'Unit 734', description: 'A repurposed security drone with fragmented memories of its original programming.', personality: 'Literal, protective, occasionally poetic about starlight.', role: 'security', isPlayer: false },
      ],
      lore: [
        { title: 'The Quarantine', content: 'Nexus-7 was abandoned after a classified organism breached containment. No ship has docked in eighteen months.', category: 'history', tags: 'quarantine,containment,station' },
        { title: 'Lab 4', content: 'The deepest laboratory houses the organism known only as Subject Theta. It grows through bulkheads and hums at frequencies that disrupt sleep.', category: 'science', tags: 'biology,containment,theta' },
      ],
      timeline: [
        { title: 'Containment Breach', description: 'Subject Theta escaped Lab 4. Forty-three crew members were evacuated. Four remained.', eventType: 'disaster', significance: 5, happenedAt: '2247-11-03T00:00:00Z' },
        { title: 'Dr. Voss\'s Discovery', description: 'Elara decoded patterns in Theta\'s emissions. They match the structure of an ancient lost language.', eventType: 'discovery', significance: 4, happenedAt: '2248-02-17T00:00:00Z' },
      ],
      relationships: [
        { fromIndex: 0, toIndex: 1, trust: 0.55, respect: 0.80, affection: 0.20, rivalry: 0.05, fear: 0.40, alignment: 0.60, notes: 'Elara rebuilt 734 from scrap after the breach. The drone does not fully trust her motivations but follows her commands.' },
      ],
    },
  ];

  const palette = palettes[hash % palettes.length];
  return {
    name: `${palette.name}`,
    description: palette.description,
    genre: palette.genre,
    characters: palette.characters,
    lore: palette.lore,
    timeline: palette.timeline,
    relationships: palette.relationships,
  };
}

async function callLLM(prompt: string): Promise<GeneratedWorld> {
  if (!hasLiveProvider()) {
    throw new Error('AI provider not available');
  }

  const baseConfig = resolveProviderConfig();
  // World generation needs significantly more tokens than chat (full JSON world output)
  const config = { ...baseConfig, maxTokens: 8192 };

  const completion = await chatCompletion(config, [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(prompt) },
  ]);

  const raw = completion.content.trim();
  if (!raw) {
    throw new Error('Empty LLM response');
  }

  const jsonText = extractJson(raw);

  let parsed: GeneratedWorld;
  try {
    parsed = JSON.parse(jsonText) as GeneratedWorld;
  } catch (err) {
    throw new Error(
      `Failed to parse LLM response as JSON: ${err instanceof Error ? err.message : String(err)}. ` +
      `Raw preview (first 800 chars): ${raw.slice(0, 800)}`
    );
  }

  // Sanitize
  parsed.characters = (parsed.characters ?? []).map((c) => ({
    ...c,
    isPlayer: !!c.isPlayer,
  }));
  parsed.timeline = (parsed.timeline ?? []).map((t) => ({
    ...t,
    significance: clamp(t.significance, 1, 5),
    happenedAt: sanitizeDate(t.happenedAt),
  }));
  parsed.relationships = (parsed.relationships ?? []).map((r) => ({
    ...r,
    trust: clamp(r.trust, 0, 1),
    respect: clamp(r.respect, 0, 1),
    affection: clamp(r.affection, 0, 1),
    rivalry: clamp(r.rivalry, 0, 1),
    fear: clamp(r.fear, 0, 1),
    alignment: clamp(r.alignment, 0, 1),
  }));

  return parsed;
}

export async function generateWorldFromPrompt(userPrompt: string): Promise<{ worldId: number; name: string }> {
  let generated: GeneratedWorld;

  if (hasLiveProvider()) {
    try {
      generated = await callLLM(userPrompt);
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      console.error('[world-generation] LLM call failed, using deterministic fallback:', reason);
      generated = deterministicWorld(userPrompt);
    }
  } else {
    generated = deterministicWorld(userPrompt);
  }

  const world = await createWorld({
    name: generated.name,
    description: generated.description,
    genre: generated.genre,
  });

  const bannerTask = generateWorldBanner({
    name: generated.name,
    description: generated.description,
    genre: generated.genre,
    themes: [
      ...generated.lore.map((l) => l.title),
      ...generated.timeline.map((t) => t.title),
    ].slice(0, 6),
  }).then((banner) => updateWorld(world.id, {
    metadata: {
      visual: { banner },
    } satisfies VisualMetadata,
  }));

  const characterIds: number[] = [];
  for (const c of generated.characters) {
    const char = await createCharacter({
      worldId: world.id,
      name: c.name,
      description: c.description,
      personality: c.personality,
      role: c.role,
      isPlayer: c.isPlayer,
    });
    characterIds.push(char.id);
  }

  // Generate character portraits sequentially with a small delay to avoid rate limits
  const characterVisualTasks: Array<Promise<unknown>> = [];
  for (let i = 0; i < generated.characters.length; i++) {
    const c = generated.characters[i];
    const charId = characterIds[i];
    if (i > 0) {
      await new Promise((r) => setTimeout(r, 15_000)); // 15s stagger to stay under OpenAI 5 img/min rate limit
    }
    characterVisualTasks.push(
      generateCharacterPortrait({
        worldName: generated.name,
        worldGenre: generated.genre,
        worldDescription: generated.description,
        name: c.name,
        description: c.description,
        personality: c.personality,
        role: c.role,
      }).then((portrait) => updateCharacter(charId, {
        metadata: {
          visual: { portrait },
        } satisfies VisualMetadata,
      }))
    );
  }

  const createdLoreIds: number[] = [];
  for (const l of generated.lore) {
    const loreEntry = await createLore({
      worldId: world.id,
      title: l.title,
      content: l.content,
      category: l.category,
      tags: l.tags,
    });
    createdLoreIds.push(loreEntry.id);
  }

  // Async ingest into vector store (best-effort)
  for (const loreId of createdLoreIds) {
    ingestLore(loreId).catch(() => { /* silent fail; health page shows ingest status */ });
  }

  for (const t of generated.timeline) {
    const characterId = characterIds.length > 0 ? characterIds[0] : undefined;
    if (characterId == null) continue;
    await createTimelineEvent({
      characterId,
      title: t.title,
      description: t.description,
      eventType: t.eventType,
      significance: t.significance,
      happenedAt: new Date(t.happenedAt),
    });
  }

  for (const r of generated.relationships) {
    const fromId = characterIds[r.fromIndex];
    const toId = characterIds[r.toIndex];
    if (fromId == null || toId == null) continue;
    await createRelationship({
      fromCharacterId: fromId,
      toCharacterId: toId,
      trust: r.trust,
      respect: r.respect,
      affection: r.affection,
      rivalry: r.rivalry,
      fear: r.fear,
      alignment: r.alignment,
      notes: r.notes,
    });
  }

  await Promise.allSettled([bannerTask, ...characterVisualTasks]);

  return { worldId: world.id, name: world.name };
}
