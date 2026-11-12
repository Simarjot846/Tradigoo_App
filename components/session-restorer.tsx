'use client';

/**
 * SessionRestorer - Runs before anything else on every page in Capacitor.
 *
 * Problem: In Capacitor remote-URL mode, every page navigation is a fresh JS
 * execution context. The Supabase client singleton is recreated, and it reads
 * the session from storage synchronously. If @capacitor/preferences hasn't
 * been flushed to our in-memory cache yet, the client sees no session and the
 * auth context declares the user logged out → auth-guard redirects to login.
 *
 * Solution: This component runs useEffect BEFORE AuthProvider's useEffect
 * (React guarantees children effects fire before parent effects when nested,
 * but here we mount it as a sibling — so we use a module-level promise to
 * ensure warm-up completes before auth reads happen).
 */

import { useEffect } from 'react';

// Module-level: track if warm-up has completed in this JS execution context
let warmUpDone = false;
let warmUpPromise: Promise<void> | null = null;

export function getOrStartWarmUp(): Promise<void> {
  if (warmUpDone) return Promise.resolve();
  if (warmUpPromise) return warmUpPromise;

  warmUpPromise = (async () => {
    if (typeof window === 'undefined') return;
    try {
      const { warmUpCapacitorStorage } = await import('@/lib/supabase-client');
      await warmUpCapacitorStorage();
    } catch {
      // Non-critical — auth context will handle gracefully
    } finally {
      warmUpDone = true;
    }
  })();

  return warmUpPromise;
}

// Kick off warm-up immediately when this module is imported (not just when
// the component mounts) so it runs as early as possible.
if (typeof window !== 'undefined') {
  getOrStartWarmUp();
}

export function SessionRestorer() {
  useEffect(() => {
    // Ensure warm-up is triggered (idempotent — safe to call multiple times)
    getOrStartWarmUp();
  }, []);

  return null;
}
