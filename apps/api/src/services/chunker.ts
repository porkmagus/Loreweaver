export interface Chunk {
  text: string;
  index: number;
}

const MAX_CHUNK_LEN = 1500;
const MIN_CHUNK_LEN = 100;

export function chunkText(text: string): Chunk[] {
  if (!text || text.length < MIN_CHUNK_LEN) {
    return text ? [{ text, index: 0 }] : [];
  }

  // Split by double newlines (paragraphs) first, then single newlines
  const paragraphs = text.split(/\n\n+/).flatMap((p) => p.split(/\n+/));

  const chunks: Chunk[] = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= MAX_CHUNK_LEN) {
      current = current ? `${current}\n${trimmed}` : trimmed;
      continue;
    }

    if (current) {
      chunks.push({ text: current, index: chunks.length });
    }

    // If a single paragraph exceeds MAX_CHUNK_LEN, split by sentences
    if (trimmed.length > MAX_CHUNK_LEN) {
      const sentences = trimmed.split(/(?<=[.!?])\s+/);
      current = '';
      for (const sentence of sentences) {
        if (current.length + sentence.length + 1 <= MAX_CHUNK_LEN) {
          current = current ? `${current} ${sentence}` : sentence;
        } else {
          if (current) chunks.push({ text: current, index: chunks.length });
          current = sentence;
        }
      }
    } else {
      current = trimmed;
    }
  }

  if (current) {
    chunks.push({ text: current, index: chunks.length });
  }

  // Merge trailing tiny chunks into previous chunk
  const result: Chunk[] = [];
  for (const c of chunks) {
    if (result.length === 0) {
      result.push(c);
      continue;
    }
    const last = result[result.length - 1];
    if (c.text.length < MIN_CHUNK_LEN && last.text.length + c.text.length + 1 <= MAX_CHUNK_LEN) {
      result[result.length - 1] = {
        text: `${last.text}\n${c.text}`,
        index: last.index,
      };
    } else {
      result.push({ text: c.text, index: result.length });
    }
  }

  return result;
}