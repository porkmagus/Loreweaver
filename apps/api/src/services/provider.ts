import OpenAI from 'openai';
import { z } from 'zod';

export const ProviderTypeSchema = z.enum(['custom-openai', 'ollama', 'openrouter']);
export type ProviderType = z.infer<typeof ProviderTypeSchema>;

export const ProviderConfigSchema = z.object({
  provider: ProviderTypeSchema,
  baseUrl: z.string().optional(),
  apiKey: z.string().optional(),
  chatModel: z.string().min(1),
  embeddingModel: z.string().optional(),
  imageModel: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().optional(),
});

export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResult {
  content: string;
}

export interface ChatStreamChunk {
  content: string | null;
  done: boolean;
}

const ENV_PROVIDER = (process.env.AI_PROVIDER ?? 'custom-openai') as ProviderType;
const ENV_BASE_URL = process.env.AI_BASE_URL ?? process.env.OPENROUTER_BASE_URL ?? '';
const ENV_API_KEY = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY ?? '';
const ENV_CHAT_MODEL = process.env.AI_CHAT_MODEL ?? process.env.CHAT_MODEL ?? 'gpt-4o-mini';
const ENV_EMBEDDING_MODEL = process.env.AI_EMBEDDING_MODEL ?? process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
const ENV_IMAGE_MODEL = process.env.AI_IMAGE_MODEL ?? process.env.IMAGE_MODEL ?? '';
const ENV_TEMPERATURE = Number(process.env.AI_TEMPERATURE ?? 0.8);
const ENV_MAX_TOKENS = Number(process.env.AI_MAX_TOKENS ?? 800);

export function getEnvProviderConfig(): ProviderConfig {
  return {
    provider: ENV_PROVIDER,
    baseUrl: ENV_BASE_URL,
    apiKey: ENV_API_KEY || undefined,
    chatModel: ENV_CHAT_MODEL,
    embeddingModel: ENV_EMBEDDING_MODEL,
    imageModel: ENV_IMAGE_MODEL || undefined,
    temperature: ENV_TEMPERATURE,
    maxTokens: ENV_MAX_TOKENS,
  };
}

let runtimeProviderConfig: Partial<ProviderConfig> | null = null;

export function setRuntimeProviderConfig(config: Partial<ProviderConfig> | null) {
  runtimeProviderConfig = config;
}

export function getRuntimeProviderConfig(): Partial<ProviderConfig> | null {
  return runtimeProviderConfig;
}

function pickNonEmpty<T>(override: T | null | undefined | '', base: T | undefined): T | undefined {
  if (override === undefined || override === null) return base;
  return override as T;
}

function applyProviderDefaults(config: ProviderConfig): ProviderConfig {
  if (!config.baseUrl) {
    if (config.provider === 'ollama') config.baseUrl = 'http://localhost:11434';
    else if (config.provider === 'openrouter') config.baseUrl = 'https://openrouter.ai/api/v1';
  }
  return config;
}

export function resolveProviderConfig(override?: Partial<ProviderConfig>): ProviderConfig {
  const env = getEnvProviderConfig();
  const runtime = runtimeProviderConfig;
  const merged: ProviderConfig = runtime ? { ...env, ...runtime } : env;
  if (!override) return applyProviderDefaults(merged);
  const result: ProviderConfig = {
    provider: override.provider ?? merged.provider,
    baseUrl: pickNonEmpty(override.baseUrl, merged.baseUrl) ?? '',
    apiKey: pickNonEmpty(override.apiKey, merged.apiKey),
    chatModel: override.chatModel ?? merged.chatModel,
    embeddingModel: pickNonEmpty(override.embeddingModel, merged.embeddingModel),
    imageModel: pickNonEmpty(override.imageModel, merged.imageModel),
    temperature: override.temperature ?? merged.temperature,
    maxTokens: override.maxTokens ?? merged.maxTokens,
  };
  return applyProviderDefaults(result);
}

export function hasLiveProvider(cfg?: ProviderConfig): boolean {
  const config = cfg ?? resolveProviderConfig();
  return Boolean(config.chatModel);
}

let cachedOpenAIClient: { client: OpenAI; key: string } | null = null;

function getOpenAIClient(config: ProviderConfig): OpenAI | null {
  if (config.provider === 'ollama') return null;
  const apiKey = config.apiKey || 'dummy';
  const baseURL = config.baseUrl?.trim() || undefined;
  const key = `${apiKey}::${baseURL ?? ''}`;
  if (cachedOpenAIClient && cachedOpenAIClient.key === key) {
    return cachedOpenAIClient.client;
  }
  const client = new OpenAI({ apiKey, baseURL, dangerouslyAllowBrowser: false });
  cachedOpenAIClient = { client, key };
  return client;
}

export async function chatCompletion(
  config: ProviderConfig,
  messages: ChatMessage[],
): Promise<ChatCompletionResult> {
  if (config.provider === 'ollama') {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.chatModel,
        messages,
        stream: false,
        options: {
          temperature: config.temperature ?? 0.8,
          num_predict: config.maxTokens ?? 800,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { message?: { content?: string } };
    return { content: data.message?.content ?? '' };
  }

  const client = getOpenAIClient(config);
  if (!client) throw new Error('Provider client not available');

  const completion = await client.chat.completions.create({
    model: config.chatModel,
    messages,
    max_tokens: config.maxTokens ?? 800,
    temperature: config.temperature ?? 0.8,
  });
  return { content: completion.choices[0]?.message?.content ?? '' };
}

export async function* streamChatCompletion(
  config: ProviderConfig,
  messages: ChatMessage[],
): AsyncGenerator<ChatStreamChunk> {
  if (config.provider === 'ollama') {
    const res = await fetch(`${config.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.chatModel,
        messages,
        stream: true,
        options: {
          temperature: config.temperature ?? 0.8,
          num_predict: config.maxTokens ?? 800,
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Ollama stream failed: ${res.status} ${await res.text()}`);
    }
    if (!res.body) throw new Error('Ollama stream response missing body');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
          const content = chunk.message?.content ?? null;
          const doneFlag = chunk.done ?? false;
          yield { content, done: doneFlag };
        } catch {
          // ignore malformed lines
        }
      }
    }
    yield { content: null, done: true };
    return;
  }

  const client = getOpenAIClient(config);
  if (!client) throw new Error('Provider client not available');

  const stream = await client.chat.completions.create({
    model: config.chatModel,
    messages,
    max_tokens: config.maxTokens ?? 800,
    temperature: config.temperature ?? 0.8,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content ?? null;
    const finishReason = chunk.choices[0]?.finish_reason;
    yield { content, done: finishReason != null };
  }
  yield { content: null, done: true };
}

export async function testProviderConnection(config: ProviderConfig): Promise<{
  ok: boolean;
  provider: string;
  streaming: boolean;
  model?: string;
  error?: string;
}> {
  try {
    if (config.provider === 'ollama') {
      const tagsRes = await fetch(`${config.baseUrl}/api/tags`, { method: 'GET' });
      if (!tagsRes.ok) {
        const chatRes = await fetch(`${config.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: config.chatModel,
            messages: [{ role: 'user', content: 'hi' }],
            stream: false,
          }),
        });
        if (!chatRes.ok) {
          return { ok: false, provider: 'ollama', streaming: false, error: `Ollama unreachable: ${chatRes.status}` };
        }
        return { ok: true, provider: 'ollama', streaming: true, model: config.chatModel };
      }
      return { ok: true, provider: 'ollama', streaming: true, model: config.chatModel };
    }

    const client = getOpenAIClient(config);
    if (!client) {
      return { ok: false, provider: config.provider, streaming: false, error: 'Client not initialized' };
    }
    const completion = await client.chat.completions.create({
      model: config.chatModel,
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 5,
    });
    return {
      ok: true,
      provider: config.provider,
      streaming: true,
      model: completion.model ?? config.chatModel,
    };
  } catch (err) {
    return {
      ok: false,
      provider: config.provider,
      streaming: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
