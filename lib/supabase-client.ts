import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { capacitorSupabaseStorage } from './capacitor-storage';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://skcbzqbtjdctpxtgglbv.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrY2J6cWJ0amRjdHB4dGdnbGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNzMzNjEsImV4cCI6MjA4MzY0OTM2MX0.qP9uYxXRD8pYYG1pLK49HHZ3BD9wEPny2v4gQAClC7Q';

let browserClient: SupabaseClient | undefined;

/**
 * Returns a singleton Supabase client.
 *
 * Uses @supabase/supabase-js directly so that auth.storage (capacitorSupabaseStorage)
 * is fully respected and persists session data across app restarts, process kills,
 * and page navigations on both web and Capacitor Android/iOS.
 */
export function createClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // SSR context — create a lightweight client
    return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: capacitorSupabaseStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }

  return browserClient;
}

export { warmUpCapacitorStorage } from './capacitor-storage';
