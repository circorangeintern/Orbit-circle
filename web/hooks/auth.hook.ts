import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
const AUTH_BASE = `${API_URL}/auth`;

const TOKEN_KEY = 'careermap_token';
const COOKIE_KEY = 'careermap_token';

// ---- token storage --------------------------------------------------------
// Guarded for Next.js SSR -- localStorage doesn't exist on the server, so
// every read/write checks `typeof window` first to avoid a build-time crash.

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  setCookie(COOKIE_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  deleteCookie(COOKIE_KEY);
}

// ---- shared authenticated fetch --------------------------------------------
// Attaches the Bearer token automatically so individual hooks don't repeat
// this logic. Throws a parsed error message on any non-2xx response.

async function authFetch(path: string, options: RequestInit = {}) {
  const token = getToken();

  const response = await fetch(`${AUTH_BASE}${path}`, {
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
      // response body wasn't JSON -- fall back to the generic message above
    }
    throw new Error(message);
  }

  return response.json();
}

// ---- queries / mutations ---------------------------------------------------

export function useGetMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await authFetch('/profile');
      return data.user ? data.user : data;
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 1000 * 60 * 5
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fullName,
      email,
      password
    }: {
      fullName: string;
      email: string;
      password: string;
    }) => {
      const data = await authFetch('/signup', {
        method: 'POST',
        body: JSON.stringify({ full_name: fullName, email, password })
      });
      const token = data.token ?? data.accessToken ?? data.access_token;
      if (token) setToken(token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const data = await authFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const token = data.token ?? data.accessToken ?? data.access_token;
      if (token) setToken(token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      // JWT auth is stateless -- there may be nothing for the backend to do
      // here at all. If you don't have a /logout endpoint, delete this fetch
      // call entirely and just clear the token below.
      try {
        await authFetch('/logout', { method: 'POST' });
      } catch {
        // even if the backend call fails, still clear the local token below
      }
    },
    onSuccess: () => {
      clearToken();
      queryClient.clear(); // wipe all cached data, not just ['me']
    }
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword
    }: {
      currentPassword: string;
      newPassword: string;
    }) =>
      authFetch('/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      })
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      authFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword })
      })
  });
}