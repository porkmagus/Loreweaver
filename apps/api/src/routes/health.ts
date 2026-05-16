import type { FastifyInstance } from 'fastify';
import { HealthResponseSchema } from '@loreweaver/shared';
import { QdrantClient } from '@qdrant/js-client-rest';
import { getEnvProviderConfig, testProviderConnection } from '../services/provider.js';
import { getEnvImageProviderConfig, testImageProviderConnection } from '../services/imageProvider.js';

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
    const providerConfig = getEnvProviderConfig();
    const live = Boolean(providerConfig.baseUrl && providerConfig.chatModel);
    const providerStatus = live ? await testProviderConnection(providerConfig) : null;

    const imageConfig = getEnvImageProviderConfig();
    const imageStatus = imageConfig.enabled
      ? await testImageProviderConnection(imageConfig)
      : { ok: true, provider: 'disabled', warning: 'Image generation disabled' };

    const response = HealthResponseSchema.parse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      aiMode: live ? 'live' : 'simulated',
      qdrantConnected: qdrantOk,
      embeddingAvailable: live,
      embeddingModel: providerConfig.embeddingModel,
      provider: providerConfig.provider,
      chatModel: providerConfig.chatModel,
      imageProvider: imageConfig.provider,
      imageModel: imageConfig.model,
      imageEnabled: imageConfig.enabled,
      imageStatus: imageStatus.ok ? 'connected' : 'unavailable',
    });
    reply.send(response);
  });

  app.get('/health/provider', async (_request, reply) => {
    const config = getEnvProviderConfig();
    const status = await testProviderConnection(config);
    reply.send({ data: status });
  });
}
