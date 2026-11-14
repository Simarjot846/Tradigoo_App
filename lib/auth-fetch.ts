'use client';

import { createClient } from '@/lib/supabase-client';

let inflightRefresh: Promise<string | null> | null = null;

async function refreshAccessToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const supabase = createClient();

  if (!forceRefresh) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const expiresAtMs = (session.expires_at ?? 0) * 1000;
        if (!expiresAtMs || expiresAtMs - Date.now() > 90_000) {
          return session.access_token;
        }
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
 * 3. Retries once on 401 after refreshing the token; notifies AuthProvider if unrecoverable.
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

  if (response.status === 401 && typeof window !== 'undefined') {
    const freshToken = await refreshAccessToken(true);
    if (freshToken) {
      response = await fetch(input, {
        ...init,
        credentials: 'include',
        headers: buildHeaders(freshToken),
      });
    }

    if (response.status === 401 && token) {
      window.dispatchEvent(new CustomEvent('tradigoo:session-expired'));
    }
  }

  return response;
}
