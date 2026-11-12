import { createClient } from './supabase-client';

const processedKeys = new Set<string>();

/**
 * Handles OAuth callbacks (PKCE code exchange & hash token setSession) safely
 * with deduplication lock across native deep links and web router navigations.
 */
export async function processOAuthCallback(
  urlOrSearchParams: string | URLSearchParams
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  let code: string | null = null;
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

  if (typeof urlOrSearchParams === 'string') {
    const rawUrl = urlOrSearchParams;
    if (rawUrl.includes('#')) {
      const hashStr = rawUrl.split('#')[1];
      const params = new URLSearchParams(hashStr);
      accessToken = params.get('access_token');
      refreshToken = params.get('refresh_token');
    }
    const searchStr = rawUrl.includes('?') ? rawUrl.split('?')[1] : rawUrl;
    const params = new URLSearchParams(searchStr);
    if (!code) code = params.get('code');
    if (!accessToken) accessToken = params.get('access_token');
    if (!refreshToken) refreshToken = params.get('refresh_token');
  } else {
    code = urlOrSearchParams.get('code');
    accessToken = urlOrSearchParams.get('access_token');
    refreshToken = urlOrSearchParams.get('refresh_token');

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashStr = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hashStr);
      if (!accessToken) accessToken = hashParams.get('access_token');
      if (!refreshToken) refreshToken = hashParams.get('refresh_token');
    }
  }

  // 1. Process hash token set if present
  if (accessToken && refreshToken) {
    const key = `token:${accessToken.slice(-12)}`;
    if (processedKeys.has(key)) {
      const { data: { session } } = await supabase.auth.getSession();
      return { success: !!session };
    }
    processedKeys.add(key);

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error && data?.session) {
      await autoCreateProfile(supabase, data.session.user);
      return { success: true };
    }
  }

  // 2. Process PKCE authorization code if present
  if (code) {
    const key = `code:${code}`;
    if (processedKeys.has(key)) {
      const { data: { session } } = await supabase.auth.getSession();
      return { success: !!session };
    }
    processedKeys.add(key);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session) {
      await autoCreateProfile(supabase, data.session.user);
      return { success: true };
    } else if (error) {
      console.warn('[OAuth] Code exchange notice:', error.message);
    }
  }

  // 3. Fallback check existing session
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await autoCreateProfile(supabase, session.user);
    return { success: true };
  }

  return { success: false, error: 'No valid authorization session found' };
}

async function autoCreateProfile(supabase: any, user: any) {
  if (!user) return;
  try {
    let pendingRole = 'retailer';
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('tradigoo_pending_oauth_role');
      if (role === 'wholesaler' || role === 'retailer') {
        pendingRole = role;
        localStorage.removeItem('tradigoo_pending_oauth_role');
      }
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, role, name, email, business_name, location, trust_score')
      .eq('id', user.id)
      .maybeSingle();

    if (!existing) {
      const newProfile = {
        id: user.id,
        email: (user.email || '').toLowerCase(),
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Trader',
        role: pendingRole,
        business_name: user.user_metadata?.business_name || '',
        location: user.user_metadata?.location || 'India',
        trust_score: 500,
        total_orders: 0,
        successful_orders: 0,
        disputed_orders: 0,
      };

      await supabase.from('profiles').insert(newProfile);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`tradigoo_cached_profile_${user.id}`, JSON.stringify(newProfile));
        } catch {}
      }

      await supabase.auth.updateUser({ data: { role: pendingRole } }).catch(() => {});
    } else {
      // Profile exists! Cache it to prevent role flickering
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`tradigoo_cached_profile_${user.id}`, JSON.stringify(existing));
        } catch {}
      }

      if (existing.role && user.user_metadata?.role !== existing.role) {
        await supabase.auth.updateUser({ data: { role: existing.role } }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('[OAuth] Profile check notice:', err);
  }
}
