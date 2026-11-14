import { createClientWithCookieCollector } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { supabase, cookieActions } = await createClientWithCookieCollector();
    const body = await request.json().catch(() => ({}));
    const refreshToken =
      typeof body?.refresh_token === 'string' && body.refresh_token.trim()
        ? body.refresh_token.trim()
        : undefined;

    const { data, error } = refreshToken
      ? await supabase.auth.refreshSession({ refresh_token: refreshToken })
      : await supabase.auth.refreshSession();

    if (error) {
      const msg = (error.message || '').toLowerCase();
      const isAuthFailure =
        msg.includes('refresh') ||
        msg.includes('session') ||
        msg.includes('jwt') ||
        msg.includes('expired') ||
        error.status === 400 ||
        error.status === 401;
      return NextResponse.json(
        { error: error.message || 'Session expired. Please sign in again.' },
        { status: isAuthFailure ? 401 : 500 }
      );
    }

    if (!data?.session) {
      return NextResponse.json({ error: 'No active session' }, { status: 401 });
    }

    const response = NextResponse.json({
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? null,
      session: data.session,
      user: data.user,
    });

    if (cookieActions && cookieActions.length) {
      for (const action of cookieActions) {
        try {
          response.cookies.set({
            name: action.name,
            value: action.value,
            ...(action.options || {}),
          });
        } catch (e) {
          console.warn('Failed to apply cookie action in refresh:', action.name, e);
        }
      }
    }

    return response;
  } catch (err) {
    console.error('Unexpected error in refresh route:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
