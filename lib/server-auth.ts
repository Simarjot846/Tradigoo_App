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
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) {
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
