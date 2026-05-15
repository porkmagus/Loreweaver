import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { loreEntries } from '../db/schema.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listLore(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(loreEntries).limit(limit).offset(offset);
}

export async function getLoreByWorldId(worldId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(loreEntries).where(eq(loreEntries.worldId, worldId)).limit(limit).offset(offset);
}

export async function getLoreById(id: number) {
  const [entry] = await db.select().from(loreEntries).where(eq(loreEntries.id, id)).limit(1);
  return entry ?? null;
}

export async function createLore(data: {
  worldId: number;
  title: string;
  content: string;
  category?: string;
  tags?: string;
}) {
  const [entry] = await db.insert(loreEntries).values({
    worldId: data.worldId,
    title: data.title,
    content: data.content,
    category: data.category ?? null,
    tags: data.tags ?? null,
  }).returning();
  return entry;
}
