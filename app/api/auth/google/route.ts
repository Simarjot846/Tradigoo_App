import { createServiceClient, createClientWithCookieCollector } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, accessToken, role = 'retailer', name, email: bodyEmail, businessName, phone, location } = body;

    const supabaseAdmin = createServiceClient();
    const { supabase, cookieActions } = await createClientWithCookieCollector();

    let user: any = null;
    let sessionToken: string | null = null;
    let authSession: any = null;

    // 1. Authenticate with accessToken (from Supabase OAuth callback)
    if (accessToken) {
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data?.user) {
        user = data.user;
        sessionToken = accessToken;
        if (typeof body.refreshToken === 'string' && body.refreshToken.trim()) {
          try {
            const { data: setSessionData } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: body.refreshToken.trim(),
            });
            if (setSessionData?.session) {
              authSession = setSessionData.session;
              sessionToken = setSessionData.session.access_token;
            }
          } catch {}
        }
      }
    }

    // 2. Authenticate with Google ID Token (from Google Play Services / Credential Manager)
    if (!user && idToken) {
      try {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
        if (!error && data?.user) {
          user = data.user;
          authSession = data.session || null;
          sessionToken = data.session?.access_token || null;
        }
      } catch (err) {
        console.warn('[Google Auth Route] signInWithIdToken fallback:', err);
      }
    }

    // 3. Fallback: If direct Google account email/JWT was provided
    if (!user && (bodyEmail || idToken)) {
      let extractedEmail = bodyEmail;
      let extractedName = name;
      if (idToken && typeof idToken === 'string' && idToken.includes('.')) {
        try {
          const parts = idToken.split('.');
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          if (payload.email) extractedEmail = payload.email;
          if (payload.name) extractedName = payload.name;
        } catch {}
      }

      if (extractedEmail) {
        const cleanEmail = extractedEmail.toLowerCase().trim();
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .ilike('email', cleanEmail)
          .maybeSingle();

        if (existingProfile) {
          user = {
            id: existingProfile.id,
            email: existingProfile.email,
            user_metadata: {
              name: existingProfile.name,
              role: existingProfile.role,
              business_name: existingProfile.business_name,
              location: existingProfile.location,
            },
          };
        } else {
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }).catch(() => ({ data: { users: [] } }));
          const authUser = users?.find(u => u.email?.toLowerCase() === cleanEmail);
          const userId = authUser?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const newProfile = {
            id: userId,
            email: cleanEmail,
            role: role === 'wholesaler' ? 'wholesaler' : 'retailer',
            name: extractedName || cleanEmail.split('@')[0],
            phone: phone || null,
            business_name: businessName || `${extractedName || 'Partner'} Enterprise`,
            location: location || 'India',
            trust_score: 500,
            total_orders: 0,
            successful_orders: 0,
            disputed_orders: 0,
          };

          const { error: insertErr } = await supabaseAdmin.from('profiles').insert(newProfile);
          if (insertErr) {
            console.warn('Profile insert note:', insertErr);
          }

          user = {
            id: userId,
            email: cleanEmail,
            user_metadata: {
              name: newProfile.name,
              role: newProfile.role,
              business_name: newProfile.business_name,
              location: newProfile.location,
            },
          };
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Google authentication could not be verified. Please try again.' },
        { status: 401 }
      );
    }

    // 4. Retrieve or guarantee the user profile in database
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    let userRole = role === 'wholesaler' ? 'wholesaler' : 'retailer';
    const userEmail = (user.email || '').toLowerCase().trim();
    if (userEmail === 'simarjotkaur514@gmail.com') {
      userRole = 'founder';
    } else if (userEmail === 'tradigoobackendemployee@gmail.com') {
      userRole = 'employee';
    }

    let userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Tradigoo Partner';
    let userBusinessName = user.user_metadata?.business_name || '';
    let userLocation = user.user_metadata?.location || 'India';

    if (profile) {
      if (userRole === 'founder' || userRole === 'employee') {
        if (profile.role !== userRole) {
          await supabaseAdmin.from('profiles').update({ role: userRole }).eq('id', user.id);
        }
      } else {
        userRole = profile.role || userRole;
      }
      userName = profile.name || userName;
      userBusinessName = profile.business_name || userBusinessName;
      userLocation = profile.location || userLocation;
    } else {
      const { error: profileCreateErr } = await supabaseAdmin.from('profiles').insert({
        id: user.id,
        email: (user.email || '').toLowerCase(),
        role: userRole,
        name: userName,
        phone: phone || null,
        business_name: userBusinessName || `${userName} Enterprise`,
        location: userLocation,
        trust_score: 500,
        total_orders: 0,
        successful_orders: 0,
        disputed_orders: 0,
      });
      if (profileCreateErr) {
        console.warn('Google profile creation notice:', profileCreateErr);
      }
    }

    const apiUser = {
      id: user.id,
      email: user.email,
      role: userRole,
      user_metadata: {
        name: userName,
        role: userRole,
        business_name: userBusinessName,
        location: userLocation,
        phone: profile?.phone || phone || null,
        trust_score: profile?.trust_score ?? 500,
        total_orders: profile?.total_orders ?? 0,
        successful_orders: profile?.successful_orders ?? 0,
        disputed_orders: profile?.disputed_orders ?? 0,
        gst_number: profile?.gst_number || null,
        gst_verified: Boolean(profile?.gst_verified),
      },
    };

    const response = NextResponse.json({
      user: apiUser,
      token: sessionToken,
      session: authSession,
      message: 'Google authentication successful',
    });

    if (cookieActions && cookieActions.length) {
      for (const action of cookieActions) {
        try {
          response.cookies.set({
            name: action.name,
            value: action.value,
            ...(action.options || {}),
          });
        } catch {}
      }
    }

    return response;
  } catch (error: any) {
    console.error('Google Auth Route Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal authentication error' },
      { status: 500 }
    );
  }
}
