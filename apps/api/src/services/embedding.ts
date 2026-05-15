import OpenAI from 'openai';
import { createHash } from 'crypto';

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small';
const dimension = Number(process.env.EMBEDDING_DIMENSION ?? 1536);

const client = apiKey ? new OpenAI({ apiKey }) : null;

function deterministicVector(text: string, dim: number): number[] {
  const hash = createHash('sha256').update(text).digest();
  const vec: number[] = [];
  for (let i = 0; i < dim; i++) {
    vec.push((hash[i % hash.length] / 255) * 2 - 1);
  }
  return vec;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
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