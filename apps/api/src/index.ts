import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { worldRoutes } from './routes/worlds.js';
import { characterRoutes } from './routes/characters.js';
import { loreRoutes } from './routes/lore.js';
import { timelineRoutes } from './routes/timeline.js';
import { relationshipRoutes } from './routes/relationships.js';
import { searchRoutes } from './routes/search.js';
import { chatRoutes } from './routes/chat.js';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.addHook('onRequest', async (request) => {
    request.log.info({
      reqId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'incoming request');
  });

  await app.register(healthRoutes, { prefix: '/api' });
  await app.register(worldRoutes, { prefix: '/api' });
  await app.register(characterRoutes, { prefix: '/api' });
  await app.register(loreRoutes, { prefix: '/api' });
  await app.register(timelineRoutes, { prefix: '/api' });
  await app.register(relationshipRoutes, { prefix: '/api' });
  await app.register(searchRoutes, { prefix: '/api' });
  await app.register(chatRoutes, { prefix: '/api' });

  app.setErrorHandler((error, _request, reply) => {
    const err = error instanceof Error ? error : new Error(String(error));
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500;
    const code = statusCode >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR';
    app.log.error({ err: error, statusCode }, 'request error');
    reply.status(statusCode).send({
      error: err.message,
      code,
    });
  });

  return app;
}

const PORT = Number(process.env.API_PORT ?? 3001);
const HOST = process.env.API_HOST ?? '0.0.0.0';

async function main() {
  const app = await buildApp();
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API listening at http://${HOST}:${PORT}`);
}

if (!process.env.VITEST) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
