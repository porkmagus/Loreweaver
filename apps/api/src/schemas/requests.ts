import { z } from 'zod';

export const CreateWorldSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  genre: z.string().max(100).optional(),
});

export type CreateWorldInput = z.infer<typeof CreateWorldSchema>;

export const CreateCharacterSchema = z.object({
  worldId: z.number().int().positive(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  personality: z.string().optional(),
  role: z.string().max(100).optional(),
  isPlayer: z.boolean().optional(),
});

export type CreateCharacterInput = z.infer<typeof CreateCharacterSchema>;

export const CreateLoreSchema = z.object({
  worldId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  category: z.string().max(100).optional(),
  tags: z.string().optional(),
});

export type CreateLoreInput = z.infer<typeof CreateLoreSchema>;
