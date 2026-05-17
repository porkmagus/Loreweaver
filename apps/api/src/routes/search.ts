import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { embedText } from '../services/embedding.js';
import { searchLore, ensureCollection } from '../services/qdrant.js';
import { getLoreByIds } from '../services/loreService.js';

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

      // Batch-fetch Postgres entries to validate existence (single round-trip)
      const loreIds = hits.map((h) => h.payload.loreEntryId);
      const entries = await getLoreByIds(loreIds);
      const entryMap = new Map(entries.map((e) => [e.id, e]));

      const enriched = hits.map((hit) => ({
        chunkIndex: hit.payload.chunkIndex,
        chunkText: hit.payload.chunkText,
        score: hit.score,
        loreEntryId: hit.payload.loreEntryId,
        title: hit.payload.title,
        entryExists: entryMap.has(hit.payload.loreEntryId),
      }));

      reply.send({ data: enriched });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Search failed',
        code: 'SEARCH_ERROR',
      });
    }
  });
}