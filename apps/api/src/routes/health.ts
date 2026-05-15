import type { FastifyInstance } from 'fastify';
import { HealthResponseSchema } from '@loreweaver/shared';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    const response = HealthResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.0.1',
    });
    reply.send(response);
  });
}
