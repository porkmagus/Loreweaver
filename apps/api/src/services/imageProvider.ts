import { z } from 'zod';
import OpenAI from 'openai';
import type { ImageProviderConfig, ImageProviderStatus, ImageProviderType } from '@loreweaver/shared';

export const ImageProviderTypeSchema = z.enum(['openai-image', 'custom-image-endpoint', 'disabled']);

export const ImageProviderConfigSchema = z.object({
  provider: ImageProviderTypeSchema,
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  size: z.string().optional(),
  quality: z.string().optional(),
  format: z.string().optional(),
  enabled: z.boolean().optional().default(true),
});

export type ImageProviderConfigInput = z.infer<typeof ImageProviderConfigSchema>;

// Environment defaults
const CUSTOM_ENDPOINT_TIMEOUT_MS = Number(process.env.IMAGE_GENERATION_TIMEOUT_MS ?? 20_000);
const ENV_PROVIDER = (process.env.IMAGE_PROVIDER ?? 'disabled') as ImageProviderType;
const ENV_BASE_URL = process.env.IMAGE_BASE_URL ?? '';
const ENV_API_KEY = process.env.IMAGE_API_KEY ?? process.env.OPENAI_API_KEY ?? '';
const ENV_MODEL = process.env.IMAGE_MODEL ?? 'gpt-image-2';
const ENV_SIZE = process.env.IMAGE_SIZE ?? '';
const ENV_QUALITY = process.env.IMAGE_QUALITY ?? 'low';
const ENV_FORMAT = process.env.IMAGE_FORMAT ?? 'webp';
const ENV_ENABLED = process.env.IMAGE_GENERATION_ENABLED !== 'false';

export function getEnvImageProviderConfig(): ImageProviderConfig {
  return {
    provider: ENV_PROVIDER,
    baseUrl: ENV_BASE_URL,
    apiKey: ENV_API_KEY,
    model: ENV_MODEL || undefined,
    size: ENV_SIZE || undefined,
    quality: ENV_QUALITY || undefined,
    format: ENV_FORMAT || undefined,
    enabled: ENV_ENABLED,
  };
}

let runtimeImageProviderConfig: Partial<ImageProviderConfig> | null = null;

export function setRuntimeImageProviderConfig(config: Partial<ImageProviderConfig> | null) {
  runtimeImageProviderConfig = config;
}

export function getRuntimeImageProviderConfig(): Partial<ImageProviderConfig> | null {
  return runtimeImageProviderConfig;
}

function pickNonEmpty<T>(override: T | null | undefined | '', base: T | undefined): T | undefined {
  if (override === undefined || override === null) return base;
  return override as T;
}

export function resolveImageProviderConfig(override?: Partial<ImageProviderConfig>): ImageProviderConfig {
  const env = getEnvImageProviderConfig();
  const runtime = runtimeImageProviderConfig;
  const base = runtime ? { ...env, ...runtime } : env;
  if (!override) return base;
  return {
    provider: override.provider ?? base.provider,
    baseUrl: pickNonEmpty(override.baseUrl, base.baseUrl),
    apiKey: pickNonEmpty(override.apiKey, base.apiKey),
    model: pickNonEmpty(override.model, base.model),
    size: pickNonEmpty(override.size, base.size),
    quality: pickNonEmpty(override.quality, base.quality),
    format: pickNonEmpty(override.format, base.format),
    enabled: override.enabled ?? base.enabled,
  };
}

function getOpenAIImageClient(config: ImageProviderConfig): OpenAI | null {
  if (config.provider === 'disabled') return null;
  const apiKey = config.apiKey || 'dummy';
  const baseURL = config.provider === 'custom-image-endpoint' && config.baseUrl
    ? config.baseUrl
    : undefined; // official OpenAI default
  return new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: false, timeout: 300_000 });
}

export interface GenerateImageInput {
  prompt: string;
  size: '1024x1024' | '1536x1024';
  n?: number;
}

export interface GenerateImageResult {
  imageUrl: string | null;
  model: string;
  error?: string;
}

export async function generateImage(
  config: ImageProviderConfig,
  input: GenerateImageInput,
): Promise<GenerateImageResult> {
  if (!config.enabled || config.provider === 'disabled') {
    return { imageUrl: null, model: config.model ?? 'none', error: 'image generation disabled' };
  }

  if (config.provider === 'custom-image-endpoint') {
    // OpenAI-compatible proxy via fetch
    const base = (config.baseUrl ?? 'http://localhost:1234/v1').replace(/\/$/, '');
    const url = `${base}/images/generations`;
    const res = await fetch(url, {
      method: 'POST',
      signal: AbortSignal.timeout(CUSTOM_ENDPOINT_TIMEOUT_MS),
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: config.model ?? 'gpt-image-2',
        prompt: input.prompt,
        size: input.size,
        n: input.n ?? 1,
        quality: config.quality ?? 'low',
        output_format: config.format ?? 'webp',
        background: 'opaque',
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error');
      return { imageUrl: null, model: config.model ?? 'custom', error: `Custom endpoint error ${res.status}: ${text}` };
    }
    const data = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const image = data.data?.[0];
    const imageUrl = image?.b64_json
      ? `data:image/${config.format ?? 'webp'};base64,${image.b64_json}`
      : image?.url ?? null;
    if (!imageUrl) {
      return { imageUrl: null, model: config.model ?? 'custom', error: 'Custom endpoint returned no image data' };
    }
    return { imageUrl, model: config.model ?? 'custom' };
  }

  // Official OpenAI image generation
  const client = getOpenAIImageClient(config);
  if (!client) {
    return { imageUrl: null, model: config.model ?? 'openai', error: 'OpenAI image client not initialized' };
  }

  try {
    const response = await client.images.generate({
      model: config.model ?? 'gpt-image-2',
      prompt: input.prompt,
      size: input.size,
      n: input.n ?? 1,
      quality: (config.quality ?? 'low') as 'low' | 'medium' | 'high' | 'auto',
      output_format: (config.format ?? 'webp') as 'webp' | 'png' | 'jpeg' | null | undefined,
      background: 'opaque',
    });

    const image = response.data?.[0];
    const imageUrl = image?.b64_json
      ? `data:image/${config.format ?? 'webp'};base64,${image.b64_json}`
      : image?.url ?? null;

    if (!imageUrl) {
      return { imageUrl: null, model: config.model ?? 'openai', error: 'OpenAI returned no image data' };
    }
    return { imageUrl, model: config.model ?? 'openai' };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return { imageUrl: null, model: config.model ?? 'openai', error: reason };
  }
}

export async function testImageProviderConnection(config: ImageProviderConfig): Promise<ImageProviderStatus> {
  if (!config.enabled || config.provider === 'disabled') {
    return { ok: true, provider: 'disabled', warning: 'Image generation is disabled. Fallback assets will be used.' };
  }

  if (config.provider === 'custom-image-endpoint') {
    if (!config.baseUrl) {
      return { ok: false, provider: 'custom-image-endpoint', error: 'Base URL is required for custom image endpoint' };
    }
    // Non-generating validation: attempt a lightweight models list or simple GET if available
    // Many proxies expose /v1/models; fall back to a minimal generation with a tiny prompt
    const base = config.baseUrl.replace(/\/$/, '');
    try {
      const modelsRes = await fetch(`${base}/models`, {
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
      });
      if (modelsRes.ok) {
        return { ok: true, provider: 'custom-image-endpoint', model: config.model, warning: 'Endpoint reachable. Generation not validated (cost-safe test).' };
      }
      // Fallback: tiny prompt test with explicit warning
      return {
        ok: false,
        provider: 'custom-image-endpoint',
        model: config.model,
        error: 'Endpoint did not respond to models probe. Run a manual generation test to confirm.',
        warning: 'Manual generation may incur cost.',
      };
    } catch (err) {
      return {
        ok: false,
        provider: 'custom-image-endpoint',
        model: config.model,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Official OpenAI: validate key via a lightweight models list call
  const client = getOpenAIImageClient(config);
  if (!client) {
    return { ok: false, provider: 'openai-image', error: 'OpenAI client not initialized (missing API key?)' };
  }

  try {
    const models = await client.models.list();
    const hasImageModel = models.data.some((m) => m.id === (config.model ?? 'gpt-image-2'));
    if (hasImageModel) {
      return { ok: true, provider: 'openai-image', model: config.model };
    }
    return {
      ok: true,
      provider: 'openai-image',
      model: config.model,
      warning: 'API key valid, but configured image model not found in available models list.',
    };
  } catch (err) {
    return {
      ok: false,
      provider: 'openai-image',
      model: config.model,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
