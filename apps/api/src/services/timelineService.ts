import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { timelineEvents, characters } from '../db/schema.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listTimelineEvents(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(timelineEvents).orderBy(desc(timelineEvents.happenedAt)).limit(limit).offset(offset);
}

export async function listTimelineByCharacter(characterId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(timelineEvents)
    .where(eq(timelineEvents.characterId, characterId))
    .orderBy(desc(timelineEvents.happenedAt))
    .limit(limit).offset(offset);
}

export async function listTimelineByWorldId(worldId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select({
    id: timelineEvents.id,
    characterId: timelineEvents.characterId,
    title: timelineEvents.title,
    description: timelineEvents.description,
    eventType: timelineEvents.eventType,
    significance: timelineEvents.significance,
    happenedAt: timelineEvents.happenedAt,
    metadata: timelineEvents.metadata,
    createdAt: timelineEvents.createdAt,
  })
    .from(timelineEvents)
    .innerJoin(characters, eq(timelineEvents.characterId, characters.id))
    .where(eq(characters.worldId, worldId))
    .orderBy(desc(timelineEvents.happenedAt))
    .limit(limit).offset(offset);
}

export async function createTimelineEvent(data: {
  characterId: number;
  title: string;
  description?: string | null;
  eventType: string;
  happenedAt: Date | string;
  significance?: number | null;
}) {
  const row: {
    characterId: number;
    title: string;
    description: string | null;
    eventType: string;
    happenedAt: Date;
    significance?: number;
  } = {
    characterId: data.characterId,
    title: data.title,
    description: data.description ?? null,
    eventType: data.eventType,
    happenedAt: typeof data.happenedAt === 'string' ? new Date(data.happenedAt) : data.happenedAt,
  };
  if (data.significance != null) {
    row.significance = data.significance;
  }
  const [result] = await db.insert(timelineEvents).values(row).returning();
  return result;
}
