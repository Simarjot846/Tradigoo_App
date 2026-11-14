'use client';

import { createClient } from '@/lib/supabase-client';

let inflightRefresh: Promise<string | null> | null = null;

function decodeJwtExpMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const decoded = atob(padded);
    const payload = JSON.parse(decoded);
    if (typeof payload?.exp === 'number') {
      return payload.exp * 1000;
    }
    return null;
  } catch {
    return null;
  }
}

function isTokenExpiringSoon(accessToken: string, expiresAtSec?: number | null, bufferMs = 120_000): boolean {
  const fromSession = expiresAtSec ? expiresAtSec * 1000 : null;
  const fromJwt = decodeJwtExpMs(accessToken);
  const expMs = fromJwt || fromSession;
  if (!expMs) return false;
  return expMs - Date.now() <= bufferMs;
}

async function isJwtExpiredErrorResponse(res: Response): Promise<boolean> {
  if (res.status === 401) return true;
  if (res.status !== 400 && res.status !== 403 && res.status !== 500) return false;
  try {
    const text = (await res.clone().text()).toLowerCase();
    return (
      text.includes('jwt expired') ||
      text.includes('token is expired') ||
      text.includes('pgrst301') ||
      text.includes('invalid jwt')
    );
  } catch {
    return false;
  }
}

export async function refreshAccessToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const supabase = createClient();

  if (!forceRefresh) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && !isTokenExpiringSoon(session.access_token, session.expires_at)) {
        return session.access_token;
      }
    } catch {}
  }

  if (inflightRefresh) {
    return inflightRefresh;
  }

  inflightRefresh = (async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data?.session?.access_token) {
        return data.session.access_token;
      }

      // Fallback: attempt server-side cookie/token refresh
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          currentSession?.refresh_token
            ? { refresh_token: currentSession.refresh_token }
            : {}
        ),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json().catch(() => null);
        if (refreshData?.session?.access_token && refreshData?.session?.refresh_token) {
          await supabase.auth.setSession({
            access_token: refreshData.session.access_token,
            refresh_token: refreshData.session.refresh_token,
          });
          return refreshData.session.access_token as string;
        }
      }

      return null;
    } catch {
      return null;
    } finally {
      inflightRefresh = null;
    }
  })();

  return inflightRefresh;
}

/**
 * Authenticated fetch helper that:
 * 1. Proactively refreshes near-expiry Supabase JWTs (single-flight deduplicated).
 * 2. Attaches `Authorization: Bearer <access_token>` and `credentials: 'include'`.
 * 3. Retries once on 401 or JWT-expired responses after refreshing the token; notifies AuthProvider if unrecoverable.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const token = await refreshAccessToken(false);

  const buildHeaders = (accessToken: string | null) => {
    const merged = new Headers(init.headers);
    if (accessToken && !merged.has('Authorization')) {
      merged.set('Authorization', `Bearer ${accessToken}`);
    }
    return merged;
  };

  let response = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: buildHeaders(token),
  });

  if (typeof window !== 'undefined' && (await isJwtExpiredErrorResponse(response))) {
    const freshToken = await refreshAccessToken(true);
    if (freshToken) {
      const retryHeaders = new Headers(init.headers);
      retryHeaders.set('Authorization', `Bearer ${freshToken}`);
      response = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: retryHeaders,
      });
    }

    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('tradigoo:session-expired'));
    }
  }

  return response;
}
