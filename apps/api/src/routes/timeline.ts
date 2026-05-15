import type { FastifyInstance } from 'fastify';
import { listTimelineEvents, listTimelineByCharacter, createTimelineEvent } from '../services/timelineService.js';
import { getCharacterById } from '../services/characterService.js';

export async function timelineRoutes(app: FastifyInstance) {
  app.get('/timeline', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const results = await listTimelineEvents({
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/timeline/character/:characterId', async (request, reply) => {
    const characterId = Number((request.params as { characterId: string }).characterId);
    const character = await getCharacterById(characterId);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    const q = request.query as Record<string, string>;
    const results = await listTimelineByCharacter(characterId, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.post('/timeline', async (request, reply) => {
    const body = request.body as Record<string, unknown>;
    const parsed = {
      characterId: body.characterId ? Number(body.characterId) : 0,
      title: String(body.title ?? ''),
      description: body.description ? String(body.description) : null,
      eventType: String(body.eventType ?? ''),
      happenedAt: String(body.happenedAt ?? ''),
      significance: body.significance ? Number(body.significance) : null,
    };
    if (!parsed.title || !parsed.eventType || !parsed.happenedAt || !parsed.characterId) {
      reply.status(400).send({ error: 'Missing required fields: title, eventType, happenedAt, characterId', code: 'VALIDATION_ERROR' });
      return;
    }
    const entry = await createTimelineEvent(parsed);
    reply.status(201).send({ data: entry });
  });
}
