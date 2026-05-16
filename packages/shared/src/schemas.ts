import { z } from 'zod';

// Health
export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  version: z.string(),
  aiMode: z.enum(['live', 'simulated']).optional(),
  qdrantConnected: z.boolean().optional(),
  embeddingAvailable: z.boolean().optional(),
  embeddingModel: z.string().optional(),
  provider: z.string().optional(),
  chatModel: z.string().optional(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// API envelope
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Entity schemas (mirror DB shapes for shared frontend/backend contracts)
export const WorldSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  genre: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type World = z.infer<typeof WorldSchema>;

export const CharacterSchema = z.object({
  id: z.number(),
  worldId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  personality: z.string().nullable(),
  role: z.string().nullable(),
  isPlayer: z.boolean(),
  metadata: z.record(z.unknown()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Character = z.infer<typeof CharacterSchema>;

export const LoreEntrySchema = z.object({
  id: z.number(),
  worldId: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string().nullable(),
  tags: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type LoreEntry = z.infer<typeof LoreEntrySchema>;

export const TimelineEventSchema = z.object({
  id: z.number(),
  characterId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  eventType: z.string(),
  significance: z.number(),
  happenedAt: z.string(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

export const RelationshipSchema = z.object({
  id: z.number(),
  fromCharacterId: z.number(),
  toCharacterId: z.number(),
  trust: z.number(),
  respect: z.number(),
  affection: z.number(),
  rivalry: z.number(),
  fear: z.number(),
  alignment: z.number(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Relationship = z.infer<typeof RelationshipSchema>;

export const MemorySchema = z.object({
  id: z.number(),
  characterId: z.number(),
  content: z.string(),
  importance: z.number(),
  isActive: z.boolean(),
  metadata: z.record(z.unknown()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Memory = z.infer<typeof MemorySchema>;

// API response envelopes
export const ApiItemResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ data: dataSchema });

export const ApiListResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({ data: z.array(itemSchema) });
