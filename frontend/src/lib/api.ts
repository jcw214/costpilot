export async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`/api${path}${query}`);
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
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: '알 수 없는 오류' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
