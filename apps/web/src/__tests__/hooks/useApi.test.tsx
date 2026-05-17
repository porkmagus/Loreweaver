import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useApi, apiPost, apiPatch, apiDelete } from '@/hooks/useApi';

const base = 'http://localhost:3001/api';

describe('useApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches data successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ id: 1, name: 'Azeroth' }] }),
    } as Response);

    const { result } = renderHook(() => useApi('/worlds'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1, name: 'Azeroth' }]);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHook(() => useApi('/worlds'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('500');
  });

  it('returns null data when url is null', () => {
    const { result } = renderHook(() => useApi(null));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

describe('apiPost', () => {
  it('posts and returns data', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 2 } }),
    } as Response);

    const res = await apiPost('/worlds', { name: 'Westeros' });
    expect(res).toEqual({ id: 2 });
    expect(fetch).toHaveBeenCalledWith(
      `${base}/worlds`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('throws on error response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Bad Request' }),
    } as Response);

    await expect(apiPost('/worlds', {})).rejects.toThrow('Bad Request');
  });
});

describe('apiDelete', () => {
  it('deletes successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true } as Response);
    await apiDelete('/worlds/1');
    expect(fetch).toHaveBeenCalledWith(`${base}/worlds/1`, expect.objectContaining({ method: 'DELETE' }));
  });
});
