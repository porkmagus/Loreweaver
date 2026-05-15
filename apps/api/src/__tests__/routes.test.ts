import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { buildApp } from '../index.js';
import { listCharacters, getCharacterById } from '../services/characterService.js';
import { sendCharacterChat, getChatHistory } from '../services/chatService.js';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();
const mockOffset = vi.fn();
const mockReturning = vi.fn();
const mockOrderBy = vi.fn();

vi.mock('../db/client.js', () => {
  return {
    db: {
      select: () => ({ from: mockFrom }),
      insert: () => ({ values: (vals: unknown) => ({ returning: mockReturning }) }),
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

describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const a = await readyApp();
    const res = await request(a.server)
      .get('/api/health')
      .expect(200);
    expect(res.body).toHaveProperty('status');
  });
});

describe('GET /api/worlds', () => {
  it('lists worlds', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ limit: mockLimit, offset: mockOffset });
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOffset.mockResolvedValue([{ id: 1, name: 'Azeroth' }]);
    const res = await request(a.server)
      .get('/api/worlds')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, name: 'Azeroth' }]);
  });
});

describe('POST /api/worlds', () => {
  it('creates a world', async () => {
    const a = await readyApp();
    const created = { id: 2, name: 'Westeros' };
    mockReturning.mockResolvedValue([created]);
    const res = await request(a.server)
      .post('/api/worlds')
      .send({ name: 'Westeros' })
      .expect(201);
    expect(res.body.data).toEqual(created);
  });
});

describe('GET /api/characters', () => {
  it('lists characters', async () => {
    const a = await readyApp();
    vi.mocked(listCharacters).mockResolvedValue([{ id: 1, name: 'Aragorn', worldId: 1 } as any]);
    const res = await request(a.server)
      .get('/api/characters?worldId=1')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, name: 'Aragorn', worldId: 1 }]);
  });
});

describe('GET /api/lore', () => {
  it('lists lore entries', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit, offset: mockOffset });
    mockWhere.mockReturnValue({ limit: mockLimit, offset: mockOffset });
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOffset.mockResolvedValue([{ id: 1, title: 'Prophecy', worldId: 1 }]);
    const res = await request(a.server)
      .get('/api/lore?worldId=1')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, title: 'Prophecy', worldId: 1 }]);
  });
});

describe('GET /api/lore/:id', () => {
  it('returns a lore entry', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([{ id: 3, title: 'Ancient Map', worldId: 1, content: '...' }]);
    const res = await request(a.server)
      .get('/api/lore/3')
      .expect(200);
    expect(res.body.data.id).toBe(3);
  });

  it('returns 404 for missing entry', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);
    const res = await request(a.server)
      .get('/api/lore/999')
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/lore/:id/ingest', () => {
  it('ingests lore chunks', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ where: mockWhere, limit: mockLimit });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([{ id: 1, worldId: 1, title: 'T', content: 'Hello world. This is content.' }]);
    const res = await request(a.server)
      .post('/api/lore/1/ingest')
      .expect(200);
    expect(res.body.data).toHaveProperty('entryId', 1);
    expect(res.body.data).toHaveProperty('chunks');
  });
});

describe('GET /api/timeline', () => {
  it('lists timeline events', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ where: mockWhere, orderBy: mockOrderBy, limit: mockLimit, offset: mockOffset });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit, offset: mockOffset });
    mockOrderBy.mockReturnValue({ limit: mockLimit, offset: mockOffset });
    mockLimit.mockReturnValue({ offset: mockOffset });
    mockOffset.mockResolvedValue([{ id: 1, title: 'Battle', characterId: 1 }]);
    const res = await request(a.server)
      .get('/api/timeline?characterId=1')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, title: 'Battle', characterId: 1 }]);
  });
});

describe('POST /api/timeline', () => {
  it('creates a timeline event', async () => {
    const a = await readyApp();
    const created = { id: 2, title: 'Siege', characterId: 1 };
    mockReturning.mockResolvedValue([created]);
    const res = await request(a.server)
      .post('/api/timeline')
      .send({
        characterId: 1,
        title: 'Siege',
        eventType: 'battle',
        happenedAt: '2024-01-01T00:00:00Z',
      })
      .expect(201);
    expect(res.body.data).toEqual(created);
  });
});

describe('POST /api/chat/character/:id', () => {
  it('returns 400 for invalid characterId', async () => {
    const a = await readyApp();
    const res = await request(a.server)
      .post('/api/chat/character/abc')
      .send({ worldId: 1, message: 'hello' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when character not found', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue(null as any);
    const res = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'hello' })
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('returns 400 when character world mismatch', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 2, name: 'Alice' } as any);
    const res = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'hello' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('sends a chat message and returns reply', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(sendCharacterChat).mockResolvedValue({ reply: 'Hello there!', sessionId: 7 });
    const res = await request(a.server)
      .post('/api/chat/character/1')
      .send({ worldId: 1, message: 'hi' })
      .expect(200);
    expect(res.body.data).toEqual({ reply: 'Hello there!', sessionId: 7 });
  });
});

describe('GET /api/chat/character/:id/history', () => {
  it('returns 400 for invalid sessionId', async () => {
    const a = await readyApp();
    const res = await request(a.server)
      .get('/api/chat/character/1/history')
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns chat history', async () => {
    const a = await readyApp();
    const history = [
      { id: 1, role: 'user', content: 'hi', createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, role: 'assistant', content: 'hello', createdAt: '2024-01-01T00:00:01Z' },
    ];
    vi.mocked(getChatHistory).mockResolvedValue(history as any);
    const res = await request(a.server)
      .get('/api/chat/character/1/history?sessionId=7')
      .expect(200);
    expect(res.body.data).toEqual(history);
  });
});