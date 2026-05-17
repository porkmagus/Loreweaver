import { useState, useEffect, useCallback, useRef } from 'react';

const FALLBACK_BASE = typeof window === 'undefined'
  ? 'http://localhost:3001'
  : `${window.location.protocol}//${window.location.hostname}:3001`;
const RAW_BASE = (import.meta.env.VITE_API_URL ?? FALLBACK_BASE).replace(/\/$/, '');
export const API_BASE = RAW_BASE + '/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(url: string | null): ApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<ApiState<T>>({ data: null, loading: !!url, error: null });
  const urlRef = useRef(url);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (!url) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    const currentFetch = ++fetchCountRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}${url}`);
      if (currentFetch !== fetchCountRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (currentFetch !== fetchCountRef.current) return;
      setState({ data: json.data ?? json, loading: false, error: null });
    } catch (err) {
      if (currentFetch !== fetchCountRef.current) return;
      setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }, [url]);

  useEffect(() => {
    if (url !== urlRef.current) {
      urlRef.current = url;
      if (!url) {
        setState({ data: null, loading: false, error: null });
        return;
      }
      setState({ data: null, loading: true, error: null });
    }
    fetchData();
  }, [fetchData, url]);

  return { ...state, refetch: fetchData };
}

const DEFAULT_TIMEOUT_MS = 15_000;

function fetchWithTimeout(url: string, init?: RequestInit & { timeout?: number }): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT_MS, ...rest } = init ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  if (rest.signal) {
    rest.signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return fetch(url, { ...rest, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function apiPost<T>(url: string, body: unknown, opts?: { timeout?: number }): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeout: opts?.timeout,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetchWithTimeout(`${API_BASE}${url}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export async function apiDelete(url: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}${url}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
}
