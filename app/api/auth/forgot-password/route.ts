import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid registered email address.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || 'https://tradigoo.vercel.app';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/reset-password`,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Unable to send password reset email.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset instructions sent to ${email}.`,
    });
  } catch (err: any) {
    console.error('[forgot-password] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
