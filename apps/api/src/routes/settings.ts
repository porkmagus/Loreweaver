import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  ProviderConfigSchema,
  resolveProviderConfig,
  testProviderConnection,
  type ProviderConfig,
} from '../services/provider.js';

const SetProviderSchema = z.object({
  provider: ProviderConfigSchema.shape.provider,
  baseUrl: z.string().min(1),
  apiKey: z.string().optional(),
  chatModel: z.string().min(1),
  embeddingModel: z.string().optional(),
  imageModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

let runtimeProviderConfig: Partial<ProviderConfig> | null = null;

export function setRuntimeProviderConfig(config: Partial<ProviderConfig>) {
  runtimeProviderConfig = config;
}

export function getRuntimeProviderConfig(): Partial<ProviderConfig> | null {
  return runtimeProviderConfig;
}

export async function settingsRoutes(app: FastifyInstance) {
  app.get('/settings/provider', async (_request, reply) => {
    const env = resolveProviderConfig();
    reply.send({ data: env });
  });

  app.post('/settings/provider', async (request, reply) => {
    const parsed = SetProviderSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    setRuntimeProviderConfig(parsed.data);
    const merged = resolveProviderConfig(parsed.data);
    reply.send({ data: merged });
  });

  app.post('/settings/provider/test', async (request, reply) => {
    const parsed = SetProviderSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400).send({
        error: 'Invalid request body',
        code: 'VALIDATION_ERROR',
        details: parsed.error.flatten(),
      });
      return;
    }
    const merged = resolveProviderConfig(parsed.data);
    const status = await testProviderConnection(merged);
    reply.send({ data: status });
  });
}
