import OpenAI from 'openai';
import { createHash } from 'crypto';
import { resolveProviderConfig } from './provider.js';

const dimension = Number(process.env.EMBEDDING_DIMENSION ?? 1536);

function getEmbeddingClient(): { client: OpenAI | null; apiKey: string | undefined; model: string; baseUrl: string } {
  const cfg = resolveProviderConfig();
  const apiKey = cfg.apiKey ?? process.env.OPENAI_API_KEY;
  const model = cfg.embeddingModel ?? process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
  const baseUrl = cfg.baseUrl;
  const client = apiKey && baseUrl ? new OpenAI({ apiKey, baseURL: baseUrl }) : null;
  return { client, apiKey, model, baseUrl };
}

function deterministicVector(text: string, dim: number): number[] {
  const hash = createHash('sha256').update(text).digest();
  const vec: number[] = [];
  for (let i = 0; i < dim; i++) {
    vec.push((hash[i % hash.length] / 255) * 2 - 1);
  }
  return vec;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const { client, apiKey, model } = getEmbeddingClient();
  if (!client || !apiKey) {
    return texts.map((t) => deterministicVector(t, dimension));
  }
  const response = await client.embeddings.create({
    model,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}

export async function embedText(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text]);
  return vec;
}
