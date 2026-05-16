import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CreateWorldSchema } from '../schemas/requests.js';
import { listWorlds, getWorldById, getWorldCharacters, createWorld, updateWorld, deleteWorld } from '../services/worldService.js';
import { getLoreByWorldId } from '../services/loreService.js';
import { listTimelineByWorldId } from '../services/timelineService.js';
import { generateWorldFromPrompt } from '../services/worldGenerationService.js';

const GenerateWorldSchema = z.object({
  prompt: z.string().min(1).max(2000),
});

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

  app.post('/worlds/generate', async (request, reply) => {
    const parsed = GenerateWorldSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    try {
      const result = await generateWorldFromPrompt(parsed.data.prompt);
      reply.status(201).send({ data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      app.log.error({ err }, 'World generation failed');
      reply.status(500).send({ error: message, code: 'GENERATION_ERROR' });
    }
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

  app.patch('/worlds/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const body = request.body as Record<string, unknown>;
    const world = await updateWorld(id, body);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: world });
  });

  app.delete('/worlds/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await deleteWorld(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    reply.status(204).send();
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

  app.get('/worlds/:id/lore', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await getWorldById(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await getLoreByWorldId(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/worlds/:id/timeline', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await getWorldById(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await listTimelineByWorldId(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.post('/worlds/:id/generate', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const world = await getWorldById(id);
    if (!world) {
      reply.status(404).send({ error: 'World not found', code: 'NOT_FOUND' });
      return;
    }
    const parsed = GenerateWorldSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    try {
      const result = await generateWorldFromPrompt(parsed.data.prompt);
      reply.status(201).send({ data: result });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      reply.status(500).send({ error: msg, code: 'GENERATION_ERROR' });
    }
  });
}
