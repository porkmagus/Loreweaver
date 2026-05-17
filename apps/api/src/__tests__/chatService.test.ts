import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  saveMessage,
  getLatestSessionForCharacter,
  listCharacterChatSessions,
  getOrCreateSession,
  getChatHistory,
} from '../services/chatService.js';

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();
const mockSet = vi.fn();

vi.mock('../db/client.js', () => {
  return {
    db: {
      select: () => ({ from: mockFrom }),
      insert: () => ({ values: mockValues }),
      update: () => ({ set: mockSet }),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getOrCreateSession', () => {
  it('returns existing session when one matches', async () => {
    const session = { id: 7, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() };
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([session]);

    const result = await getOrCreateSession(1, 1, null);
    expect(result).toEqual(session);
  });

  it('creates a new session when none exists', async () => {
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);

    const created = { id: 8, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() };
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([created]);

    const result = await getOrCreateSession(1, 1, null);
    expect(result).toEqual(created);
  });
});

describe('saveMessage', () => {
  it('inserts message and bumps session updated_at', async () => {
    const msg = { id: 1, sessionId: 7, role: 'user', content: 'hi', metadata: null, createdAt: new Date() };
    mockValues.mockReturnValue({ returning: mockReturning });
    mockReturning.mockResolvedValue([msg]);
    mockSet.mockReturnValue({ where: mockWhere });
    mockWhere.mockResolvedValue(undefined);

    const result = await saveMessage(7, 'user', 'hi');
    expect(result).toEqual(msg);
    expect(mockSet).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
  });
});

describe('getLatestSessionForCharacter', () => {
  it('returns the most recently updated session', async () => {
    const session = { id: 7, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() };
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([session]);

    const result = await getLatestSessionForCharacter(1);
    expect(result).toEqual(session);
  });

  it('returns null when no sessions exist', async () => {
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]);

    const result = await getLatestSessionForCharacter(1);
    expect(result).toBeNull();
  });
});

describe('listCharacterChatSessions', () => {
  it('returns sessions ordered by updatedAt desc', async () => {
    const sessions = [
      { id: 7, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() },
      { id: 6, characterId: 1, worldId: 1, userId: null, title: null, summary: null, createdAt: new Date(), updatedAt: new Date() },
    ];
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue(sessions);

    const result = await listCharacterChatSessions(1);
    expect(result).toEqual(sessions);
  });
});

describe('getChatHistory', () => {
  it('returns messages for a session', async () => {
    const messages = [
      { id: 1, sessionId: 7, role: 'user', content: 'hi', createdAt: new Date() },
      { id: 2, sessionId: 7, role: 'assistant', content: 'hello', createdAt: new Date() },
    ];
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue(messages);

    const result = await getChatHistory(7);
    expect(result).toEqual(messages);
  });
});
