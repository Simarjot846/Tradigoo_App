import { createServiceClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = createServiceClient();

    // 1. Check profiles table (case-insensitive)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, business_name')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (profile) {
      return NextResponse.json({
        exists: true,
        message: 'This email is already registered. Please log in instead.',
        role: profile.role,
      });
    }

    // 2. Check auth.users via admin API
    try {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

      if (!listError && users && users.length > 0) {
        const found = users.find(u => u.email?.toLowerCase() === cleanEmail);
        if (found) {
          return NextResponse.json({
            exists: true,
            message: 'This email is already registered. Please log in instead.',
          });
        }
      }
    } catch (adminErr) {
      // Non-fatal if listUsers is restricted, profile check above is primary
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
