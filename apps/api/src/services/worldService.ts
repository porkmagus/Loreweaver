import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { worlds, characters } from '../db/schema.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listWorlds(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(worlds).limit(limit).offset(offset);
}

export async function getWorldById(id: number) {
  const result = await db.select().from(worlds).where(eq(worlds.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getWorldCharacters(worldId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(characters).where(eq(characters.worldId, worldId)).limit(limit).offset(offset);
}

export async function createWorld(data: { name: string; description?: string; genre?: string }) {
  const [world] = await db.insert(worlds).values({
    name: data.name,
    description: data.description ?? null,
    genre: data.genre ?? null,
  }).returning();
  return world;
}
