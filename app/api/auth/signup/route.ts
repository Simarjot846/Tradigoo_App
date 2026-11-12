import { createServiceClient, createClientWithCookieCollector } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, userData } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const { supabase, cookieActions } = await createClientWithCookieCollector();
    const supabaseAdmin = createServiceClient();

    // 1. Strict pre-check: verify email does not exist in profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead.' },
        { status: 409 }
      );
    }

    // 2. Strict pre-check: verify email does not exist in auth.users
    try {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (users && users.some(u => u.email?.toLowerCase() === cleanEmail)) {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in instead.' },
          { status: 409 }
        );
      }
    } catch {}

    // 3. Attempt Supabase signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tradigoo-production.up.railway.app'}/auth/callback`,
        data: {
          name: userData?.name || '',
          role: userData?.role || 'retailer',
          business_name: userData?.business_name || '',
          phone: userData?.phone || null,
          location: userData?.location || 'India',
        }
      },
    });

    if (authError) {
      const msg = (authError.message || '').toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Signup failed to return user data' },
        { status: 500 }
      );
    }

    // 4. Supabase anti-enumeration check: empty identities means email was already registered
    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'This email is already registered. Please log in instead.' },
        { status: 409 }
      );
    }

    // 5. Create user profile using Service Role (bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: cleanEmail,
        role: userData?.role || 'retailer',
        name: userData?.name || cleanEmail.split('@')[0],
        phone: userData?.phone || null,
        business_name: userData?.business_name || '',
        location: userData?.location || 'India',
        trust_score: 500,
        total_orders: 0,
        successful_orders: 0,
        disputed_orders: 0,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      const profileMsg = (profileError.message || '').toLowerCase();
      if (profileMsg.includes('unique') || profileMsg.includes('duplicate') || profileMsg.includes('profiles_email')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please log in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // 6. Build response with cookie actions
    const response = NextResponse.json({
      user: authData.user,
      message: 'Account created successfully'
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
          console.warn('Failed to apply cookie action', action.name, e);
        }
      }
    }

    return response;

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
