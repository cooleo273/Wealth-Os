import { ApiError } from '@wealth/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}/api/v1${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorBody: ApiError | null = null;
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse error
    }
    throw new FetchError(
      errorBody?.message ?? `HTTP ${res.status}`,
      res.status,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export function getAuthHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, {
      method: 'GET',
      headers: token ? getAuthHeader(token) : {},
    }),

  post: <T>(endpoint: string, body?: unknown, token?: string) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: token ? getAuthHeader(token) : {},
    }),

  patch: <T>(endpoint: string, body?: unknown, token?: string) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers: token ? getAuthHeader(token) : {},
    }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? getAuthHeader(token) : {},
    }),
};

export { FetchError };
