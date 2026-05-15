import type { FastifyInstance } from 'fastify';
import { CreateLoreSchema } from '../schemas/requests.js';
import { listLore, getLoreByWorldId, getLoreById, createLore } from '../services/loreService.js';
import { ingestLore } from '../services/ingestService.js';

export async function loreRoutes(app: FastifyInstance) {
  app.get('/lore', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const results = await listLore({
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/lore/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const entry = await getLoreById(id);
    if (!entry) {
      reply.status(404).send({ error: 'Lore entry not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: entry });
  });

  app.post('/lore', async (request, reply) => {
    const parsed = CreateLoreSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    const entry = await createLore(parsed.data);
    reply.status(201).send({ data: entry });
  });

  app.post('/lore/:id/ingest', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    try {
      const result = await ingestLore(id);
      reply.send({ data: result });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Ingest failed',
        code: 'INGEST_ERROR',
      });
    }
  });

  app.get('/lore/world/:worldId', async (request, reply) => {
    const worldId = Number((request.params as { worldId: string }).worldId);
    const q = request.query as Record<string, string>;
    const results = await getLoreByWorldId(worldId, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });
}
