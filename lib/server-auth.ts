import { headers } from 'next/headers';
import { createClient, createServiceClient } from './supabase-server';
import { resolveEffectiveRole } from './roles';
import type { User, UserRole } from './supabase';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

export interface AuthenticatedSession {
  authUser: SupabaseAuthUser;
  profile: User | null;
  role: UserRole;
  userId: string;
  email: string;
}

export async function getAuthenticatedSession(): Promise<AuthenticatedSession | null> {
  try {
    const supabase = await createClient();
    let authUser: SupabaseAuthUser | null = null;

    // 1. Prefer explicit Bearer token from Authorization header (survives cookie size/stale issues)
    let bearerToken: string | undefined;
    try {
      const headerStore = await headers();
      const rawAuth = headerStore.get('authorization') || headerStore.get('Authorization') || '';
      if (rawAuth.toLowerCase().startsWith('bearer ')) {
        bearerToken = rawAuth.slice(7).trim();
      }
    } catch {}

    if (bearerToken) {
      const { data: tokenData, error: tokenError } = await supabase.auth.getUser(bearerToken);
      if (!tokenError && tokenData?.user) {
        authUser = tokenData.user;
      }
    }

    // 2. Fallback to SSR cookies
    if (!authUser) {
      const { data: cookieData, error: cookieError } = await supabase.auth.getUser();
      if (!cookieError && cookieData?.user) {
        authUser = cookieData.user;
      }
    }

    if (!authUser) {
      return null;
    }

    const admin = createServiceClient();
    let { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!profile && authUser.email) {
      const { data: emailProfile } = await admin
        .from('profiles')
        .select('*')
        .ilike('email', authUser.email.trim())
        .maybeSingle();
      profile = emailProfile;
    }

    const effectiveRole = resolveEffectiveRole(
      authUser.email || profile?.email,
      profile?.role || (authUser.user_metadata?.role as string | undefined)
    );

    const mergedProfile: User | null = profile
      ? {
          ...profile,
          email: (authUser.email || profile.email || '').toLowerCase(),
          role: effectiveRole,
        }
      : null;

    return {
      authUser,
      profile: mergedProfile,
      role: effectiveRole,
      userId: authUser.id,
      email: (authUser.email || profile?.email || '').toLowerCase(),
    };
  } catch (err) {
    console.error('[server-auth] Session resolution error:', err);
    return null;
  }
}
