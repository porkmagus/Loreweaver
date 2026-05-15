import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { characters, memories, timelineEvents } from '../db/schema.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listCharacters(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(characters).orderBy(characters.name).limit(limit).offset(offset);
}

export async function getCharacterById(id: number) {
  const result = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getCharacterTimeline(characterId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(timelineEvents)
    .where(eq(timelineEvents.characterId, characterId))
    .orderBy(desc(timelineEvents.happenedAt))
    .limit(limit).offset(offset);
}

export async function getCharacterMemories(characterId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(memories)
    .where(eq(memories.characterId, characterId))
    .orderBy(desc(memories.importance))
    .limit(limit).offset(offset);
}

export async function createCharacter(data: {
  worldId: number;
  name: string;
  description?: string;
  personality?: string;
  role?: string;
  isPlayer?: boolean;
}) {
  const [character] = await db.insert(characters).values({
    worldId: data.worldId,
    name: data.name,
    description: data.description ?? null,
    personality: data.personality ?? null,
    role: data.role ?? null,
    isPlayer: data.isPlayer ?? false,
  }).returning();
  return character;
}
