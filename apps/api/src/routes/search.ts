import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { embedText } from '../services/embedding.js';
import { searchLore, ensureCollection } from '../services/qdrant.js';
import { getLoreById } from '../services/loreService.js';

const SearchLoreSchema = z.object({
  worldId: z.number().int().positive(),
  query: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
});

export async function searchRoutes(app: FastifyInstance) {
  app.post('/search/lore', async (request, reply) => {
    const parsed = SearchLoreSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }

    const { worldId, query, limit } = parsed.data;

    try {
      await ensureCollection();
      const vector = await embedText(query);
      const hits = await searchLore(worldId, vector, limit ?? 10);

      // Map hits back to Postgres entries to validate existence
      const enriched = await Promise.all(
        hits.map(async (hit) => {
          const entry = await getLoreById(hit.payload.loreEntryId);
          return {
            chunkIndex: hit.payload.chunkIndex,
            chunkText: hit.payload.chunkText,
            score: hit.score,
            loreEntryId: hit.payload.loreEntryId,
            title: hit.payload.title,
            entryExists: !!entry,
          };
        }),
      );

      reply.send({ data: enriched });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Search failed',
        code: 'SEARCH_ERROR',
      });
    }
  });
}