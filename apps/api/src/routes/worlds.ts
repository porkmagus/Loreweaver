import type { FastifyInstance } from 'fastify';
import { CreateWorldSchema } from '../schemas/requests.js';
import { listWorlds, getWorldById, getWorldCharacters, createWorld } from '../services/worldService.js';

export async function worldRoutes(app: FastifyInstance) {
  app.get('/worlds', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const results = await listWorlds({
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.post('/worlds', async (request, reply) => {
    const parsed = CreateWorldSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    const world = await createWorld(parsed.data);
    reply.status(201).send({ data: world });
  });

  app.get('/worlds/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await getWorldById(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: world });
  });

  app.get('/worlds/:id/characters', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await getWorldById(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await getWorldCharacters(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });
}
