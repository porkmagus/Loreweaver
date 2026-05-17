import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import request from 'supertest';
import { buildApp } from '../index.js';
import { listCharacters, getCharacterById } from '../services/characterService.js';
import { listRelationships, getRelationshipsForCharacter } from '../services/relationshipService.js';
import { resolveProviderConfig, testProviderConnection } from '../services/provider.js';
import { resolveImageProviderConfig, testImageProviderConnection } from '../services/imageProvider.js';
import { updateProviderConfig, updateImageProviderConfig } from '../services/runtimeConfig.js';
import {
  sendCharacterChat,
  getChatHistory,
  streamCharacterChat,
  buildCognitionContext,
  getLatestSessionForCharacter,
  listCharacterChatSessions,
} from '../services/chatService.js';

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

vi.mock('../services/relationshipService.js', () => ({
  listRelationships: vi.fn(),
  getRelationshipsForCharacter: vi.fn(),
}));

vi.mock('../services/provider.js', () => ({
  ProviderConfigSchema: z.object({
    provider: z.enum(['custom-openai', 'ollama', 'openrouter']),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
    chatModel: z.string().min(1),
    embeddingModel: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().positive().optional(),
  }),
  resolveProviderConfig: vi.fn(),
  hasLiveProvider: vi.fn().mockReturnValue(true),
  testProviderConnection: vi.fn(),
}));

vi.mock('../services/imageProvider.js', () => ({
  ImageProviderConfigSchema: z.object({
    provider: z.string(),
    baseUrl: z.string().optional(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
    size: z.string().optional(),
    quality: z.string().optional(),
    format: z.string().optional(),
    enabled: z.boolean().optional().default(true),
  }),
  resolveImageProviderConfig: vi.fn(),
  testImageProviderConnection: vi.fn(),
}));

vi.mock('../services/runtimeConfig.js', () => ({
  updateProviderConfig: vi.fn(),
  updateImageProviderConfig: vi.fn(),
}));

vi.mock('../services/chatService.js', () => ({
  sendCharacterChat: vi.fn(),
  getChatHistory: vi.fn(),
  getChatSessionSummary: vi.fn(),
  streamCharacterChat: vi.fn(),
  buildCognitionContext: vi.fn(),
  getOrCreateSession: vi.fn().mockResolvedValue({ id: 7 }),
  getLatestSessionForCharacter: vi.fn(),
  listCharacterChatSessions: vi.fn(),
  toCognitionSnapshot: vi.fn((cognition: unknown) => cognition),
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
    vi.mocked(resolveProviderConfig).mockReturnValue({
      provider: 'custom-openai',
      baseUrl: 'http://localhost:1234/v1',
      chatModel: 'gpt-4o-mini',
    } as any);
    vi.mocked(testProviderConnection).mockResolvedValue({
      ok: true, provider: 'custom-openai', streaming: true, model: 'gpt-4o-mini',
    });
    vi.mocked(resolveImageProviderConfig).mockReturnValue({
      provider: 'openai-image', enabled: false, model: '',
    } as any);
    const res = await request(a.server)
      .get('/api/health')
      .expect(200);
    expect(res.body).toHaveProperty('status');
  });
});

describe('GET /api/worlds', () => {
  it('lists worlds', async () => {
    const a = await readyApp();
    mockFrom.mockReturnValue({ orderBy: mockOrderBy, limit: mockLimit, offset: mockOffset });
    mockOrderBy.mockReturnValue({ limit: mockLimit, offset: mockOffset });
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

  it('streams chat events as SSE', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(streamCharacterChat).mockImplementation(async function* () {
      yield { type: 'retrieved', lore: [], memories: [] };
      yield { type: 'token', content: 'Hello' };
      yield {
        type: 'done',
        sessionId: 7,
        effects: { timelineCreated: false, memoryCreated: false, topic: 'greeting', relationshipUpdates: [] },
      };
    } as any);

    const res = await request(a.server)
      .post('/api/chat/character/1/stream')
      .send({ worldId: 1, message: 'hi' })
      .expect(200);

    expect(res.text).toContain('data: {"type":"token","content":"Hello"}');
    expect(res.text).toContain('"type":"done"');
  });

  it('returns cognition context', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(buildCognitionContext).mockResolvedValue({
      prompt: 'SYSTEM\n...',
      aiMode: 'simulated',
      retrievedLore: [],
      retrievedMemories: [],
      relationships: [],
      timeline: [],
      history: [],
    } as any);

    const res = await request(a.server)
      .post('/api/chat/character/1/cognition')
      .send({ worldId: 1, message: 'hi' })
      .expect(200);

    expect(res.body.data.prompt).toBe('SYSTEM\n...');
  });
});

describe('GET /api/chat/character/:id/history', () => {
  it('resolves latest session when sessionId omitted and returns history', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(getLatestSessionForCharacter).mockResolvedValue({ id: 7, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() } as any);
    const history = [
      { id: 1, role: 'user', content: 'hi', createdAt: '2024-01-01T00:00:00Z' },
      { id: 2, role: 'assistant', content: 'hello', createdAt: '2024-01-01T00:00:01Z' },
    ];
    vi.mocked(getChatHistory).mockResolvedValue(history as any);
    const res = await request(a.server)
      .get('/api/chat/character/1/history')
      .expect(200);
    expect(res.body.data).toEqual(history);
    expect(getLatestSessionForCharacter).toHaveBeenCalledWith(1);
    expect(getChatHistory).toHaveBeenCalledWith(7);
  });

  it('returns empty history when no session exists and sessionId omitted', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(getLatestSessionForCharacter).mockResolvedValue(null as any);
    const res = await request(a.server)
      .get('/api/chat/character/1/history')
      .expect(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns chat history with explicit sessionId', async () => {
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

describe('GET /api/chat/character/:id/sessions', () => {
  it('returns sessions for a character', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    const sessions = [
      { id: 7, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-02T00:00:00Z' },
    ];
    vi.mocked(listCharacterChatSessions).mockResolvedValue(sessions as any);
    const res = await request(a.server)
      .get('/api/chat/character/1/sessions')
      .expect(200);
    expect(res.body.data).toEqual(sessions);
    expect(listCharacterChatSessions).toHaveBeenCalledWith(1);
  });

  it('returns 404 when character not found', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue(null as any);
    const res = await request(a.server)
      .get('/api/chat/character/1/sessions')
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/relationships', () => {
  it('lists relationships', async () => {
    const a = await readyApp();
    vi.mocked(listRelationships).mockResolvedValue([{ id: 1, fromCharacterId: 1, toCharacterId: 2 } as any]);
    const res = await request(a.server)
      .get('/api/relationships')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, fromCharacterId: 1, toCharacterId: 2 }]);
  });
});

describe('GET /api/relationships/character/:characterId', () => {
  it('returns relationships for a character', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue({ id: 1, worldId: 1, name: 'Alice' } as any);
    vi.mocked(getRelationshipsForCharacter).mockResolvedValue([{ id: 1, fromCharacterId: 1, toCharacterId: 2 } as any]);
    const res = await request(a.server)
      .get('/api/relationships/character/1')
      .expect(200);
    expect(res.body.data).toEqual([{ id: 1, fromCharacterId: 1, toCharacterId: 2 }]);
  });

  it('returns 404 when character not found', async () => {
    const a = await readyApp();
    vi.mocked(getCharacterById).mockResolvedValue(null as any);
    const res = await request(a.server)
      .get('/api/relationships/character/1')
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/settings/provider', () => {
  it('returns provider config', async () => {
    const a = await readyApp();
    vi.mocked(resolveProviderConfig).mockReturnValue({ provider: 'openai', chatModel: 'gpt-4o-mini' } as any);
    const res = await request(a.server)
      .get('/api/settings/provider')
      .expect(200);
    expect(res.body.data).toEqual({ provider: 'openai', chatModel: 'gpt-4o-mini' });
  });
});

describe('POST /api/settings/provider/test', () => {
  it('returns connection status', async () => {
    const a = await readyApp();
    vi.mocked(testProviderConnection).mockResolvedValue({ ok: true, provider: 'custom-openai', streaming: true });
    const res = await request(a.server)
      .post('/api/settings/provider/test')
      .send({ provider: 'custom-openai', chatModel: 'gpt-4o-mini' })
      .expect(200);
    expect(res.body.data).toEqual({ ok: true, provider: 'custom-openai', streaming: true });
  });
});

describe('GET /api/settings/image-provider', () => {
  it('returns image provider config', async () => {
    const a = await readyApp();
    vi.mocked(resolveImageProviderConfig).mockReturnValue({ provider: 'openai-image', enabled: true } as any);
    const res = await request(a.server)
      .get('/api/settings/image-provider')
      .expect(200);
    expect(res.body.data).toEqual({ provider: 'openai-image', enabled: true });
  });
});

describe('POST /api/dev/reset', () => {
  it('resets data in non-production', async () => {
    const a = await readyApp();
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      const res = await request(a.server)
        .post('/api/dev/reset')
        .expect(200);
      expect(res.body.data.reset).toBe(true);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('returns 403 in production', async () => {
    const a = await readyApp();
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const res = await request(a.server)
        .post('/api/dev/reset')
        .expect(403);
      expect(res.body.code).toBe('FORBIDDEN');
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});
