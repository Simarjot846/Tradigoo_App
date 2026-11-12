/**
 * Capacitor-aware Supabase storage adapter.
 *
 * Multi-layer persistence strategy:
 * 1. Synchronous in-memory cache (0ms lookup, required by Supabase auth init)
 * 2. window.localStorage (persists across page navigations in web and WebView)
 * 3. @capacitor/preferences (SQLite-backed native storage, survives app restarts, process kills, device reboots)
 * 4. document.cookie synchronization (ensures Next.js API routes and server components receive auth cookies)
 */

import type { SupportedStorage } from '@supabase/supabase-js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCapacitorNative(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // @ts-ignore
    return !!(window.Capacitor?.isNativePlatform?.());
  } catch {
    return false;
  }
}

// ─── In-memory sync cache ─────────────────────────────────────────────────────

const memoryCache: Record<string, string> = {};

// ─── Cookie synchronization helper ───────────────────────────────────────────

function syncToCookie(key: string, value: string | null) {
  if (typeof document === 'undefined') return;
  try {
    if (value === null) {
      document.cookie = `${encodeURIComponent(key)}=; Path=/; Max-Age=0; SameSite=Lax`;
    } else {
      // 1 year max-age for session persistence
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const secureFlag = isSecure ? '; Secure' : '';
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secureFlag}`;
    }
  } catch {
    // Non-critical cookie failure
  }
}

// ─── The SupportedStorage implementation ──────────────────────────────────────

export const capacitorSupabaseStorage: SupportedStorage = {
  getItem(key: string): string | null {
    // 1. Check synchronous in-memory cache first
    if (memoryCache[key] !== undefined && memoryCache[key] !== null) {
      return memoryCache[key];
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const localVal = window.localStorage.getItem(key);
        if (localVal !== null) {
          memoryCache[key] = localVal;
          return localVal;
        }
      } catch {}
    }

    return null;
  },

  setItem(key: string, value: string): void {
    // 1. Update memory cache immediately
    memoryCache[key] = value;

    // 2. Update localStorage synchronously
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch {}
    }

    // 3. Update @capacitor/preferences asynchronously for native persistence
    if (isCapacitorNative()) {
      import('@capacitor/preferences')
        .then(({ Preferences }) => Preferences.set({ key, value }))
        .catch(() => {});
    }

    // 4. Sync to cookie so Next.js server components / API routes get credentials
    if (key.startsWith('sb-') || key.startsWith('supabase')) {
      syncToCookie(key, value);
    }
  },

  removeItem(key: string): void {
    delete memoryCache[key];

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch {}
    }

    if (isCapacitorNative()) {
      import('@capacitor/preferences')
        .then(({ Preferences }) => Preferences.remove({ key }))
        .catch(() => {});
    }

    if (key.startsWith('sb-') || key.startsWith('supabase')) {
      syncToCookie(key, null);
    }
  },
};

// ─── Warm-up: load all Supabase keys from Preferences & localStorage into cache ─
const SUPABASE_KEY_PREFIXES = ['sb-', 'supabase'];

export async function warmUpCapacitorStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  // 1. First warm up from window.localStorage (instant)
  try {
    if (window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && SUPABASE_KEY_PREFIXES.some(p => key.startsWith(p))) {
          const val = window.localStorage.getItem(key);
          if (val !== null) {
            memoryCache[key] = val;
            syncToCookie(key, val);
          }
        }
      }
    }
  } catch {}

  // 2. If running inside Capacitor native, load from Preferences (SQLite)
  if (isCapacitorNative()) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { keys } = await Preferences.keys();

      await Promise.all(
        keys
          .filter(k => SUPABASE_KEY_PREFIXES.some(p => k.startsWith(p)))
          .map(async key => {
            const { value } = await Preferences.get({ key });
            if (value !== null) {
              memoryCache[key] = value;
              // Backfill to localStorage if missing
              try {
                if (window.localStorage && !window.localStorage.getItem(key)) {
                  window.localStorage.setItem(key, value);
                }
              } catch {}
              syncToCookie(key, value);
            }
          })
      );
    } catch {
      // Preferences failure non-fatal
    }
  }
}
