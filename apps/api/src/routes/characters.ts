import type { FastifyInstance } from 'fastify';
import { CreateCharacterSchema } from '../schemas/requests.js';
import { listCharacters, getCharacterById, getCharacterTimeline, getCharacterMemories, createCharacter, updateCharacter, deleteCharacter } from '../services/characterService.js';
import { getRelationshipsForCharacter } from '../services/relationshipService.js';

export async function characterRoutes(app: FastifyInstance) {
  app.get('/characters', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const results = await listCharacters({
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/characters/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const character = await getCharacterById(id);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: character });
  });

  app.post('/characters', async (request, reply) => {
    const parsed = CreateCharacterSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    const character = await createCharacter(parsed.data);
    reply.status(201).send({ data: character });
  });

  app.patch('/characters/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const body = request.body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if ('name' in body) updates.name = String(body.name);
    if ('description' in body) updates.description = body.description === undefined ? null : String(body.description);
    if ('personality' in body) updates.personality = body.personality === undefined ? null : String(body.personality);
    if ('role' in body) updates.role = body.role === undefined ? null : String(body.role);
    if ('isPlayer' in body) updates.isPlayer = Boolean(body.isPlayer);

    const character = await updateCharacter(id, updates);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    reply.send({ data: character });
  });

  app.delete('/characters/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const character = await deleteCharacter(id);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    reply.status(204).send();
  });

  app.get('/characters/:id/timeline', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const character = await getCharacterById(id);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await getCharacterTimeline(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/characters/:id/memories', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const character = await getCharacterById(id);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await getCharacterMemories(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/characters/:id/relationships', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const character = await getCharacterById(id);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await getRelationshipsForCharacter(id, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });
}
