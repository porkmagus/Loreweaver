import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendCharacterChat, getChatHistory, getChatSessionSummary } from '../services/chatService.js';
import { getCharacterById } from '../services/characterService.js';

const ChatMessageSchema = z.object({
  worldId: z.number().int().positive(),
  message: z.string().min(1).max(4000),
  sessionId: z.number().int().positive().optional(),
  userId: z.number().int().positive().optional(),
});

export async function chatRoutes(app: FastifyInstance) {
  app.post('/chat/character/:characterId', async (request, reply) => {
    const characterId = Number((request.params as Record<string, string>).characterId);
    if (!Number.isFinite(characterId) || characterId <= 0) {
      reply.status(400).send({ error: 'Invalid characterId', code: 'VALIDATION_ERROR' });
      return;
    }

    const parsed = ChatMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }

    const { worldId, message, sessionId, userId } = parsed.data;

    const character = await getCharacterById(characterId);
    if (!character) {
      reply.status(404).send({ error: 'Character not found', code: 'NOT_FOUND' });
      return;
    }
    if (character.worldId !== worldId) {
      reply.status(400).send({ error: 'Character does not belong to world', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const result = await sendCharacterChat(characterId, worldId, message, sessionId ?? null, userId ?? null);
      reply.status(200).send({ data: result });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Chat failed',
        code: 'CHAT_ERROR',
      });
    }
  });

  app.get('/chat/character/:characterId/history', async (request, reply) => {
    const characterId = Number((request.params as Record<string, string>).characterId);
    const sessionId = Number((request.query as Record<string, string>).sessionId);

    if (!Number.isFinite(characterId) || characterId <= 0) {
      reply.status(400).send({ error: 'Invalid characterId', code: 'VALIDATION_ERROR' });
      return;
    }
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      reply.status(400).send({ error: 'Missing or invalid sessionId', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const history = await getChatHistory(sessionId);
      reply.send({ data: history });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to fetch history',
        code: 'HISTORY_ERROR',
      });
    }
  });

  app.get('/chat/session/:sessionId/summary', async (request, reply) => {
    const sessionId = Number((request.params as Record<string, string>).sessionId);
    if (!Number.isFinite(sessionId) || sessionId <= 0) {
      reply.status(400).send({ error: 'Invalid sessionId', code: 'VALIDATION_ERROR' });
      return;
    }

    try {
      const summary = await getChatSessionSummary(sessionId);
      reply.send({ data: summary });
    } catch (err) {
      reply.status(500).send({
        error: err instanceof Error ? err.message : 'Failed to fetch session summary',
        code: 'SUMMARY_ERROR',
      });
    }
  });
}
