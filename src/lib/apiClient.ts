const tokenKey = 'closing-gap-session-token';

export interface AuthProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'staff';
}

export interface AuthSession {
  token: string;
  profile: AuthProfile;
}

export function getStoredToken() {
  return localStorage.getItem(tokenKey);
}

export function storeToken(token: string) {
  localStorage.setItem(tokenKey, token);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? 'Request failed.');
  }

  return payload as T;
}

export async function checkApiHealth() {
  return apiFetch<{ configured: boolean; provider: 'neon' }>('/api/health');
}

export async function login(email: string, password: string) {
  const session = await apiFetch<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  storeToken(session.token);
  return session;
}

export async function getCurrentProfile() {
  return apiFetch<{ profile: AuthProfile }>('/api/auth/me');
}

export function logout() {
  clearToken();
}
