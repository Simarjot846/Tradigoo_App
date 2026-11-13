import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createServiceClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select(
        'id, email, role, name, phone, business_name, location, gst_number, gst_verified, business_type, business_address, pin_code, business_description, trust_score, total_orders, successful_orders, disputed_orders'
      )
      .eq('id', session.userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        user: {
          id: session.userId,
          email: session.email,
          role: session.role,
          name: session.email.split('@')[0],
          business_name: '',
          location: 'India',
          trust_score: 500,
          total_orders: 0,
          successful_orders: 0,
          disputed_orders: 0,
          gst_verified: false,
        },
      });
    }

    return NextResponse.json({
      user: {
        ...profile,
        role: session.role,
      },
    });
  } catch (err: any) {
    console.error('[profile GET] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.name = body.name.trim();
    }
    if (body.phone !== undefined) {
      updates.phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
    }
    if (typeof body.business_name === 'string') {
      updates.business_name = body.business_name.trim();
    }
    if (typeof body.location === 'string' && body.location.trim()) {
      updates.location = body.location.trim();
    }
    if (body.gst_number !== undefined) {
      const gst = typeof body.gst_number === 'string' ? body.gst_number.trim().toUpperCase() : '';
      updates.gst_number = gst || null;
    }
    if (body.business_type !== undefined) {
      updates.business_type = typeof body.business_type === 'string' ? body.business_type.trim() || null : null;
    }
    if (body.business_address !== undefined) {
      updates.business_address = typeof body.business_address === 'string' ? body.business_address.trim() || null : null;
    }
    if (body.pin_code !== undefined) {
      updates.pin_code = typeof body.pin_code === 'string' ? body.pin_code.trim() || null : null;
    }
    if (body.business_description !== undefined) {
      updates.business_description = typeof body.business_description === 'string' ? body.business_description.trim() || null : null;
    }

    const admin = createServiceClient();
    const { data: updated, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', session.userId)
      .select(
        'id, email, role, name, phone, business_name, location, gst_number, gst_verified, business_type, business_address, pin_code, business_description, trust_score, total_orders, successful_orders, disputed_orders'
      )
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updated,
        role: session.role,
      },
    });
  } catch (err: any) {
    console.error('[profile PATCH] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
