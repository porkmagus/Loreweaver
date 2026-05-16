import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWorldStats } from '../services/worldService.js';

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockInnerJoin = vi.fn();

vi.mock('../db/client.js', () => {
  return {
    db: {
      select: () => ({ from: mockFrom }),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getWorldStats', () => {
  it('returns aggregated counts for a world', async () => {
    mockFrom.mockImplementation(() => ({
      where: mockWhere,
      innerJoin: mockInnerJoin,
    }));

    mockInnerJoin.mockImplementation(() => ({ where: mockWhere }));

    let whereCall = 0;
    mockWhere.mockImplementation(() => {
      whereCall += 1;
      // Query order: characters count, lore count, timeline rows, chat count
      if (whereCall === 1) return Promise.resolve([{ value: 3 }]);
      if (whereCall === 2) return Promise.resolve([{ value: 5 }]);
      if (whereCall === 3) return Promise.resolve([{ id: 1 }, { id: 2 }]);
      return Promise.resolve([{ value: 2 }]);
    });

    const stats = await getWorldStats(1);
    expect(stats).toEqual({
      worldId: 1,
      characters: 3,
      loreEntries: 5,
      timelineEvents: 2,
      chatSessions: 2,
    });
  });
});
