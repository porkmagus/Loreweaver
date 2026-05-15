import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

const PORT = Number(process.env.API_PORT ?? 3001);
const HOST = process.env.API_HOST ?? '0.0.0.0';

async function main() {
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  await app.register(healthRoutes, { prefix: '/api' });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message,
      code: 'INTERNAL_ERROR',
    });
  });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API listening at http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
