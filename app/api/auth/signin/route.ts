import { createClientWithCookieCollector } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { supabase, cookieActions } = await createClientWithCookieCollector();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ error: error.message || 'Sign in failed' }, { status: 400 });
    }

    // Fetch user profile from database to get genuine role and business details
    const { createServiceClient } = await import('@/lib/supabase-server');
    const supabaseAdmin = createServiceClient();
    const cleanEmail = email.toLowerCase().trim();

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    let assignedRole = profile?.role || 'retailer';
    if (cleanEmail === 'simarjotkaur514@gmail.com') {
      assignedRole = 'founder';
    } else if (cleanEmail === 'tradigoobackendemployee@gmail.com') {
      assignedRole = 'employee';
    }

    // Keep database in sync if privileged role
    if (profile && profile.role !== assignedRole && (assignedRole === 'founder' || assignedRole === 'employee')) {
      await supabaseAdmin.from('profiles').update({ role: assignedRole }).eq('id', data.user.id);
    }

    const enrichedUser = {
      ...data.user,
      role: assignedRole,
      user_metadata: {
        ...(data.user.user_metadata || {}),
        role: assignedRole,
        name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
        business_name: profile?.business_name || data.user.user_metadata?.business_name || '',
        location: profile?.location || data.user.user_metadata?.location || 'India',
        trust_score: profile?.trust_score ?? 500,
        phone: profile?.phone || data.user.user_metadata?.phone || '',
      },
    };

    const response = NextResponse.json({
      user: enrichedUser,
      token: data.session?.access_token || null,
      session: data.session || null
    });

    if (cookieActions && cookieActions.length) {
      for (const action of cookieActions) {
        try {
          response.cookies.set({ name: action.name, value: action.value, ...(action.options || {}) });
        } catch (e) {
          console.warn('Failed to apply sign-in cookie action', action.name, e);
        }
      }
    }

    return response;
  } catch (err) {
    console.error('Signin route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
