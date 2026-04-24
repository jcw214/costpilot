export interface AuthUser {
  token: string;
  username: string;
  displayName: string;
  role: string;
}

const AUTH_KEY = 'costpilot_auth';

export function getStoredAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthToken(): string | null {
  return getStoredAuth()?.token ?? null;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: '로그인 실패' }));
    throw new Error(err.message || '로그인 실패');
  }
  const user: AuthUser = await res.json();
  setStoredAuth(user);
  return user;
}

export function logout(): void {
  clearStoredAuth();
  window.location.href = '/login';
}
