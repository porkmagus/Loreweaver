import type { FastifyInstance } from 'fastify';
import { HealthResponseSchema } from '@loreweaver/shared';
import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL ?? 'http://localhost:6333';
const qdrantClient = new QdrantClient({ url: qdrantUrl });

const QDRANT_HEALTH_TIMEOUT_MS = 3000;

async function checkQdrant(): Promise<boolean> {
  try {
    await Promise.race([
      qdrantClient.getCollections(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('qdrant timeout')), QDRANT_HEALTH_TIMEOUT_MS)
      ),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (_request, reply) => {
    const qdrantOk = await checkQdrant();
    const openAiKey = !!process.env.OPENAI_API_KEY;
    const embeddingModel = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';

    const response = HealthResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      aiMode: openAiKey ? 'live' : 'simulated',
      qdrantConnected: qdrantOk,
      embeddingAvailable: openAiKey,
      embeddingModel,
    });
    reply.send(response);
  });
}
