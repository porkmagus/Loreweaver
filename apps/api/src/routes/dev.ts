import type { FastifyInstance } from 'fastify';
import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';

const TABLES = [
  'chat_messages',
  'chat_sessions',
  'memories',
  'timeline_events',
  'relationships',
  'lore_entries',
  'characters',
  'worlds',
  'users',
] as const;

export async function devRoutes(app: FastifyInstance) {
  app.post('/dev/reset', async (_request, reply) => {
    if (process.env.NODE_ENV === 'production') {
      reply.status(403).send({ error: 'Reset disabled in production', code: 'FORBIDDEN' });
      return;
    }
    for (const table of TABLES) {
      try {
        await db.execute(sql`TRUNCATE TABLE ${sql.raw(table)} RESTART IDENTITY CASCADE`);
      } catch (err) {
        app.log.warn({ err, table }, 'Failed to truncate table');
      }
    }
    reply.send({ data: { reset: true, tables: TABLES } });
  });
}
