import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL ?? 'http://localhost:6333';
const collectionName = process.env.QDRANT_COLLECTION ?? 'lore_chunks';
const vectorDim = Number(process.env.EMBEDDING_DIMENSION ?? 1536);

const client = new QdrantClient({ url: qdrantUrl });

let collectionChecked = false;

export async function ensureCollection(): Promise<void> {
  if (collectionChecked) return;
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === collectionName);
  if (exists) {
    collectionChecked = true;
    return;
  }

  await client.createCollection(collectionName, {
    vectors: {
      size: vectorDim,
      distance: 'Cosine',
    },
  });

  await client.createPayloadIndex(collectionName, {
    field_name: 'worldId',
    field_schema: 'integer',
  });

  await client.createPayloadIndex(collectionName, {
    field_name: 'loreEntryId',
    field_schema: 'integer',
  });

  collectionChecked = true;
}

export interface LoreChunkPayload {
  loreEntryId: number;
  worldId: number;
  title: string;
  chunkIndex: number;
  chunkText: string;
}

export interface UpsertChunk {
  chunkIndex: number;
  vector: number[];
  payload: LoreChunkPayload;
}

export async function upsertChunks(chunks: UpsertChunk[]): Promise<void> {
  if (chunks.length === 0) return;
  const points = chunks.map((c) => {
    if (typeof c.payload.loreEntryId !== 'number' || typeof c.payload.worldId !== 'number') {
      throw new Error(`Invalid Qdrant chunk payload: missing loreEntryId or worldId for chunk ${c.chunkIndex}`);
    }
    return {
      id: deterministicId(c.payload.loreEntryId, c.chunkIndex),
      vector: c.vector,
      payload: (c.payload as unknown) as Record<string, unknown>,
    };
  });
  await client.upsert(collectionName, { points, wait: true });
}

export interface SearchHit {
  id: number;
  score: number;
  payload: LoreChunkPayload;
}

export async function searchLore(
  worldId: number,
  vector: number[],
  limit = 10,
): Promise<SearchHit[]> {
  const result = await client.search(collectionName, {
    vector,
    limit,
    filter: {
      must: [{ key: 'worldId', match: { value: worldId } }],
    },
    with_payload: true,
    with_vector: false,
  });

  return result.map((r) => {
    const payload = r.payload as unknown as LoreChunkPayload;
    if (typeof payload.loreEntryId !== 'number' || typeof payload.worldId !== 'number') {
      throw new Error(`Qdrant search returned malformed payload: ${JSON.stringify(r.payload)}`);
    }
    return {
      id: r.id as number,
      score: r.score,
      payload,
    };
  });
}

function deterministicId(loreEntryId: number, chunkIndex: number): number {
  return loreEntryId * 10000 + chunkIndex;
}
