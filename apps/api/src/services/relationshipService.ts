import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { relationships } from '../db/schema.js';
import type { RelationshipDelta } from '../utils/chatScoring.js';
import { clampScore } from '../utils/chatScoring.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export async function listRelationships(opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(relationships).orderBy(desc(relationships.createdAt)).limit(limit).offset(offset);
}

export async function getRelationshipsForCharacter(characterId: number, opts?: { limit?: number; offset?: number }) {
  const limit = Math.min(opts?.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = opts?.offset ?? 0;
  return db.select().from(relationships)
    .where(eq(relationships.fromCharacterId, characterId))
    .limit(limit).offset(offset);
}

export async function getRelationshipBetween(fromCharacterId: number, toCharacterId: number) {
  const result = await db.select().from(relationships)
    .where(eq(relationships.fromCharacterId, fromCharacterId))
    .limit(MAX_LIMIT);
  return result.find((r) => r.toCharacterId === toCharacterId) ?? null;
}

export async function getOrCreateRelationship(data: {
  fromCharacterId: number;
  toCharacterId: number;
  trust?: number;
  respect?: number;
  affection?: number;
  rivalry?: number;
  fear?: number;
  alignment?: number;
  notes?: string;
}) {
  const existing = await getRelationshipBetween(data.fromCharacterId, data.toCharacterId);
  if (existing) return existing;
  return createRelationship(data);
}

export async function createRelationship(data: {
  fromCharacterId: number;
  toCharacterId: number;
  trust?: number;
  respect?: number;
  affection?: number;
  rivalry?: number;
  fear?: number;
  alignment?: number;
  notes?: string;
}) {
  const [rel] = await db.insert(relationships).values({
    fromCharacterId: data.fromCharacterId,
    toCharacterId: data.toCharacterId,
    trust: data.trust ?? 0,
    respect: data.respect ?? 0,
    affection: data.affection ?? 0,
    rivalry: data.rivalry ?? 0,
    fear: data.fear ?? 0,
    alignment: data.alignment ?? 0,
    notes: data.notes ?? null,
  }).returning();
  return rel;
}

export async function updateRelationship(
  id: number,
  data: Partial<{
    trust: number;
    respect: number;
    affection: number;
    rivalry: number;
    fear: number;
    alignment: number;
    notes: string;
  }>,
) {
  const [rel] = await db.update(relationships).set(data).where(eq(relationships.id, id)).returning();
  return rel ?? null;
}

export async function updateRelationshipScores(
  id: number,
  delta: RelationshipDelta,
) {
  const existing = await db.select().from(relationships).where(eq(relationships.id, id)).limit(1);
  const rel = existing[0];
  if (!rel) return null;
  const updated = await db.update(relationships)
    .set({
      trust: clampScore((rel.trust ?? 0) + delta.trust),
      respect: clampScore((rel.respect ?? 0) + delta.respect),
      affection: clampScore((rel.affection ?? 0) + delta.affection),
      rivalry: clampScore((rel.rivalry ?? 0) + delta.rivalry),
      fear: clampScore((rel.fear ?? 0) + delta.fear),
      alignment: clampScore((rel.alignment ?? 0) + delta.alignment),
      updatedAt: new Date(),
    })
    .where(eq(relationships.id, id))
    .returning();
  return updated[0] ?? null;
}

export async function deleteRelationship(id: number) {
  await db.delete(relationships).where(eq(relationships.id, id));
}
