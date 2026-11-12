import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { resolveEffectiveRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden. Founder privileges required.' }, { status: 403 });
    }

    const admin = createServiceClient();
    const [profilesRes, productsRes, ordersRes, disputesRes] = await Promise.all([
      admin
        .from('profiles')
        .select('id, email, name, role, phone, business_name, business_type, location, trust_score, gst_number, gst_verified, is_low_trust, total_orders, successful_orders, disputed_orders, created_at')
        .order('created_at', { ascending: false }),
      admin
        .from('products')
        .select('id, name, category, base_price, unit, min_order_quantity, image_url, is_active, seller_id, created_at, seller:profiles!seller_id(business_name, name, gst_verified)')
        .order('created_at', { ascending: false }),
      admin
        .from('orders')
        .select('id, status, total_amount, quantity, created_at, buyer:profiles!buyer_id(business_name, name, email), seller:profiles!seller_id(business_name, name, email), product:products!product_id(name)')
        .order('created_at', { ascending: false })
        .limit(100),
      admin
        .from('disputes')
        .select('id, order_id, raised_by, reason, status, resolution_notes, created_at')
        .order('created_at', { ascending: false }),
    ]);

    const users = (profilesRes.data || []).map((u) => ({
      ...u,
      effectiveRole: resolveEffectiveRole(u.email, u.role),
    }));

    return NextResponse.json({
      users,
      products: productsRes.data || [],
      orders: ordersRes.data || [],
      disputes: disputesRes.data || [],
    });
  } catch (error: any) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'founder') {
      return NextResponse.json({ error: 'Forbidden. Founder privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, gst_verified, is_low_trust, trust_score, gst_number } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (gst_verified !== undefined) updates.gst_verified = Boolean(gst_verified);
    if (is_low_trust !== undefined) updates.is_low_trust = Boolean(is_low_trust);
    if (gst_number !== undefined) updates.gst_number = gst_number ? String(gst_number).trim() : null;
    if (trust_score !== undefined) {
      const score = Number(trust_score);
      if (!isNaN(score)) {
        updates.trust_score = Math.min(1000, Math.max(0, Math.round(score)));
      }
    }

    const admin = createServiceClient();
    const { data, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}
