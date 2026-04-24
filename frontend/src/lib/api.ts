import { getAuthToken } from './auth';

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`/api${path}${query}`, {
    headers: authHeaders(),
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('인증이 필요합니다.');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '알 수 없는 오류' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  return res.json();
}

export async function mutateApi<T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('인증이 필요합니다.');
  }
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '알 수 없는 오류' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
