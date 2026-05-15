import { chunkText } from './chunker.js';
import { embedTexts } from './embedding.js';
import { upsertChunks, ensureCollection } from './qdrant.js';
import { getLoreById } from './loreService.js';

export async function ingestLore(loreEntryId: number) {
  const entry = await getLoreById(loreEntryId);
  if (!entry) {
    throw new Error('Lore entry not found');
  }

  await ensureCollection();
  const chunks = chunkText(entry.content);
  if (chunks.length === 0) {
    throw new Error('No chunks produced from lore content');
  }

  const embeddings = await embedTexts(chunks.map((c) => c.text));

  await upsertChunks(
    chunks.map((c, i) => ({
      chunkIndex: c.index,
      vector: embeddings[i],
      payload: {
        loreEntryId: entry.id,
        worldId: entry.worldId,
        title: entry.title,
        chunkIndex: c.index,
        chunkText: c.text,
      },
    })),
  );

  return { entryId: entry.id, chunks: chunks.length };
}