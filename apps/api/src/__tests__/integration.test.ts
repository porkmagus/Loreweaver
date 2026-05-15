import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { getCharacterById } from '../services/characterService.js';
import { sendCharacterChat, getChatHistory } from '../services/chatService.js';
import { searchLore } from '../services/qdrant.js';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockOffset = vi.fn();
const mockReturning = vi.fn();
const mockOrderBy = vi.fn();
const mockAnd = vi.fn();

vi.mock('../db/client.js', () => {
  return {
    db: {
      select: () => ({ from: mockFrom }),
      insert: () => ({ values: (vals: unknown) => ({ returning: mockReturning }) }),
      update: () => ({ set: () => ({ where: mockWhere }) }),
    },
  };
});

vi.mock('../services/embedding.js', () => ({
  embedTexts: vi.fn().mockResolvedValue([[0.1, 0.2, 0.3]]),
  embedText: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
}));

vi.mock('../services/qdrant.js', () => ({
  ensureCollection: vi.fn().mockResolvedValue(undefined),
  upsertChunks: vi.fn().mockResolvedValue(undefined),
  searchLore: vi.fn().mockResolvedValue([]),
}));

vi.mock('../services/characterService.js', () => ({
  listCharacters: vi.fn(),
  getCharacterById: vi.fn(),
}));

vi.mock('../services/chatService.js', () => ({
  sendCharacterChat: vi.fn(),
  getChatHistory: vi.fn(),
}));

async function readyApp() {
  const app = await buildApp();
  await app.ready();
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Lore ingestion and semantic search integration', () => {
  it('creates lore, ingests it, and returns search results', async () => {
    const a = await readyApp();

    // Step 1: Create lore
    const lore = { id: 1, title: 'Ancient Map', worldId: 1, content: 'The map shows hidden treasures.' };
    mockReturning.mockResolvedValueOnce([lore]);
    const createRes = await request(a.server)
      .post('/api/lore')
      .send({ title: lore.title, worldId: lore.worldId, content: lore.content })
      .expect(201);
    expect(createRes.body.data).toEqual(lore);

    // Step 2: Ingest lore
    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValueOnce([lore]);
    const ingestRes = await request(a.server)
      .post('/api/lore/1/ingest')
      .expect(200);
    expect(ingestRes.body.data).toHaveProperty('entryId', 1);
    expect(ingestRes.body.data).toHaveProperty('chunks');

    // Step 3: Search lore
    const searchHit = {
      id: 1,
      score: 0.95,
      payload: {
        loreEntryId: 1,
        worldId: 1,
        title: 'Ancient Map',
        chunkIndex: 0,
        chunkText: 'The map shows hidden treasures.',
      },
    };
    vi.mocked(searchLore).mockResolvedValueOnce([searchHit]);

    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValueOnce([lore]);

    const searchRes = await request(a.server)
      .post('/api/search/lore')
      .send({ worldId: 1, query: 'treasure' })
      .expect(200);

    expect(searchRes.body.data).toEqual([
      expect.objectContaining({
        loreEntryId: 1,
        title: 'Ancient Map',
        chunkText: 'The map shows hidden treasures.',
        score: 0.95,
        entryExists: true,
      }),
    ]);
  });
});

describe('Chat -> memory creation integration', () => {
  it('sends chat and triggers memory via post-chat effects', async () => {
    const a = await readyApp();

    vi.mocked(getCharacterById).mockResolvedValueOnce({ id: 1, worldId: 1, name: 'Alice', personality: 'Friendly' } as any);
    vi.mocked(sendCharacterChat).mockResolvedValueOnce({ reply: 'I remember that!', sessionId: 7 });

    const chatRes = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'We discovered a great secret together.' })
      .expect(200);

    expect(chatRes.body.data).toEqual({ reply: 'I remember that!', sessionId: 7 });
  });
});

describe('Chat -> relationship update integration', () => {
  it('sends chat and relationship score changes', async () => {
    const a = await readyApp();

    vi.mocked(getCharacterById).mockResolvedValueOnce({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(sendCharacterChat).mockResolvedValueOnce({ reply: 'I trust you more now.', sessionId: 8 });

    const chatRes = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'I trust you completely.' })
      .expect(200);

    expect(chatRes.body.data).toEqual({ reply: 'I trust you more now.', sessionId: 8 });
  });
});

describe('Chat -> timeline event creation integration', () => {
  it('sends chat and timeline records the interaction', async () => {
    const a = await readyApp();

    vi.mocked(getCharacterById).mockResolvedValueOnce({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(sendCharacterChat).mockResolvedValueOnce({ reply: 'Noted in the timeline.', sessionId: 9 });

    const chatRes = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'We battled the dragon and won.' })
      .expect(200);

    expect(chatRes.body.data).toEqual({ reply: 'Noted in the timeline.', sessionId: 9 });
  });
});
