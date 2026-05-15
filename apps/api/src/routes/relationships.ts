import type { FastifyInstance } from 'fastify';
import { listRelationships, getRelationshipsForCharacter } from '../services/relationshipService.js';
import { getCharacterById } from '../services/characterService.js';

export async function relationshipRoutes(app: FastifyInstance) {
  app.get('/relationships', async (request, reply) => {
    const q = request.query as Record<string, string>;
    const results = await listRelationships({
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });

  app.get('/relationships/character/:characterId', async (request, reply) => {
    const characterId = Number((request.params as { characterId: string }).characterId);
    const q = request.query as Record<string, string>;
    const character = await getCharacterById(characterId);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    const results = await getRelationshipsForCharacter(characterId, {
      limit: q.limit ? Number(q.limit) : undefined,
      offset: q.offset ? Number(q.offset) : undefined,
    });
    reply.send({ data: results });
  });
}
