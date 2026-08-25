import { getToken } from '@/hooks/auth.hook';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
const API_BASE = `${API_URL}`;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const error = await response.json();
      message = error.message || message;
    } catch {
      // non-JSON error body -- fall back to generic message
    }
    throw new Error(message);
  }

  return response.json();
}